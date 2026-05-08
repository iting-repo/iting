// import React from "react";
// import { createRoot } from "react-dom/client";
// import App from "./App";
// import "./index.css"; // Import CSS để dùng Tailwind

// const container = document.getElementById("root");
// const root = createRoot(container);
// root.render(<App />);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// 1. Import Provider và store
import { Provider } from 'react-redux';
import store from './store/store';

import App from './App';
import './i18n';
import './index.css';

import { Toaster } from 'sonner';

import { GoogleOAuthProvider } from '@react-oauth/google';

// #region agent log
const __agentLog = (hypothesisId, message, data) => {
  try {
    fetch('http://127.0.0.1:7551/ingest/7a4fdce7-5a32-4f17-ae03-3125af2172e9', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '17ec69',
      },
      body: JSON.stringify({
        sessionId: '17ec69',
        runId: 'pre-fix',
        hypothesisId,
        location: 'src/index.js:agent',
        message,
        data,
        timestamp: Date.now(),
      }),
    }).catch(() => { });
  } catch { }
};

window.addEventListener('error', (event) => {
  __agentLog('H1', 'window.error', {
    pathname: window.location?.pathname,
    message: event?.message,
    filename: event?.filename,
    lineno: event?.lineno,
    colno: event?.colno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  __agentLog('H2', 'window.unhandledrejection', {
    pathname: window.location?.pathname,
    reason: String(event?.reason?.message || event?.reason || ''),
  });
});

__agentLog('H0', 'app.bootstrap', { pathname: window.location?.pathname });
// #endregion agent log

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="435696030871-3vk0212ha2spir23etro25cmub2nmdls.apps.googleusercontent.com">
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <App />
      </BrowserRouter>
    </Provider>
  </GoogleOAuthProvider>
);