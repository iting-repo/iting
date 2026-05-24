import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; 
import Footer from './Footer'; // 1. Import Footer
import { useLocation } from 'react-router-dom';

const MainLayout = () => {
  return (
    // Flex-col và min-h-screen giúp footer luôn nằm đáy
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      {/* HEADER (Sticky) */}
      <Header />

      {/* MAIN CONTENT */}
      {/* flex-grow đẩy footer xuống dưới cùng nếu nội dung ngắn */}
      <main className="flex-grow">
        {/* Giữ container nếu muốn nội dung căn giữa, hoặc bỏ đi nếu muốn full-width */}
        {/* Ở đây mình để full-width cho main, các trang con tự lo phần container của nó thì linh hoạt hơn */}
        <Outlet />
      </main>

      {/* FOOTER (Mới tích hợp) */}
      <Footer />

    </div>
  );
};

export default MainLayout;