import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaFileDownload, FaEye, FaArrowLeft, FaSort } from 'react-icons/fa';
import CandidateDetailModal from '../../components/employer/CandidateDetailModal';
import applicationService from '../../services/applicationService';
import { useTranslation } from 'react-i18next'; // 1. Import hook

const JobApplications = () => {
   const { t } = useTranslation(); // 2. Khởi tạo hàm t
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

   // Helper để dịch trạng thái
   const getStatusLabel = (status) => {
      if (!status) return t('applications.not_updated');
      const s = status.toUpperCase();
      switch (s) {
         case 'PENDING': return t('applications.status_list.pending');
         case 'REVIEWED': return t('applications.status_list.reviewed');
         case 'INTERVIEW': return t('applications.status_list.interview');
         case 'REJECTED': return t('applications.status_list.rejected');
         default: return status;
      }
   };

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

         {/* Header & Toolbar */}
         <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
               <FaArrowLeft />
            </button>
            <div>
               <h2 className="text-2xl font-bold text-gray-800">{t('applications.title')}</h2>
               <p className="text-gray-500 text-sm">{t('applications.job_label')}: UI/UX Designer (ID: #{id})</p>
            </div>
         </div>

         <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-96">
               <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
               <input
                  type="text"
                  placeholder={t('applications.search_placeholder')}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
               />
            </div>
            <div className="flex gap-3">
               <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 text-sm font-medium">
                  <FaFilter /> {t('applications.filter')}
               </button>
               <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1967D2] text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-md shadow-blue-500/20">
                  <FaSort /> {t('applications.sort_by')}
               </button>
            </div>
         </div>

         {/* Candidate Table */}
         <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                     <th className="p-5">{t('applications.table.candidate')}</th>
                     <th className="p-5">{t('applications.table.experience')}</th>
                     <th className="p-5">{t('applications.table.education')}</th>
                     <th className="p-5">{t('applications.table.applied_date')}</th>
                     <th className="p-5">{t('applications.table.status')}</th>
                     <th className="p-5 text-right">{t('applications.table.actions')}</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                     <tr>
                        <td colSpan="6" className="text-center py-10 text-gray-500">{t('applications.loading')}</td>
                     </tr>
                  ) : candidates.length === 0 ? (
                     <tr>
                        <td colSpan="6" className="text-center py-10 text-gray-500">{t('applications.no_data')}</td>
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
                                    {candidate.applicantName || t('applications.not_updated')}
                                 </div>
                                 <div className="text-xs text-gray-500">{candidate.jobTitle || t('applications.not_updated')}</div>
                              </div>
                           </div>
                        </td>
                        <td className="p-5 text-sm text-gray-600 font-medium">
                           {candidate.yearsExperience != null
                              ? `${candidate.yearsExperience} ${t('applications.years')}`
                              : 'N/A'}
                        </td>
                        <td className="p-5 text-sm text-gray-600">{candidate.education || 'N/A'}</td>
                        <td className="p-5 text-sm text-gray-500">
                           {candidate.timeSent ? new Date(candidate.timeSent).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-5">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(candidate.status)}`}>
                              {getStatusLabel(candidate.status)}
                           </span>
                        </td>
                        <td className="p-5 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                 className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 tooltip"
                                 title={t('applications.tooltips.download_cv')}
                              >
                                 <FaFileDownload />
                              </button>
                              <button
                                 onClick={() => setSelectedCandidate(candidate)}
                                 className="p-2 bg-[#EAF6FF] text-[#3AB4E6] rounded-lg hover:bg-[#3AB4E6] hover:text-white transition-colors"
                                 title={t('applications.tooltips.view_detail')}
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