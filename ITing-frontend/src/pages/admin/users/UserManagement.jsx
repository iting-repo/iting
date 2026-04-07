import React, { useEffect, useMemo, useState } from "react";
import {
    FaSearch,
    FaDownload,
    FaEye,
    FaTrash,
    FaBan,
    FaUnlock,
    FaUsers,
    FaEllipsisV,
    FaUpload,
    FaCheckSquare,
    FaBan as FaBanIcon,
    FaTrashAlt,
} from "react-icons/fa";
import ImportExcelModal from "../../../components/admin/ImportExcelModal";
import { toast } from "sonner";
import {
    Pagination,
    Button,
    Input,
    Card,
    Table,
    Td,
    Dialog,
} from "../../../components";
import adminUserService from "../../../services/adminUserService";

const PAGE_SIZE = 10;

const RoleBadge = ({ role }) => {
    const map = {
        USER: "bg-blue-50 text-blue-700 border border-blue-200",
        EMPLOYER: "bg-sky-50 text-sky-700 border border-sky-200",
        ADMIN: "bg-amber-50 text-amber-700 border border-amber-200",
    };

    const labelMap = {
        USER: "Ứng viên",
        EMPLOYER: "Nhà tuyển dụng",
        ADMIN: "Admin",
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

const UserRowActionMenu = ({
    user,
    openMenuId,
    setOpenMenuId,
    onViewDetail,
    onAction,
}) => {
    const isOpen = openMenuId === user.id;

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setOpenMenuId(isOpen ? null : user.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
                <FaEllipsisV size={12} />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    <button
                        onClick={() => {
                            onViewDetail(user);
                            setOpenMenuId(null);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                        <FaEye size={13} />
                        Xem chi tiết
                    </button>

                    {user.status === "ACTIVE" && (
                        <button
                            onClick={() => {
                                onAction(user, "ban");
                                setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-orange-600 hover:bg-orange-50"
                        >
                            <FaBan size={13} />
                            Khóa tài khoản
                        </button>
                    )}

                    {user.status === "BANNED" && (
                        <button
                            onClick={() => {
                                onAction(user, "unban");
                                setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-green-600 hover:bg-green-50"
                        >
                            <FaUnlock size={13} />
                            Mở khóa tài khoản
                        </button>
                    )}

                    <button
                        onClick={() => {
                            onAction(user, "delete");
                            setOpenMenuId(null);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                        <FaTrash size={13} />
                        Xóa người dùng
                    </button>
                </div>
            )}
        </div>
    );
};

const UserDetailDialog = ({ user, open, onClose, formatDateTime, getDisplayName }) => {
    if (!user) return null;

    return (
        <Dialog open={open} onClose={onClose} title="Chi tiết người dùng">
            <div className="space-y-4">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                    <img
                        src={
                            user.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                getDisplayName(user)
                            )}&background=random`
                        }
                        alt={getDisplayName(user)}
                        className="h-14 w-14 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">{getDisplayName(user)}</h3>
                        <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 p-3">
                        <p className="mb-1 text-xs text-slate-500">ID</p>
                        <p className="font-medium text-slate-800">#{user.id}</p>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3">
                        <p className="mb-1 text-xs text-slate-500">Vai trò</p>
                        <RoleBadge role={user.role} />
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3">
                        <p className="mb-1 text-xs text-slate-500">Trạng thái</p>
                        <StatusBadge status={user.status} />
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3">
                        <p className="mb-1 text-xs text-slate-500">Email</p>
                        <p className="break-all font-medium text-slate-800">{user.email || "—"}</p>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3">
                        <p className="mb-1 text-xs text-slate-500">Created At</p>
                        <p className="font-medium text-slate-800">{formatDateTime(user.createdAt)}</p>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3">
                        <p className="mb-1 text-xs text-slate-500">Last Login At</p>
                        <p className="font-medium text-slate-800">{formatDateTime(user.lastLoginAt)}</p>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3 md:col-span-2">
                        <p className="mb-1 text-xs text-slate-500">Tên hiển thị</p>
                        <p className="font-medium text-slate-800">{getDisplayName(user)}</p>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

const UserActionDialog = ({
    actionDialog,
    actionNote,
    setActionNote,
    onClose,
    onConfirm,
    getDisplayName,
}) => {
    if (!actionDialog?.user || !actionDialog?.action) return null;

    const { user, action } = actionDialog;

    const actionConfig = {
        ban: {
            title: "Khóa tài khoản",
            buttonText: "Xác nhận khóa",
            buttonClass: "bg-orange-500 hover:bg-orange-600 text-white",
            description: "Nhập lý do khóa tài khoản người dùng này.",
            needReason: true,
        },
        unban: {
            title: "Mở khóa tài khoản",
            buttonText: "Xác nhận mở khóa",
            buttonClass: "bg-green-500 hover:bg-green-600 text-white",
            description: "Bạn có chắc muốn mở khóa tài khoản này không?",
            needReason: false,
        },
        delete: {
            title: "Xóa người dùng",
            buttonText: "Xác nhận xóa",
            buttonClass: "bg-red-500 hover:bg-red-600 text-white",
            description: "Hành động này sẽ xóa vĩnh viễn người dùng khỏi hệ thống.",
            needReason: false,
        },
    };

    const config = actionConfig[action];

    return (
        <Dialog open={!!actionDialog} onClose={onClose} title={config.title}>
            <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    Đối tượng: <span className="font-semibold text-slate-800">{getDisplayName(user)}</span>
                    <div className="mt-1 text-xs text-slate-500">{user.email}</div>
                </div>

                <div>
                    <p className="text-sm text-slate-600">{config.description}</p>
                </div>

                {config.needReason && (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Lý do <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={actionNote}
                            onChange={(e) => setActionNote(e.target.value)}
                            placeholder="Nhập lý do..."
                            className="min-h-[110px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
                        />
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button
                        className={config.buttonClass}
                        onClick={onConfirm}
                        disabled={config.needReason && !actionNote.trim()}
                    >
                        {config.buttonText}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

const UserManagement = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [users, setUsers] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [searchInput, setSearchInput] = useState("");
    const [keyword, setKeyword] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [detailUser, setDetailUser] = useState(null);
    const [actionDialog, setActionDialog] = useState(null);
    const [actionNote, setActionNote] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const isAllSelected = users.length > 0 && selectedIds.length === users.length;

    const downloadBlob = (blob, filename) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    };

    const handleExportExcel = async () => {
        try {
            const res = await adminUserService.exportUsers();
            downloadBlob(res, "users_list.xlsx");
            toast.success("Xuất danh sách người dùng thành công!");
        } catch (error) {
            console.error("Lỗi xuất Excel:", error);
            toast.error("Không thể xuất file Excel.");
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const res = await adminUserService.downloadTemplate();
            downloadBlob(res, "user_import_template.xlsx");
        } catch (error) {
            console.error("Lỗi tải template:", error);
            toast.error("Không thể tải file mẫu.");
        }
    };

    const handleImportExcel = async (file) => {
        await adminUserService.importUsers(file);
        fetchUsers();
    };

    const buildParams = () => {
        const params = {
            page: currentPage - 1,
            size: PAGE_SIZE,
        };

        if (keyword?.trim()) params.keyword = keyword.trim();
        if (roleFilter !== "all") params.role = roleFilter;
        if (statusFilter !== "all") params.status = statusFilter;

        return params;
    };

    const fetchUsers = async () => {
        try {
            const params = buildParams();
            const res = await adminUserService.getUsers(params);

            setUsers(res?.content || []);
            setTotalElements(res?.totalElements || 0);
            setTotalPages(res?.totalPages || 1);
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers([]);
            setTotalElements(0);
            setTotalPages(1);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, keyword, roleFilter, statusFilter]);

    const handleSearch = () => {
        setCurrentPage(1);
        setKeyword(searchInput);
    };

    const handleResetFilter = () => {
        setSearchInput("");
        setKeyword("");
        setRoleFilter("all");
        setStatusFilter("all");
        setCurrentPage(1);
    };

    const handleOpenDetail = (user) => {
        setDetailUser(user);
    };

    const handleAction = (user, action) => {
        setActionDialog({ user, action });
        setActionNote("");
    };

    const confirmAction = async () => {
        if (!actionDialog?.user || !actionDialog?.action) return;

        try {
            const { user, action } = actionDialog;

            if (action === "ban") {
                await adminUserService.banUser(
                    user.id,
                    actionNote.trim() || "Vi phạm quy định hệ thống",
                    7
                );
            } else if (action === "unban") {
                await adminUserService.unbanUser(user.id);
            } else if (action === "delete") {
                await adminUserService.deleteUser(user.id);
            }

            setActionDialog(null);
            setActionNote("");
            fetchUsers();
            toast.success("Thao tác thành công!");
        } catch (error) {
            console.error("Error handling user action:", error);
            toast.error("Thao tác thất bại!");
        }
    };
    
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(users.map(u => u.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkAction = async (action) => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Bạn có chắc muốn thực hiện hành động này cho ${selectedIds.length} người dùng đã chọn?`)) return;

        try {
            if (action === 'ban') {
                await adminUserService.bulkBan(selectedIds);
            } else if (action === 'unban') {
                await adminUserService.bulkUnban(selectedIds);
            } else if (action === 'delete') {
                await adminUserService.bulkDelete(selectedIds);
            }
            
            toast.success(`Thanh công cho ${selectedIds.length} mục`);
            setSelectedIds([]);
            fetchUsers();
        } catch (error) {
            console.error("Bulk action error:", error);
            toast.error("Thao tác hàng loạt thất bại");
        }
    };

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
        return user.companyName || user.fullName || user.email?.split("@")[0] || "Unknown User";
    };

    const stats = useMemo(() => {
        return {
            activeCount: users.filter((u) => u.status === "ACTIVE").length,
            bannedCount: users.filter((u) => u.status === "BANNED").length,
        };
    }, [users]);

    return (
        <div className="space-y-4 p-6">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Quản lý người dùng</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Tổng cộng {totalElements} người dùng · Trang hiện tại có {stats.activeCount} active · {stats.bannedCount} bị khóa
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                        onClick={() => setShowImportModal(true)}
                    >
                        <FaUpload size={14} />
                        Nhập Excel
                    </Button>
                    <Button 
                        className="flex items-center gap-2 bg-[#1967D2] hover:bg-[#1452A8]"
                        onClick={handleExportExcel}
                    >
                        <FaDownload size={14} />
                        Xuất Excel
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="border border-slate-100 shadow-sm">
                <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                        <Input
                            className="pl-9"
                            placeholder="Tìm theo tên, email..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSearch();
                            }}
                        />
                    </div>

                    <select
                        className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-400"
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all">Tất cả vai trò</option>
                        <option value="USER">Ứng viên</option>
                        <option value="EMPLOYER">Nhà tuyển dụng</option>
                        <option value="ADMIN">Admin</option>
                    </select>

                    <select
                        className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-400"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="BANNED">Banned</option>
                        <option value="PENDING">Pending</option>
                    </select>

                    <Button className="bg-[#3AB4E6] hover:bg-[#2C9ACD]" onClick={handleSearch}>
                        Tìm kiếm
                    </Button>

                    <Button variant="outline" onClick={handleResetFilter}>
                        Đặt lại
                    </Button>
                </div>
            </Card>

            {/* Table */}
            <Card className="border border-slate-100 shadow-sm !p-0">
                <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
                    <FaUsers className="text-[#3AB4E6]" />
                    <span className="font-semibold text-slate-800">Danh sách người dùng</span>
                </div>

                <Table
                    headers={[
                        { 
                            label: (
                                <input 
                                    type="checkbox" 
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" 
                                />
                            ),
                            className: "w-10"
                        },
                        { label: "Mã", className: "w-20" },
                        { label: "Người dùng" },
                        { label: "Vai trò", className: "w-40" },
                        { label: "Trạng thái", className: "w-36" },
                        { label: "Created At", className: "w-48" },
                        { label: "Last Login At", className: "w-48" },
                        { label: "Thao tác", className: "text-right w-40" },
                    ]}
                >
                    {users.length === 0 ? (
                        <tr>
                            <Td colSpan={7} className="py-10 text-center text-slate-500">
                                Không tìm thấy người dùng nào
                            </Td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr 
                                key={user.id} 
                                className={`transition-colors hover:bg-slate-50/60 ${selectedIds.includes(user.id) ? 'bg-sky-50/50' : ''}`}
                            >
                                <Td>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.includes(user.id)}
                                        onChange={() => handleSelectOne(user.id)}
                                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" 
                                    />
                                </Td>
                                <Td className="font-mono text-xs text-slate-500">#{user.id}</Td>

                                <Td>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={
                                                user.avatarUrl ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                    getDisplayName(user)
                                                )}&background=random`
                                            }
                                            alt={getDisplayName(user)}
                                            className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                                        />
                                        <div>
                                            <p className="font-semibold text-slate-800">{getDisplayName(user)}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </Td>

                                <Td>
                                    <RoleBadge role={user.role} />
                                </Td>

                                <Td>
                                    <StatusBadge status={user.status} />
                                </Td>

                                <Td className="text-sm text-slate-500">
                                    {formatDateTime(user.createdAt)}
                                </Td>

                                <Td className="text-sm text-slate-500">
                                    {formatDateTime(user.lastLoginAt)}
                                </Td>

                                <Td className="text-right">
                                    <UserRowActionMenu
                                        user={user}
                                        openMenuId={openMenuId}
                                        setOpenMenuId={setOpenMenuId}
                                        onViewDetail={handleOpenDetail}
                                        onAction={handleAction}
                                    />
                                </Td>
                            </tr>
                        ))
                    )}
                </Table>

                <Pagination
                    totalItems={totalElements}
                    itemsPerPage={PAGE_SIZE}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </Card>

            <UserDetailDialog
                user={detailUser}
                open={!!detailUser}
                onClose={() => setDetailUser(null)}
                formatDateTime={formatDateTime}
                getDisplayName={getDisplayName}
            />

            <UserActionDialog
                actionDialog={actionDialog}
                actionNote={actionNote}
                setActionNote={setActionNote}
                onClose={() => {
                    setActionDialog(null);
                    setActionNote("");
                }}
                onConfirm={confirmAction}
                getDisplayName={getDisplayName}
            />

            <ImportExcelModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                title="Nhập người dùng từ Excel"
                resourceName="người dùng"
                onDownloadTemplate={handleDownloadTemplate}
                onImport={handleImportExcel}
            />

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-6 rounded-2xl border border-sky-100 bg-white px-6 py-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3 border-r border-slate-100 pr-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                            <FaCheckSquare className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Đã chọn {selectedIds.length} mục</p>
                            <button 
                                onClick={() => setSelectedIds([])}
                                className="text-xs font-medium text-sky-600 hover:underline"
                            >
                                Bỏ chọn tất cả
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleBulkAction('ban')}
                            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-600 hover:scale-105 active:scale-95"
                        >
                            <FaBanIcon className="h-3.5 w-3.5" />
                            Khóa hàng loạt
                        </button>
                        
                        <button
                            onClick={() => handleBulkAction('unban')}
                            className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-100 transition-all hover:bg-green-600 hover:scale-105 active:scale-95"
                        >
                            <FaUnlock className="h-3.5 w-3.5" />
                            Mở khóa hàng loạt
                        </button>

                        <button
                            onClick={() => handleBulkAction('delete')}
                            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-100 transition-all hover:bg-red-600 hover:scale-105 active:scale-95"
                        >
                            <FaTrashAlt className="h-3.5 w-3.5" />
                            Xóa hàng loạt
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;