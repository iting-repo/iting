import React, { useState, useEffect } from 'react';
import { FaStar, FaTrash, FaEnvelope, FaPhone, FaEye, FaUserTie, FaSearch, FaHeart, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'sonner';
import { Breadcrumb } from '../../components/common';
import favoriteCandidateService from '../../services/favoriteCandidateService';
import CandidateDetailModal from '../../components/employer/CandidateDetailModal';

const FavoriteCandidates = () => {
    const [favorites, setFavorites] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        setCurrentPage(1);
        // Đổi search term có thể ẩn 1 số candidate đang chọn → giữ lại lựa chọn
        // nhưng người dùng không thấy được, có thể gây nhầm lẫn. Tuỳ ý — giữ nguyên.
    }, [searchTerm]);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = () => {
        setFavorites(favoriteCandidateService.getFavorites());
    };

    const handleRemove = (candidateId) => {
        favoriteCandidateService.removeFavorite(candidateId);
        loadFavorites();
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(candidateId);
            return next;
        });
        toast('Đã xóa khỏi danh sách yêu thích.', { icon: '🗑️' });
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const clearSelection = () => setSelectedIds(new Set());

    const handleBulkDelete = () => {
        const ids = [...selectedIds];
        const removed = favoriteCandidateService.removeMany(ids);
        loadFavorites();
        setSelectedIds(new Set());
        setShowBulkConfirm(false);
        toast.success(`Đã xóa ${removed} ứng viên khỏi danh sách yêu thích.`);
    };

    const handleViewDetail = (candidate) => {
        setSelectedCandidate(candidate);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filtered = favorites.filter(c =>
        (c.applicantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedCandidates = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const pageIds = paginatedCandidates.map((c) => c.id);
    const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
    const selectionCount = selectedIds.size;

    const toggleSelectAllOnPage = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allOnPageSelected) {
                pageIds.forEach((id) => next.delete(id));
            } else {
                pageIds.forEach((id) => next.add(id));
            }
            return next;
        });
    };

    return (
        <div>
            <Breadcrumb 
                rootLabel="Tổng quan"
                rootLink="/employer/dashboard"
                items={[{ label: 'Ứng viên yêu thích' }]} 
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-500">
                            <FaHeart size={24} />
                        </div>
                        Ứng viên yêu thích
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 ml-[52px]">
                        {favorites.length} ứng viên đã được lưu
                    </p>
                </div>

                <div className="relative w-full sm:w-80">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên, email, vị trí..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#3AB4E6] focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {/* Bulk-action toolbar — chỉ hiện khi có ứng viên trong danh sách */}
            {favorites.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 px-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-600 font-medium">
                        <input
                            type="checkbox"
                            checked={allOnPageSelected}
                            onChange={toggleSelectAllOnPage}
                            disabled={pageIds.length === 0}
                            className="w-4 h-4 rounded border-gray-300 text-[#3AB4E6] focus:ring-[#3AB4E6]"
                        />
                        {allOnPageSelected
                            ? `Đã chọn tất cả ${pageIds.length} ứng viên trên trang`
                            : `Chọn tất cả ${pageIds.length} ứng viên trên trang`}
                    </label>

                    {selectionCount > 0 && (
                        <div className="flex items-center gap-3 animate-fade-in">
                            <span className="text-sm font-bold text-slate-700">
                                Đã chọn <span className="text-[#3AB4E6]">{selectionCount}</span>
                            </span>
                            <button
                                onClick={clearSelection}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                Bỏ chọn
                            </button>
                            <button
                                onClick={() => setShowBulkConfirm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-md shadow-red-100 transition-colors"
                            >
                                <FaTrash size={12} />
                                Xóa {selectionCount} đã chọn
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {favorites.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                    <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaStar className="text-amber-300" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có ứng viên yêu thích</h3>
                    <p className="text-slate-400 text-sm max-w-md mx-auto">
                        Khi xem hồ sơ ứng viên, hãy nhấn vào biểu tượng <FaStar className="inline text-amber-500" size={14} /> để lưu ứng viên vào danh sách yêu thích.
                    </p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaSearch className="text-gray-300" size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy kết quả</h3>
                    <p className="text-slate-400 text-sm">Không có ứng viên nào khớp với từ khóa "<span className="font-bold text-slate-600">{searchTerm}</span>"</p>
                </div>
            ) : (
                /* Candidate Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedCandidates.map((candidate) => {
                        const isSelected = selectedIds.has(candidate.id);
                        return (
                        <div
                            key={candidate.id}
                            className={`relative bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all group overflow-hidden ${
                                isSelected
                                    ? 'border-[#3AB4E6] ring-2 ring-[#3AB4E6]/20'
                                    : 'border-gray-100 hover:border-amber-100'
                            }`}
                        >
                            {/* Bulk-select checkbox — góc trên phải */}
                            <button
                                type="button"
                                onClick={() => toggleSelect(candidate.id)}
                                aria-label={isSelected ? 'Bỏ chọn ứng viên này' : 'Chọn ứng viên này'}
                                className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
                                    isSelected
                                        ? 'bg-[#3AB4E6] border-[#3AB4E6] text-white shadow-md'
                                        : 'bg-white border-gray-300 text-transparent hover:border-[#3AB4E6] opacity-0 group-hover:opacity-100'
                                }`}
                            >
                                <FaCheck size={11} />
                            </button>

                            {/* Card Header */}
                            <div className="p-6 pb-4">
                                <div className="flex items-start gap-4">
                                    <img
                                        src={candidate.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.applicantName || 'UV')}&background=random&bold=true`}
                                        alt={candidate.applicantName}
                                        className="w-14 h-14 rounded-2xl border-2 border-gray-100 object-cover bg-white shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 truncate group-hover:text-[#3AB4E6] transition-colors">
                                            {candidate.applicantName || 'Chưa cập nhật'}
                                        </h3>
                                        <p className="text-xs text-blue-600 font-bold mt-0.5 truncate">
                                            {candidate.jobTitle || 'Vị trí ứng tuyển'}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1.5">
                                            <FaStar className="text-amber-400" size={10} />
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                Yêu thích lúc {formatDate(candidate.favoritedAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="px-6 pb-4 space-y-2">
                                {candidate.email && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <FaEnvelope size={10} className="text-slate-300 shrink-0" />
                                        <span className="truncate">{candidate.email}</span>
                                    </div>
                                )}
                                {candidate.phoneNumber && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <FaPhone size={10} className="text-slate-300 shrink-0" />
                                        <span>{candidate.phoneNumber}</span>
                                    </div>
                                )}
                            </div>

                            {/* Card Footer Actions */}
                            <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50 flex items-center gap-2">
                                <button
                                    onClick={() => handleViewDetail(candidate)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#3AB4E6] text-white text-xs font-bold rounded-xl hover:bg-[#2da0d0] transition-all"
                                >
                                    <FaEye size={12} /> Xem hồ sơ
                                </button>
                                <button
                                    onClick={() => handleRemove(candidate.id)}
                                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="Xóa khỏi yêu thích"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-10 gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${currentPage === 1 ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-200 text-gray-400 hover:border-[#3AB4E6] hover:text-[#3AB4E6] bg-white'}`}
                    >
                        &lt;
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentPage(idx + 1)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border ${currentPage === idx + 1 ? 'bg-[#3AB4E6] border-[#3AB4E6] text-white shadow-lg shadow-blue-200' : 'bg-white border-transparent text-gray-500 hover:bg-gray-50'}`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${currentPage === totalPages ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-200 text-gray-400 hover:border-[#3AB4E6] hover:text-[#3AB4E6] bg-white'}`}
                    >
                        &gt;
                    </button>
                </div>
            )}

            {/* Candidate Detail Modal */}
            {selectedCandidate && (
                <CandidateDetailModal
                    candidate={selectedCandidate}
                    onClose={() => {
                        setSelectedCandidate(null);
                        loadFavorites(); // Refresh in case favorite status changed in modal
                    }}
                />
            )}

            {/* Bulk Delete Confirm Dialog */}
            {showBulkConfirm && (
                <div
                    className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowBulkConfirm(false); }}
                >
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-slate-800 mb-3 flex items-center gap-3">
                            <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                                <FaExclamationTriangle size={20} />
                            </div>
                            Xóa hàng loạt?
                        </h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                            Bạn sắp xóa <span className="font-bold text-slate-800">{selectionCount}</span> ứng viên khỏi danh sách yêu thích.
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowBulkConfirm(false)}
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors text-sm"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors text-sm shadow-md shadow-red-100"
                            >
                                <FaTrash size={12} />
                                Xác nhận xóa {selectionCount}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FavoriteCandidates;
