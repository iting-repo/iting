import React, { useState, useEffect } from "react";
import StatsCard from "../../../../components/common/StatsCard";
import { FaShieldAlt as Shield, FaCog as Settings, FaUserSecret as UserSecret, FaDatabase as Database } from "react-icons/fa";
import adminAuditService from "../../../../services/adminAuditService";

export const AuditStats = () => {
  const [stats, setStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    systemLogs: 0,
    roleLogs: 0
  });

  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const response = await adminAuditService.fetchStats();
        setStats(response);
        setLastUpdate(new Date().toLocaleString('vi-VN', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          day: '2-digit', month: '2-digit', year: 'numeric'
        }));
      } catch (error) {
        console.error("Failed to fetch audit stats", error);
      }
    };
    
    fetchStatsData();
    // Có thể set interval ở đây nếu muốn real-time update
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard 
        title="Tổng nhật ký" 
        value={stats.totalLogs} 
        icon={<Database />} 
        footerLabel={lastUpdate ? `Cập nhật: ${lastUpdate}` : "Đang tải..."}
      />
      <StatsCard 
        title="Thao tác hôm nay" 
        value={stats.todayLogs} 
        icon={<Shield />} 
        footerLabel={lastUpdate ? `Cập nhật: ${lastUpdate}` : "Đang tải..."}
      />
      <StatsCard 
        title="Cấu hình hệ thống" 
        value={stats.systemLogs} 
        icon={<Settings />} 
        footerLabel="Biến động (Toàn thời gian)"
      />
      <StatsCard 
        title="Phân quyền (RBAC)" 
        value={stats.roleLogs} 
        icon={<UserSecret />} 
        footerLabel="Biến động (Toàn thời gian)"
      />
    </div>
  );
};
