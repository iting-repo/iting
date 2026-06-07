import React from 'react';

/**
 * Màn hình toàn trang hiển thị khi hệ thống đang bảo trì (cho user thường).
 * Admin được bỏ qua màn hình này (xử lý ở App.jsx) để vẫn truy cập trang quản trị.
 */
const MaintenanceScreen = ({ message }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}
  >
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: '56px 40px',
        textAlign: 'center',
        maxWidth: 480,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          margin: '0 auto 20px',
          border: '4px solid #e2e8f0',
          borderTopColor: '#667eea',
          borderRadius: '50%',
          animation: 'iting-spin 1s linear infinite',
        }}
      />
      <h1 style={{ color: '#1a202c', fontSize: 26, fontWeight: 700, marginBottom: 14 }}>
        Đang bảo trì
      </h1>
      <p style={{ color: '#4a5568', fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
        {message || 'Hệ thống đang bảo trì. Vui lòng quay lại sau.'}
      </p>
      <div style={{ color: '#a0aec0', fontSize: 14 }}>ITing Vietnam</div>
      <style>{`@keyframes iting-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

export default MaintenanceScreen;
