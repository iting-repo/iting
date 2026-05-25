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
import { setAutoFreeze } from 'immer';
import store from './store/store';

// Tắt immer auto-freeze. React 19 + react-redux 9 + immer 11 combo gây
// "Cannot assign to read only property 'lanes/pendingLanes' of FiberNode"
// khi state đi qua subscription chain trong commit phase — immer freeze
// sâu mọi object trong state, react fiber bị freeze gián tiếp khi state
// được pass qua props/context.
// Trade-off: state vẫn immutable theo convention (reducers chỉ mutate
// draft), không còn safety net catch direct mutation, nhưng React fiber
// không bị frozen nhầm.
setAutoFreeze(false);

import App from './App';
import './i18n';
import './index.css';

import { Toaster } from 'sonner';

import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <App />
      </BrowserRouter>
    </Provider>
  </GoogleOAuthProvider>
);