import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; 
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

const MainLayout = () => {
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith('/messages');

  return (
    // Flex-col và min-h-screen giúp footer luôn nằm đáy (hoặc h-screen cho trang messages)
    <div className={`flex flex-col ${isMessagesPage ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-gray-50`}>
      
      {/* HEADER (Sticky) */}
      <Header />

      {/* MAIN CONTENT */}
      {/* flex-grow đẩy footer xuống dưới cùng nếu nội dung ngắn */}
      <main className="flex-grow flex flex-col min-h-0 relative">
        <Outlet />
      </main>

      {/* FOOTER (Ẩn ở trang Messages để full height cho chat) */}
      {!isMessagesPage && <Footer />}

    </div>
  );
};

export default MainLayout;