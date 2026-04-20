import React, { useState, useEffect } from 'react';
import { FaStar, FaTrash, FaEnvelope, FaPhone, FaEye, FaUserTie, FaSearch, FaHeart } from 'react-icons/fa';
import { toast } from 'sonner';
import { Breadcrumb } from '../../components/common';
import favoriteCandidateService from '../../services/favoriteCandidateService';
import CandidateDetailModal from '../../components/employer/CandidateDetailModal';

const FavoriteCandidates = () => {
    const [favorites, setFavorites] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = () => {
        setFavorites(favoriteCandidateService.getFavorites());
    };

    const handleRemove = (candidateId, candidateName) => {
        favoriteCandidateService.removeFavorite(candidateId);
        loadFavorites();
        toast('Đã xóa khỏi danh sách yêu thích.', { icon: '🗑️' });
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

    return (
        <div>
            <Breadcrumb items={[{ label: 'Ứng viên yêu thích' }]} />

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
                    {filtered.map((candidate) => (
                        <div 
                            key={candidate.id} 
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-amber-100 transition-all group overflow-hidden"
                        >
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
                                    onClick={() => handleRemove(candidate.id, candidate.applicantName)}
                                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="Xóa khỏi yêu thích"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
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
        </div>
    );
};

export default FavoriteCandidates;
