import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaFileDownload, FaEye, FaArrowLeft, FaSort } from 'react-icons/fa';
import CandidateDetailModal from '../../components/employer/CandidateDetailModal'; // Import modal từ components/employer
import applicationService from '../../services/applicationService';

const JobApplications = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const [selectedCandidate, setSelectedCandidate] = useState(null);
   const [candidates, setCandidates] = useState([]);
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
      const fetchApplications = async () => {
         try {
            setIsLoading(true);
            const response = await applicationService.getEmployerApplications(id, { page: 0, size: 10 });
            setCandidates(response.content || []);
         } catch (error) {
            console.error("Failed to fetch applications:", error);
         } finally {
            setIsLoading(false);
         }
      };
      fetchApplications();
   }, [id]);

   const getStatusColor = (status) => {
      if (!status) return 'bg-gray-50 text-gray-600';
      const s = status.toUpperCase();
      switch (s) {
         case 'PENDING': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
         case 'REVIEWED': return 'bg-blue-50 text-blue-600 border-blue-100';
         case 'INTERVIEW': return 'bg-purple-50 text-purple-600 border-purple-100';
         case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
         default: return 'bg-gray-50 text-gray-600';
      }
   };

   return (
      <div className="bg-white rounded-xl p-8 min-h-screen border border-gray-100">

         {/* 1. Header & Toolbar */}
         <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
               <FaArrowLeft />
            </button>
            <div>
               <h2 className="text-2xl font-bold text-gray-800">Danh sách ứng viên</h2>
               <p className="text-gray-500 text-sm">Công việc: UI/UX Designer (ID: #{id})</p>
            </div>
         </div>

         <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-96">
               <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
               <input
                  type="text"
                  placeholder="Tìm kiếm ứng viên..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
               />
            </div>
            <div className="flex gap-3">
               <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-sm font-medium">
                  <FaFilter /> Filter
               </button>
               <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1967D2] text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-md shadow-blue-500/20">
                  <FaSort /> Sort By
               </button>
            </div>
         </div>

         {/* 2. Candidate Table (Giao diện mới) */}
         <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                     <th className="p-5">Ứng viên</th>
                     <th className="p-5">Kinh nghiệm</th>
                     <th className="p-5">Học vấn</th>
                     <th className="p-5">Ngày nộp</th>
                     <th className="p-5">Trạng thái</th>
                     <th className="p-5 text-right">Hành động</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                     <tr>
                        <td colSpan="6" className="text-center py-10 text-gray-500">Đang tải dữ liệu...</td>
                     </tr>
                  ) : candidates.length === 0 ? (
                     <tr>
                        <td colSpan="6" className="text-center py-10 text-gray-500">Không có ứng viên nào.</td>
                     </tr>
                  ) : candidates.map((candidate) => (
                     <tr key={candidate.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="p-5">
                           <div className="flex items-center gap-4">
                              <img src={candidate.avatarUrl || 'https://via.placeholder.com/150'} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                              <div>
                                 <div
                                    className="font-bold text-gray-800 cursor-pointer hover:text-[#3AB4E6] transition-colors"
                                    onClick={() => setSelectedCandidate(candidate)}
                                 >
                                    {candidate.applicantName || 'Chưa cập nhật'}
                                 </div>
                                 <div className="text-xs text-gray-500">{candidate.jobTitle || 'Chưa cập nhật'}</div>
                              </div>
                           </div>
                        </td>
                        <td className="p-5 text-sm text-gray-600 font-medium">{candidate.yearsExperience != null ? `${candidate.yearsExperience} Năm` : 'null'}</td>
                        <td className="p-5 text-sm text-gray-600">{candidate.education || 'null'}</td>
                        <td className="p-5 text-sm text-gray-500">{candidate.timeSent ? new Date(candidate.timeSent).toLocaleDateString() : 'null'}</td>
                        <td className="p-5">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(candidate.status)}`}>
                              {candidate.status || 'null'}
                           </span>
                        </td>
                        <td className="p-5 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                 className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 tooltip"
                                 title="Download CV"
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
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* 3. Render Modal */}
         {selectedCandidate && (
            <CandidateDetailModal
               candidate={selectedCandidate}
               onClose={() => setSelectedCandidate(null)}
            />
         )}

      </div>
   );
};

export default JobApplications;
