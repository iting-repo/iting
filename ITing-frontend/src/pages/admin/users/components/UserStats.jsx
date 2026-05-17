import React from "react";
import StatsCard from "../../../../components/common/StatsCard";
import {
    FaUsers,
    FaBan,
    FaWifi,
    FaUserTie,
} from "react-icons/fa";

/**
 * Thẻ số liệu tổng quan cho trang Quản lý người dùng.
 *
 * Props:
 *  - totalElements : tổng số người dùng (từ backend Page response)
 *  - onlineCount   : số người đang online (realtime)
 *  - users         : mảng người dùng trên trang hiện tại (để tính nhanh banned/employer)
 *  - totalBanned   : tổng số tài khoản bị khóa (nếu backend trả về, optional)
 */
export const UserStats = ({ totalElements = 0, onlineCount = 0, users = [] }) => {
    const bannedCount  = users.filter((u) => u.status === "BANNED").length;
    const employerCount = users.filter((u) => u.role === "EMPLOYER").length;

    const lastUpdate = new Date().toLocaleString("vi-VN", {
        hour:   "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day:    "2-digit",
        month:  "2-digit",
        year:   "numeric",
    });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatsCard
                title="Tổng người dùng"
                value={totalElements.toLocaleString("vi-VN")}
                icon={<FaUsers />}
                footerLabel={`Cập nhật: ${lastUpdate}`}
            />
            <StatsCard
                title="Đang online"
                value={onlineCount.toLocaleString("vi-VN")}
                icon={<FaWifi />}
                footerLabel="Thời gian thực"
                isIncrease={onlineCount > 0}
                percentage={totalElements > 0 ? ((onlineCount / totalElements) * 100).toFixed(1) : "0"}
            />
            <StatsCard
                title="Bị khóa (trang này)"
                value={bannedCount}
                icon={<FaBan />}
                isIncrease={false}
                percentage={users.length > 0 ? ((bannedCount / users.length) * 100).toFixed(1) : "0"}
                footerLabel={`Cập nhật: ${lastUpdate}`}
            />
            <StatsCard
                title="Nhà tuyển dụng (trang này)"
                value={employerCount}
                icon={<FaUserTie />}
                footerLabel={`Cập nhật: ${lastUpdate}`}
            />
        </div>
    );
};
