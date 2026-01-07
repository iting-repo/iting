import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaFileDownload, FaEye, FaArrowLeft, FaSort } from 'react-icons/fa';
import CandidateDetailModal from './components/CandidateDetailModal'; // Import modal vừa tạo

import { useDispatch, useSelector } from 'react-redux';
import { fetchApplicationsRequest } from '../../store/application/applicationSlice';

const JobApplications = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const dispatch = useDispatch();
   const [selectedCandidate, setSelectedCandidate] = useState(null);

   // Redux State
   const { currentUser } = useSelector((state) => state.auth);
   const { applications, isLoading } = useSelector((state) => state.application);

   // Fetch data on mount
   useEffect(() => {
      if (currentUser?.userId && id) {
         dispatch(fetchApplicationsRequest({
            jobId: id,
            employerId: currentUser.userId,
            page: 0,
            size: 10
         }));
      }
   }, [dispatch, currentUser, id]);

   const getStatusColor = (status) => {
      switch (status) {
         case 'PENDING': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
         case 'VIEWED': return 'bg-blue-50 text-blue-600 border-blue-100';
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
               {/* <p className="text-gray-500 text-sm">Công việc: UI/UX Designer (ID: #{id})</p> */}
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
                  {applications.length > 0 ? (
                     applications.map((app) => (
                        <tr key={app.id} className="hover:bg-blue-50/30 transition-colors group">
                           <td className="p-5">
                              <div className="flex items-center gap-4">
                                 {/* Avatar Logic */}
                                 {app.avatar ? (
                                    <img src={app.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                 ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border border-blue-200">
                                       {app.applicantName ? app.applicantName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                 )}

                                 <div>
                                    <div
                                       className="font-bold text-gray-800 cursor-pointer hover:text-[#3AB4E6] transition-colors"
                                       onClick={() => setSelectedCandidate(app)}
                                    >
                                       {app.applicantName}
                                    </div>
                                    <div className="text-xs text-gray-500">{app.jobPosition}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="p-5 text-sm text-gray-600 font-medium">Chưa có</td> {/* API chưa trả về Exp */}
                           <td className="p-5 text-sm text-gray-600">Chưa có</td> {/* API chưa trả về Edu */}
                           <td className="p-5 text-sm text-gray-500">
                              {new Date(app.appliedAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                           </td>
                           <td className="p-5">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                                 {app.status}
                              </span>
                           </td>
                           <td className="p-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <a
                                    href={app.cvUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 tooltip"
                                    title="Download CV"
                                 >
                                    <FaFileDownload />
                                 </a>
                                 <button
                                    onClick={() => setSelectedCandidate(app)}
                                    className="p-2 bg-[#EAF6FF] text-[#3AB4E6] rounded-lg hover:bg-[#3AB4E6] hover:text-white transition-colors"
                                    title="Xem chi tiết"
                                 >
                                    <FaEye />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))
                  ) : (
                     <tr>
                        <td colSpan="6" className="text-center py-8 text-gray-500">Chưa có ứng viên nào</td>
                     </tr>
                  )}
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