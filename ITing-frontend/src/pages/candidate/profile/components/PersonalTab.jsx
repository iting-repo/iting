import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaLink, FaFileAlt, FaEllipsisH, FaPlusCircle } from 'react-icons/fa';
import AddCVModal from './AddCVModal'; // Import Modal vừa tạo

const PersonalTab = ({ initialData, isLoading }) => {
   const [showModal, setShowModal] = useState(false);
   const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phoneNum: '',
      birthDate: '',
      sex: 'MALE',
      address: '',
      description: '',
      website: '', // API response doesn't have website yet, keep for UI
      avatarUrl: ''
   });

   useEffect(() => {
      if (initialData) {
         setFormData({
            firstName: initialData.firstName || '',
            lastName: initialData.lastName || '',
            email: initialData.email || '',
            phoneNum: initialData.phoneNum || '',
            birthDate: initialData.birthDate || '',
            sex: initialData.sex || 'MALE',
            address: initialData.address || '',
            description: initialData.description || '',
            website: '',
            avatarUrl: initialData.avatarUrl || ''
         });
      }
   }, [initialData]);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   // Mock danh sách CV
   const cvList = [
      { id: 1, name: "Professional Resume", size: "3.5 MB" },
      { id: 2, name: "Product Designer", size: "4.7 MB" },
      { id: 3, name: "Visual Designer", size: "1.3 MB" },
   ];

   if (isLoading) return <div className="p-8 text-center text-gray-500">Đang tải thông tin...</div>;

   return (
      <div className="max-w-5xl">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">

            {/* CỘT TRÁI: ẢNH ĐẠI DIỆN */}
            <div className="md:col-span-1">
               <h3 className="font-bold text-gray-800 mb-4">Ảnh cá nhân</h3>
               <div className="border-2 border-dashed border-gray-300 rounded-xl aspect-square flex flex-col items-center justify-center text-center p-4 hover:border-[#3AB4E6] cursor-pointer transition-colors group relative overflow-hidden">
                  {formData.avatarUrl ? (
                     <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover absolute inset-0 rounded-xl" />
                  ) : (
                     <>
                        <FaCloudUploadAlt className="text-4xl text-gray-300 mb-3 group-hover:text-[#3AB4E6]" />
                        <p className="font-bold text-gray-700 text-sm">Chọn ảnh hoặc thả vào đây</p>
                        <p className="text-xs text-gray-400 mt-2">Kích thước tối đa là 5 MB (JPG, PNG)</p>
                     </>
                  )}
               </div>
            </div>

            {/* CỘT PHẢI: FORM NHẬP LIỆU */}
            <div className="md:col-span-2 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Họ</label>
                     <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
                     <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
                     />
                  </div>
               </div>

               {/* Email & Phone */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                     <input
                        name="email"
                        value={formData.email}
                        readOnly
                        type="email"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                     <input
                        name="phoneNum"
                        value={formData.phoneNum}
                        onChange={handleChange}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
                     />
                  </div>
               </div>

               {/* Chức danh */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chức danh / Tiêu đề hồ sơ</label>
                  <input
                     name="description"
                     value={formData.description}
                     onChange={handleChange}
                     type="text"
                     placeholder="VD: Senior React Native Developer"
                     className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
                  />
               </div>

               {/* DOB & Sex */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                     <input
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        type="date"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                     <select
                        name="sex"
                        value={formData.sex}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] bg-white"
                     >
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                     </select>
                  </div>
               </div>

               {/* Address */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                  <input
                     name="address"
                     value={formData.address}
                     onChange={handleChange}
                     type="text"
                     className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website cá nhân</label>
                  <div className="relative">
                     <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input type="text" placeholder="Website url..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" />
                  </div>
               </div>

               <button className="bg-[#3AB4E6] text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-500 transition-colors">
                  Lưu Thay Đổi
               </button>
            </div>
         </div>

         {/* PHẦN CV CỦA BẠN */}
         <div className="border-t border-gray-100 pt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">CV của bạn</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {/* CV Items */}
               {cvList.map(cv => (
                  <div key={cv.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-transparent hover:border-gray-200 transition-all">
                     <div className="flex items-center gap-3 overflow-hidden">
                        <div className="text-blue-500 text-2xl"><FaFileAlt /></div>
                        <div className="min-w-0">
                           <p className="font-bold text-gray-700 text-sm truncate">{cv.name}</p>
                           <p className="text-xs text-gray-400">{cv.size}</p>
                        </div>
                     </div>
                     {/* Menu context (Giả lập) */}
                     <button className="text-gray-400 hover:text-gray-600 p-2"><FaEllipsisH /></button>
                  </div>
               ))}

               {/* Add New CV Box */}
               <button
                  onClick={() => setShowModal(true)}
                  className="border-2 border-dashed border-gray-300 bg-white rounded-xl p-4 flex items-center justify-center gap-3 text-gray-500 hover:border-[#3AB4E6] hover:text-[#3AB4E6] transition-all h-[80px]"
               >
                  <FaPlusCircle className="text-xl" />
                  <span className="font-bold text-sm">Thêm Cv/Resume</span>
               </button>
            </div>
         </div>

         {/* Render Modal */}
         <AddCVModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </div>
   );
};

export default PersonalTab;