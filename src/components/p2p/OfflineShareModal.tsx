import React, { useState, useEffect, useRef } from 'react';
import { Share2, X, QrCode, ArrowRight, Download, Upload, CheckCircle2, Loader2, Wifi, Send } from 'lucide-react';
import QRCode from 'qrcode';
import { OfflineShareSession, PeerShareProgress } from '../../core/p2p/offlineShare';

interface OfflineShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFile?: File;
}

export const OfflineShareModal: React.FC<OfflineShareModalProps> = ({
  isOpen,
  onClose,
  initialFile,
}) => {
  const [mode, setMode] = useState<'send' | 'receive'>('send');
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile || null);
  const [offerToken, setOfferToken] = useState<string>('');
  const [answerToken, setAnswerToken] = useState<string>('');
  const [inputAnswer, setInputAnswer] = useState<string>('');
  const [inputOffer, setInputOffer] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [status, setStatus] = useState<string>('Ready');
  const [progress, setProgress] = useState<PeerShareProgress | null>(null);
  const [receivedFile, setReceivedFile] = useState<File | null>(null);

  const sessionRef = useRef<OfflineShareSession | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFile) setSelectedFile(initialFile);
  }, [initialFile]);

  useEffect(() => {
    if (!isOpen) {
      sessionRef.current?.close();
      sessionRef.current = null;
      setOfferToken('');
      setAnswerToken('');
      setProgress(null);
      setReceivedFile(null);
    }
  }, [isOpen]);

  // Sender starts pairing
  const handleStartSending = async () => {
    setStatus('Generating offline peer offer...');
    const session = new OfflineShareSession(
      setStatus,
      setProgress,
      setReceivedFile
    );
    sessionRef.current = session;

    try {
      const offer = await session.createSenderOffer();
      setOfferToken(offer);

      const qr = await QRCode.toDataURL(offer.substring(0, 1000), { width: 256, margin: 2 });
      setQrDataUrl(qr);
      setStatus('Waiting for peer to scan or paste token...');
    } catch (e: any) {
      setStatus(`Failed to create offer: ${e.message}`);
    }
  };

  // Sender connects Answer
  const handleConnectAnswer = async () => {
    if (!sessionRef.current || !inputAnswer) return;
    try {
      await sessionRef.current.finalizeAnswer(inputAnswer);
      setStatus('Peer paired! Sending file now...');
      if (selectedFile) {
        await sessionRef.current.sendFile(selectedFile);
        setStatus(`Successfully transferred ${selectedFile.name}!`);
      }
    } catch (e: any) {
      setStatus(`Pairing failed: ${e.message}`);
    }
  };

  // Receiver generates Answer
  const handleGenerateAnswer = async () => {
    if (!inputOffer) return;
    setStatus('Accepting offer and generating answer token...');
    const session = new OfflineShareSession(
      setStatus,
      setProgress,
      (f) => {
        setReceivedFile(f);
        setStatus(`Received ${f.name} successfully!`);
      }
    );
    sessionRef.current = session;

    try {
      const answer = await session.acceptOfferAndCreateAnswer(inputOffer);
      setAnswerToken(answer);
      const qr = await QRCode.toDataURL(answer.substring(0, 1000), { width: 256, margin: 2 });
      setQrDataUrl(qr);
      setStatus('Send this answer token back to sender.');
    } catch (e: any) {
      setStatus(`Failed to process offer: ${e.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                Offline Local Share (WebRTC)
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Zero Server
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Transfer files directly between devices on the same Wi-Fi / Hotspot with zero cloud relay.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setMode('send')}
            className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
              mode === 'send'
                ? 'border-b-2 border-slate-900 text-slate-900 bg-white font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Send File to Device
          </button>
          <button
            onClick={() => setMode('receive')}
            className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
              mode === 'receive'
                ? 'border-b-2 border-slate-900 text-slate-900 bg-white font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Receive File
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {mode === 'send' ? (
            <div className="space-y-4 text-xs">
              {/* File selector */}
              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                    }}
                  />
                  <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <span className="font-semibold text-slate-900 block">Select File to Send</span>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{selectedFile.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-slate-600 hover:text-slate-900"
                  >
                    Change
                  </button>
                </div>
              )}

              {!offerToken && selectedFile && (
                <button
                  onClick={handleStartSending}
                  className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs"
                >
                  Generate Offline Pairing Code
                </button>
              )}

              {/* Offer generated */}
              {offerToken && (
                <div className="space-y-4">
                  {qrDataUrl && (
                    <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl max-w-xs mx-auto shadow-2xs">
                      <img src={qrDataUrl} alt="Pairing QR" className="w-44 h-44" />
                      <span className="text-[11px] text-slate-600 font-medium mt-2">
                        Scan from receiver device
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] text-slate-600 font-medium block mb-1">
                      Paste Receiver's Answer Token to Complete Handshake:
                    </label>
                    <textarea
                      rows={2}
                      value={inputAnswer}
                      onChange={(e) => setInputAnswer(e.target.value)}
                      placeholder="Paste answer token here..."
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-[11px] text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
                    />
                    <button
                      onClick={handleConnectAnswer}
                      className="mt-2 w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs"
                    >
                      Connect & Stream File
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Receiver Mode */
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">
                  Step 1: Paste Sender's Offer Token
                </label>
                <textarea
                  rows={2}
                  value={inputOffer}
                  onChange={(e) => setInputOffer(e.target.value)}
                  placeholder="Paste offer token here..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-[11px] text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
                />
                {!answerToken && (
                  <button
                    onClick={handleGenerateAnswer}
                    disabled={!inputOffer}
                    className="mt-2 w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs shadow-xs"
                  >
                    Generate Response Answer Token
                  </button>
                )}
              </div>

              {answerToken && (
                <div className="space-y-2.5">
                  <span className="text-[11px] text-slate-700 font-medium block">
                    Step 2: Copy this Answer Token back to sender:
                  </span>
                  <textarea
                    readOnly
                    rows={2}
                    value={answerToken}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-[11px] text-slate-700 font-mono shadow-2xs"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(answerToken)}
                    className="w-full py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs"
                  >
                    Copy Answer Token
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Transfer Progress */}
          {progress && (
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs text-slate-700 font-medium">
                <span>Transferring {progress.fileName}...</span>
                <span className="font-mono">{progress.percent}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Received File Card */}
          {receivedFile && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-semibold text-xs text-slate-900">{receivedFile.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {(receivedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const url = URL.createObjectURL(receivedFile);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = receivedFile.name;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          )}

          {/* Status badge */}
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Status: {status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
