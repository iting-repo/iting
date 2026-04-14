import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaFileDownload, FaEye, FaArrowLeft, FaSort } from 'react-icons/fa';
import CandidateDetailModal from '../../components/employer/CandidateDetailModal';
import applicationService from '../../services/applicationService';
import { normalizeJobKey } from '../../utils/jobUrl';
import { Table, Td } from '../../components/common';

const JobApplications = () => {
   const { jobKey } = useParams();
   const navigate = useNavigate();
   const [selectedCandidate, setSelectedCandidate] = useState(null);
   const [candidates, setCandidates] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const normalizedJobKey = normalizeJobKey(jobKey);

   useEffect(() => {
      const fetchApplications = async () => {
         try {
            setIsLoading(true);
            const response = await applicationService.getEmployerApplications(normalizedJobKey, { page: 0, size: 10 });
            setCandidates(response.content || []);
         } catch (error) {
            console.error("Failed to fetch applications:", error);
         } finally {
            setIsLoading(false);
         }
      };

      if (normalizedJobKey) {
         fetchApplications();
      }
   }, [normalizedJobKey]);

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

         <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-96">
               <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
               <input
                  type="text"
                  placeholder="Tìm kiếm ứng viên theo tên..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
               />
            </div>
            <div className="flex gap-3">
               <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-sm font-medium">
                  <FaFilter /> Bộ lọc
               </button>
               <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1967D2] text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-md shadow-blue-500/20">
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
                  <Td colSpan="6" className="text-center py-10 text-gray-500">Đang tải dữ liệu...</Td>
               </tr>
            ) : candidates.length === 0 ? (
               <tr>
                  <Td colSpan="6" className="text-center py-10 text-gray-500">Chưa có ứng viên nào ứng tuyển</Td>
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
