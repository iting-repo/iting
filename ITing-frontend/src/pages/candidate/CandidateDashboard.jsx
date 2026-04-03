import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { FaBookmark, FaBell, FaArrowRight, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CandidateDashboard = () => {
  const navigate = useNavigate();

  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axiosInstance.get('/api/applications/my-applications', {
          params: { page: 0, size: 5 }
        });
        setRecentApplications(response?.content || response?.data?.content || []);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);


  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 min-h-screen animate-fade-in">
      
      {/* HEADER: Chào mừng */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Hello, Ely!</h1>
        <p className="text-gray-500 mb-8">Đây là các hoạt động hằng ngày và thông báo việc làm của bạn.</p>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-[#FFF6E5] p-6 rounded-xl flex items-center justify-between shadow-sm border border-orange-100 transition-transform hover:-translate-y-1">
            <div>
              <div className="text-3xl font-bold text-gray-800 mb-1">...</div>
              <div className="text-gray-600 font-medium">Công việc yêu thích</div>
            </div>
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-orange-400 shadow-sm text-2xl">
              <FaBookmark />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#E6F8EF] p-6 rounded-xl flex items-center justify-between shadow-sm border border-green-100 transition-transform hover:-translate-y-1">
            <div>
              <div className="text-3xl font-bold text-gray-800 mb-1">...</div>
              <div className="text-gray-600 font-medium">Thông báo việc làm</div>
            </div>
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm text-2xl">
              <FaBell />
            </div>
          </div>
        </div>
      </div>

      {/* BANNER: Nhắc nhở hồ sơ (Màu đỏ) */}
      <div className="bg-[#D93025] rounded-xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between shadow-lg shadow-red-200 text-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl group-hover:bg-white/20 transition-all"></div>

         <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden shrink-0 shadow-md">
               <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
               <h3 className="text-lg font-bold mb-1">Hồ sơ của bạn chưa hoàn thành</h3>
               <p className="text-white/90 text-sm">Hoàn thiện hồ sơ của bạn và tạo CV theo cách riêng.</p>
            </div>
         </div>

         <button 
            onClick={() => navigate('/candidate/profile')}
            className="mt-4 md:mt-0 bg-white text-[#D93025] hover:bg-gray-100 px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-md relative z-10"
         >
            Chỉnh Sửa Hồ Sơ <FaArrowRight />
         </button>
      </div>

      {/* TABLE: Ứng tuyển gần đây */}
      <div>
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Ứng tuyển gần đây</h2>
            <a href="#" className="text-gray-500 text-sm hover:text-[#3AB4E6] flex items-center gap-1 transition-colors">
               Xem tất cả <FaArrowRight size={12} />
            </a>
         </div>

         <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse">
               <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                  <tr>
                     <th className="p-4 rounded-tl-lg">Công việc</th>
                     <th className="p-4">Ngày nộp</th>
                     <th className="p-4">Trạng thái</th>
                     <th className="p-4 rounded-tr-lg text-right">Hành động</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? (
                     <tr>
                        <td colSpan="4" className="p-4 text-center text-gray-500">Đang tải...</td>
                     </tr>
                  ) : recentApplications.length === 0 ? (
                     <tr>
                        <td colSpan="4" className="p-4 text-center text-gray-500">Chưa có ứng tuyển nào gần đây.</td>
                     </tr>
                  ) : recentApplications.map((app) => (
                     <tr key={app.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-4">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                                 <img src={"https://via.placeholder.com/50"} alt="Logo" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                 <div className="font-bold text-gray-800 text-base mb-1">{app.companyName || "Công ty ẩn danh"}</div>
                                 <div className="text-gray-500 flex items-center gap-2 text-xs">
                                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">{app.jobPosition || "Không rõ vị trí"}</span>
                                 </div>
                              </div>
                           </div>
                        </td>
                        <td className="p-4 text-gray-500">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ''}</td>
                        <td className="p-4">
                           <span className="inline-flex items-center gap-1.5 text-green-600 font-medium px-3 py-1 rounded-full bg-green-50 border border-green-100 text-xs">
                              <FaCheck size={10} /> {app.status}
                           </span>
                        </td>
                        <td className="p-4 text-right">
                           <button className="bg-gray-100 hover:bg-[#3AB4E6] hover:text-white text-gray-600 text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm">
                              Xem Chi Tiết
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
};

export default CandidateDashboard;
