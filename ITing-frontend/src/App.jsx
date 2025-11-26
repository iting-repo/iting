import React from 'react';
import { BrowserRouter } from 'react-router-dom'; // Import Router
import AppRoutes from './routes/AppRoutes';       // Import file cấu hình route

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;