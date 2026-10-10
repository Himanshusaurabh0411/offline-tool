import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { I18nProvider } from './i18n';
import { networkMonitor } from './core/privacy/networkMonitor';
import { registerInitialPlugins } from './tools';

// 1. Initialize Network Egress Monitor (Guarantees zero-network leaks)
networkMonitor.init();

// 2. Register initial plugins
registerInitialPlugins();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
