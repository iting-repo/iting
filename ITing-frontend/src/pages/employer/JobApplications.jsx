import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaFileDownload, FaEye, FaArrowLeft, FaSort, FaFileSignature, FaMagic } from 'react-icons/fa';
import CandidateDetailModal from '../../components/employer/CandidateDetailModal';
import StagePopover from '../../components/employer/StagePopover';
import SendOfferModal from '../../components/employer/SendOfferModal';
import MatchCandidatesDrawer from '../../components/employer/MatchCandidatesDrawer';
import applicationService from '../../services/applicationService';
import { normalizeJobKey } from '../../utils/jobUrl';
import { Breadcrumb } from '../../components/common';

const JobApplications = () => {
   const { jobKey } = useParams();
   const id = normalizeJobKey(jobKey);
   const navigate = useNavigate();
   const [selectedCandidate, setSelectedCandidate] = useState(null);
   const [candidates, setCandidates] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [offerTarget, setOfferTarget] = useState(null); // candidate đang mở modal offer
   const [matchDrawerOpen, setMatchDrawerOpen] = useState(false);

   // Filter and sort states
   const [keyword, setKeyword] = useState("");
   const [status, setStatus] = useState("");
   const [sortBy, setSortBy] = useState("timeSent");
   const [sortOrder, setSortOrder] = useState("desc");

   useEffect(() => {
      const fetchApplications = async () => {
         try {
            setIsLoading(true);
            const params = {
               jobId: id,
               page: 0,
               size: 10,
               sortBy,
               sortOrder
            };
            if (keyword) params.keyword = keyword;
            if (status) params.status = status;

            const response = await applicationService.searchApplications(params);
            setCandidates(response.content || []);
         } catch (error) {
            console.error("Failed to fetch applications:", error);
         } finally {
            setIsLoading(false);
         }
      };

      const debounce = setTimeout(() => {
         fetchApplications();
      }, 300);

      return () => clearTimeout(debounce);
   }, [id, keyword, status, sortBy, sortOrder]);

   return (
      <div className="bg-white rounded-xl p-4 md:p-8 min-h-screen border border-gray-100">

         {/* 1. Header & Toolbar */}
         <Breadcrumb
           rootLabel="Tổng quan"
           rootLink="/employer/dashboard"
           items={[
             { label: 'Quản lý công việc', link: '/employer/manage-jobs' },
             { label: 'Hồ sơ ứng viên' }
           ]}
         />
         <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
               <h2 className="text-2xl font-bold text-gray-800">Danh sách ứng viên</h2>
               <p className="text-gray-500 text-sm">Quản lý danh sách hồ sơ ứng tuyển cho công việc này</p>
            </div>
            <button
               onClick={() => setMatchDrawerOpen(true)}
               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold shadow-md whitespace-nowrap"
            >
               <FaMagic /> Tìm thêm ứng viên AI <span className="text-[10px] opacity-80">5 credits</span>
            </button>
         </div>

         <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 gap-4">
            <div className="relative w-full md:w-96">
               <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
               <input
                  type="text"
                  placeholder="Tìm kiếm ứng viên..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
               />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
               <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-600 text-sm font-medium focus:outline-none focus:border-[#3AB4E6] cursor-pointer"
               >
                  <option value="">Lọc: Tất cả trạng thái</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="VIEWED">Đã xem</option>
                  <option value="ACCEPTED">Đã chấp nhận</option>
                  <option value="REJECTED">Từ chối</option>
                  <option value="WITHDRAWN">Đã rút đơn</option>
               </select>
               <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                     const [by, order] = e.target.value.split('-');
                     setSortBy(by);
                     setSortOrder(order);
                  }}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-600 text-sm font-medium focus:outline-none focus:border-[#3AB4E6] cursor-pointer"
               >
                  <option value="timeSent-desc">Sắp xếp: Mới nhất</option>
                  <option value="timeSent-asc">Sắp xếp: Cũ nhất</option>
               </select>
            </div>
         </div>

         {/* 2. Candidate Table (Giao diện mới) */}
         <div className="overflow-x-auto rounded-xl border border-gray-200 custom-scrollbar min-h-[300px]">
            <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                     <th className="p-5">Ứng viên</th>
                     <th className="p-5">Kinh nghiệm</th>
                     <th className="p-5">Học vấn</th>
                     <th className="p-5">Ngày nộp</th>
                     <th className="p-5">Giai đoạn</th>
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
                        <td className="p-5 text-sm text-gray-600 font-medium">{candidate.yearsExperience != null ? `${candidate.yearsExperience} Năm` : 'N/A'}</td>
                        <td className="p-5 text-sm text-gray-600">{candidate.education || 'N/A'}</td>
                        <td className="p-5 text-sm text-gray-500">{candidate.timeSent ? new Date(candidate.timeSent).toLocaleDateString('vi-VN') : 'N/A'}</td>
                        <td className="p-5">
                           <StagePopover
                              applyFormId={candidate.id}
                              jobId={id}
                              currentStage={candidate.pipelineStage}
                              onMoved={(newStage) => {
                                 setCandidates(prev => prev.map(c =>
                                    c.id === candidate.id
                                       ? { ...c, pipelineStage: newStage, stageUpdatedAt: new Date().toISOString() }
                                       : c
                                 ));
                              }}
                           />
                        </td>
                        <td className="p-5 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {candidate.cvUrl ? (
                                 <a
                                    href={candidate.cvUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                    title="Tải CV về máy"
                                 >
                                    <FaFileDownload />
                                 </a>
                              ) : (
                                 <button
                                    disabled
                                    className="p-2 bg-gray-50 text-gray-300 rounded-lg cursor-not-allowed"
                                    title="Ứng viên chưa đính kèm CV"
                                 >
                                    <FaFileDownload />
                                 </button>
                              )}
                              <button
                                 onClick={() => setSelectedCandidate(candidate)}
                                 className="p-2 bg-[#EAF6FF] text-[#3AB4E6] rounded-lg hover:bg-[#3AB4E6] hover:text-white transition-colors"
                                 title="Xem chi tiết"
                              >
                                 <FaEye />
                              </button>
                              {(candidate.pipelineStage === 'INTERVIEW' || candidate.pipelineStage === 'OFFER') && (
                                 <button
                                    onClick={() => setOfferTarget(candidate)}
                                    className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition-colors"
                                    title="Gửi offer"
                                 >
                                    <FaFileSignature />
                                 </button>
                              )}
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
               jobId={id}
               onClose={() => setSelectedCandidate(null)}
               onStatusUpdate={(appId, newStatus) => {
                  setCandidates(prev => prev.map(c =>
                     c.id === appId ? { ...c, status: newStatus } : c
                  ));
                  setSelectedCandidate(prev => prev ? { ...prev, status: newStatus } : prev);
               }}
               onSwitchCandidate={(sc) => {
                  // Cross-rec: chuyển sang xem ứng viên tương tự. sc là Employer
                  // candidate response shape — wrap thành application shape ngắn
                  // gọn để modal tiếp tục hoạt động (không có applyFormId nên
                  // 1 số action sẽ ẩn).
                  setSelectedCandidate({
                     id: sc.id,
                     userId: sc.id,
                     applicantName: sc.name,
                     applicantEmail: sc.email,
                     jobTitle: selectedCandidate?.jobTitle,
                     cvUrl: null,
                     status: 'SUGGESTED',
                     score: sc.score,
                     matchReasons: sc.matchReasons,
                  });
               }}
            />
         )}

         <SendOfferModal
            open={!!offerTarget}
            applyFormId={offerTarget?.id}
            jobId={id}
            defaultPosition={offerTarget?.jobTitle}
            candidateName={offerTarget?.applicantName}
            onClose={() => setOfferTarget(null)}
            onSent={() => {
               // Sau khi gửi offer, BE đã auto-move stage sang OFFER
               setCandidates(prev => prev.map(c =>
                  c.id === offerTarget?.id ? { ...c, pipelineStage: 'OFFER' } : c
               ));
            }}
         />

         <MatchCandidatesDrawer
            isOpen={matchDrawerOpen}
            jobId={id}
            jobTitle={candidates[0]?.jobTitle}
            onClose={() => setMatchDrawerOpen(false)}
         />

      </div>
   );
};

export default JobApplications;
