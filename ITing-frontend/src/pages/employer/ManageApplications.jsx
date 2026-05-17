import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaFileDownload, FaEye, FaArrowLeft, FaSort, FaTimesCircle, FaUserFriends } from 'react-icons/fa';
import CandidateDetailModal from '../../components/employer/CandidateDetailModal';
import applicationService from '../../services/applicationService';
import { Table, Td, Pagination, Breadcrumb } from '../../components/common';

const ManageApplications = () => {
    const navigate = useNavigate();
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Filter & Pagination states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPages: 0,
        pageSize: 10
    });

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, statusFilter]);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setIsLoading(true);
                const params = {
                    status: statusFilter || undefined,
                    keyword: debouncedSearch || undefined,
                    page: currentPage - 1, // API is 0-indexed
                    size: pagination.pageSize
                };

                const response = await applicationService.searchEmployerApplications(params);
                setCandidates(response.content || []);
                setPagination(prev => ({
                    ...prev,
                    totalItems: response.totalElements || 0,
                    totalPages: response.totalPages || 0
                }));
            } catch (error) {
                console.error("Failed to fetch applications:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplications();
    }, [debouncedSearch, statusFilter, currentPage]);

    const getStatusLabel = (status) => {
        if (!status) return 'Chưa cập nhật';
        const s = status.toUpperCase();
        switch (s) {
            case 'PENDING': return '✨ Hồ sơ mới';
            case 'VIEWED': return 'Đã đọc';
            case 'ACCEPTED': return 'Chấp nhận';
            case 'REJECTED': return 'Từ chối';
            case 'WITHDRAWN': return 'Đã rút đơn';
            default: return status;
        }
    };

    const getStatusColor = (status) => {
        if (!status) return 'bg-gray-50 text-gray-600';
        const s = status.toUpperCase();
        switch (s) {
            case 'PENDING': return 'bg-red-50 text-red-600 border-red-200 animate-pulse font-extrabold shadow-sm shadow-red-100';
            case 'VIEWED': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'ACCEPTED': return 'bg-green-50 text-green-600 border-green-100';
            case 'REJECTED': return 'bg-gray-100 text-gray-500 border-gray-200';
            case 'WITHDRAWN': return 'bg-purple-50 text-purple-600 border-purple-100';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <div className="bg-white rounded-xl p-8 min-h-screen border border-gray-100">
            <Breadcrumb
              rootLabel="Tổng quan"
              rootLink="/employer/dashboard"
              items={[{ label: 'Quản lý ứng viên' }]}
            />
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
                        Tất cả ứng viên 
                        {pagination.totalItems > 0 && (
                            <span className="text-[#3AB4E6] bg-[#EAF6FF] px-3 py-1 rounded-2xl text-xl">
                                {pagination.totalItems}
                            </span>
                        )}
                    </h2>
                    <p className="text-gray-500 font-medium mt-1">Lịch sử ứng tuyển toàn bộ từ trước đến nay</p>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row justify-between items-center mb-8 gap-4">
                <div className="relative w-full xl:w-96">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm ứng viên theo tên..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3AB4E6] focus:bg-white transition-all shadow-sm"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <FaTimesCircle size={14} />
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl min-w-[200px]">
                        <FaFilter className="text-gray-400 text-sm" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-600 w-full cursor-pointer"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="PENDING">✨ Hồ sơ mới (Pending)</option>
                            <option value="VIEWED">Đã xem (Viewed)</option>
                            <option value="ACCEPTED">Đã chấp nhận (Accepted)</option>
                            <option value="REJECTED">Đã từ chối (Rejected)</option>
                        </select>
                    </div>
                    
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#1967D2] text-white rounded-xl hover:bg-blue-700 text-sm font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                        <FaSort /> Sắp xếp
                    </button>
                </div>
            </div>

            <Table
                headers={[
                    { label: 'Ứng viên' },
                    { label: 'Công việc' },
                    { label: 'Ngày ứng tuyển' },
                    { label: 'Trạng thái' },
                    { label: 'Thao tác', className: "text-right" }
                ]}
            >
                {isLoading ? (
                    <tr>
                        <Td colSpan="5" className="text-center py-24 text-gray-500">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3AB4E6]"></div>
                                <span className="font-medium animate-pulse">Đang tải lịch sử ứng tuyển...</span>
                            </div>
                        </Td>
                    </tr>
                ) : candidates.length === 0 ? (
                    <tr>
                        <Td colSpan="5" className="text-center py-24 text-gray-500">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                    <FaSearch size={40} />
                                </div>
                                <div>
                                    <span className="block font-bold text-gray-900 text-lg">Không tìm thấy ứng viên nào</span>
                                    <span className="text-sm">Hãy thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm</span>
                                </div>
                                {(searchTerm || statusFilter) && (
                                    <button 
                                        onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
                                        className="mt-2 px-6 py-2 border border-[#3AB4E6] text-[#3AB4E6] font-bold rounded-lg hover:bg-[#3AB4E6] hover:text-white transition-all text-sm"
                                    >
                                        Xóa tất cả bộ lọc
                                    </button>
                                )}
                            </div>
                        </Td>
                    </tr>
                ) : candidates.map((candidate) => (
                    <tr key={`${candidate.id}-${candidate.jobId}`} className="hover:bg-blue-50/20 transition-colors group border-b border-gray-50 last:border-b-0">
                        <Td>
                            <div className="flex items-center gap-4">
                                <img src={candidate.avatarUrl || 'https://via.placeholder.com/150'} alt="Avatar" className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm" />
                                <div>
                                    <div
                                        className="font-bold text-gray-800 cursor-pointer hover:text-[#3AB4E6] transition-colors text-base"
                                        onClick={() => setSelectedCandidate(candidate)}
                                    >
                                        {candidate.applicantName || 'Chưa cập nhật'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">{candidate.email || candidate.candidateEmail || 'N/A'}</div>
                                </div>
                            </div>
                        </Td>
                        <Td>
                            <div className="max-w-[250px]">
                                <div className="text-sm font-bold text-gray-700 line-clamp-1">{candidate.jobTitle || 'Chưa cập nhật'}</div>
                                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">ID: #{candidate.jobId}</div>
                            </div>
                        </Td>
                        <Td className="text-sm text-gray-500 font-medium">
                            {candidate.timeSent ? new Date(candidate.timeSent).toLocaleDateString('vi-VN') : 'N/A'}
                        </Td>
                        <Td>
                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${getStatusColor(candidate.status)}`}>
                                {getStatusLabel(candidate.status)}
                            </span>
                        </Td>
                        <Td className="text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setSelectedCandidate(candidate)}
                                    className="p-2.5 bg-[#EAF6FF] text-[#3AB4E6] rounded-xl hover:bg-[#3AB4E6] hover:text-white transition-all shadow-sm"
                                    title="Xem chi tiết"
                                >
                                    <FaEye size={16} />
                                </button>
                            </div>
                        </Td>
                    </tr>
                ))}
            </Table>

            {pagination.totalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-gray-50">
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        itemsPerPage={pagination.pageSize}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            )}

            {selectedCandidate && (
                <CandidateDetailModal
                    candidate={selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                    onStatusUpdate={(id, newStatus) => {
                        setCandidates(prev => prev.map(c => 
                            c.id === id ? { ...c, status: newStatus } : c
                        ));
                        setSelectedCandidate(prev => ({ ...prev, status: newStatus }));
                    }}
                />
            )}
        </div>
    );
};

export default ManageApplications;
