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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // 2. Bọc Provider ra ngoài cùng (hoặc ngoài BrowserRouter)
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);