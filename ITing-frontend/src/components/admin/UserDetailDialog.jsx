import React from 'react';
import { Dialog, Button } from '../common';

const RoleBadge = ({ role }) => {
    const map = {
        USER: "bg-blue-50 text-blue-700 border border-blue-200",
        EMPLOYER: "bg-sky-50 text-sky-700 border border-sky-200",
        ADMIN: "bg-amber-50 text-amber-700 border border-amber-200",
    };

    const labelMap = {
        USER: "Ứng viên",
        EMPLOYER: "Nhà tuyển dụng",
        ADMIN: "Quản trị viên",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${map[role] || "bg-gray-50 text-gray-700 border border-gray-200"
                }`}
        >
            {labelMap[role] || role || "—"}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const map = {
        ACTIVE: "bg-green-50 text-green-700 border border-green-200",
        BANNED: "bg-red-50 text-red-700 border border-red-200",
        INACTIVE: "bg-gray-50 text-gray-700 border border-gray-200",
        PENDING: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] || "bg-gray-50 text-gray-700 border border-gray-200"
                }`}
        >
            {status || "UNKNOWN"}
        </span>
    );
};

export const UserDetailDialog = ({ user, open, onClose }) => {
    if (!user) return null;

    const formatDateTime = (value) => {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getDisplayName = (user) => {
        return user.companyName || user.fullName || user.email?.split("@")[0] || "Người dùng chưa xác định";
    };

    return (
        <Dialog open={open} onClose={onClose} title="Chi tiết người dùng">
            <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                    <img
                        src={
                            user.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                getDisplayName(user)
                            )}&background=random`
                        }
                        alt={getDisplayName(user)}
                        className="h-16 w-16 rounded-full border-2 border-slate-100 object-cover shadow-sm"
                    />
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">{getDisplayName(user)}</h3>
                        <p className="text-sm font-medium text-slate-500">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-slate-50/50 border border-slate-100 p-4">
                        <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã người dùng</p>
                        <p className="font-mono text-sm font-bold text-slate-700">#{user.id}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50/50 border border-slate-100 p-4">
                        <p className="mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vai trò hệ thống</p>
                        <RoleBadge role={user.role} />
                    </div>

                    <div className="rounded-xl bg-slate-50/50 border border-slate-100 p-4">
                        <p className="mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái tài khoản</p>
                        <StatusBadge status={user.status} />
                    </div>

                    <div className="rounded-xl bg-slate-50/50 border border-slate-100 p-4">
                        <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email liên hệ</p>
                        <p className="break-all text-sm font-bold text-slate-700">{user.email || "—"}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50/50 border border-slate-100 p-4">
                        <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngày đăng ký</p>
                        <p className="text-sm font-bold text-slate-700">{formatDateTime(user.createdAt)}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50/50 border border-slate-100 p-4">
                        <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lần đăng nhập cuối</p>
                        <p className="text-sm font-bold text-slate-700">{formatDateTime(user.lastLoginAt)}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" className="px-8 shadow-sm" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};
