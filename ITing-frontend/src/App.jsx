import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom'; // Import Router
import { useDispatch } from 'react-redux';
import AppRoutes from './routes/AppRoutes';       // Import file cấu hình route
import { checkAuth } from './store/auth/authSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <AppRoutes />
  );
}

export default App;