import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaFileDownload, FaEye, FaArrowLeft, FaSort, FaTimesCircle } from 'react-icons/fa';
import CandidateDetailModal from '../../components/employer/CandidateDetailModal';
import applicationService from '../../services/applicationService';
import { normalizeJobKey } from '../../utils/jobUrl';
import { Table, Td, Pagination } from '../../components/common';

const JobApplications = () => {
    const { jobKey } = useParams();
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

    const normalizedJobKey = normalizeJobKey(jobKey);

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
                    jobId: normalizedJobKey,
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

        if (normalizedJobKey) {
            fetchApplications();
        }
    }, [normalizedJobKey, debouncedSearch, statusFilter, currentPage]);

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
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <FaArrowLeft />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Danh sách ứng viên</h2>
                    <p className="text-gray-500 text-sm">Tin tuyển dụng ID: #{normalizedJobKey}</p>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full xl:w-96">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm ứng viên theo tên..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] shadow-sm"
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
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg min-w-[180px]">
                        <FaFilter className="text-gray-400 text-sm" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-600 w-full cursor-pointer"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="PENDING">✨ Hồ sơ mới (Pending)</option>
                            <option value="VIEWED">Đã xem (Viewed)</option>
                            <option value="ACCEPTED">Đã chấp nhận (Accepted)</option>
                            <option value="REJECTED">Đã từ chối (Rejected)</option>
                        </select>
                    </div>
                    
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1967D2] text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95">
                        <FaSort /> Sắp xếp
                    </button>
                </div>
            </div>

            <Table
                headers={[
                    { label: 'Ứng viên' },
                    { label: 'Kinh nghiệm' },
                    { label: 'Học vấn' },
                    { label: 'Ngày ứng tuyển' },
                    { label: 'Trạng thái' },
                    { label: 'Thao tác', className: "text-right" }
                ]}
            >
                {isLoading ? (
                    <tr>
                        <Td colSpan="6" className="text-center py-20 text-gray-500">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1967D2]"></div>
                                <span>Đang tìm kiếm ứng viên...</span>
                            </div>
                        </Td>
                    </tr>
                ) : candidates.length === 0 ? (
                    <tr>
                        <Td colSpan="6" className="text-center py-20 text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                                <FaSearch size={40} className="text-gray-200 mb-2" />
                                <span className="font-medium text-gray-800">Không tìm thấy ứng viên nào</span>
                                <span className="text-sm">Hãy thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm</span>
                                {(searchTerm || statusFilter) && (
                                    <button 
                                        onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
                                        className="mt-4 text-[#1967D2] font-bold text-sm hover:underline"
                                    >
                                        Xóa tất cả bộ lọc
                                    </button>
                                )}
                            </div>
                        </Td>
                    </tr>
                ) : candidates.map((candidate) => (
               <tr key={candidate.id} className="hover:bg-blue-50/30 transition-colors group">
                  <Td>
                     <div className="flex items-center gap-4">
                        <img src={candidate.avatarUrl || 'https://via.placeholder.com/150'} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        <div>
                           <div
                              className="font-bold text-gray-800 cursor-pointer hover:text-[#3AB4E6] transition-colors text-base"
                              onClick={() => setSelectedCandidate(candidate)}
                           >
                              {candidate.applicantName || 'Chưa cập nhật'}
                           </div>
                           <div className="text-xs text-gray-500">{candidate.jobTitle || 'Chưa cập nhật'}</div>
                        </div>
                     </div>
                  </Td>
                  <Td className="text-sm text-gray-600 font-medium">
                     {candidate.yearsExperience != null
                        ? `${candidate.yearsExperience} năm`
                        : 'N/A'}
                  </Td>
                  <Td className="text-sm text-gray-600">{candidate.education || 'N/A'}</Td>
                  <Td className="text-sm text-gray-500">
                     {candidate.timeSent ? new Date(candidate.timeSent).toLocaleDateString() : 'N/A'}
                  </Td>
                  <Td>
                     <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(candidate.status)}`}>
                        {getStatusLabel(candidate.status)}
                     </span>
                  </Td>
                  <Td className="text-right">
                     <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                           className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 tooltip"
                           title="Tải CV về máy"
                        >
                           <FaFileDownload />
                        </button>
                        <button
                           onClick={() => setSelectedCandidate(candidate)}
                           className="p-2 bg-[#EAF6FF] text-[#3AB4E6] rounded-lg hover:bg-[#3AB4E6] hover:text-white transition-colors"
                           title="Xem chi tiết"
                        >
                           <FaEye />
                        </button>
                     </div>
                  </Td>
               </tr>
            ))}
         </Table>

         {pagination.totalPages > 1 && (
            <div className="mt-6 border-t border-gray-50 pt-4">
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

export default JobApplications;
