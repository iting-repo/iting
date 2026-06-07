import React from 'react';
import maintenanceImg from '../../assets/maintainance_status.png';

/**
 * Màn hình toàn trang hiển thị khi hệ thống đang bảo trì (cho user thường).
 * Admin được bỏ qua màn hình này (xử lý ở App.jsx) để vẫn truy cập trang quản trị.
 * Hiển thị ảnh bảo trì (đã chứa sẵn thông điệp).
 */
const MaintenanceScreen = ({ message }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: 24,
      background: '#ffffff',
    }}
  >
    <img
      src={maintenanceImg}
      alt="Hệ thống đang bảo trì"
      style={{ maxWidth: 'min(90vw, 560px)', width: '100%', height: 'auto' }}
    />
    {message ? (
      <p
        style={{
          color: '#4a5568',
          fontSize: 16,
          lineHeight: 1.6,
          textAlign: 'center',
          maxWidth: 520,
        }}
      >
        {message}
      </p>
    ) : null}
  </div>
);

export default MaintenanceScreen;
