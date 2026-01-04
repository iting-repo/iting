import React from 'react';
import { FaBold, FaItalic, FaUnderline, FaLink, FaListUl, FaListOl } from 'react-icons/fa';

const ProfileInfoTab = () => {
  
  // Toolbar Component (Dùng lại)
  const EditorToolbar = () => (
    <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex gap-4 text-gray-500 mb-2">
      <button type="button" className="hover:text-black"><FaBold /></button>
      <button type="button" className="hover:text-black"><FaItalic /></button>
      <button type="button" className="hover:text-black"><FaUnderline /></button>
      <div className="w-px bg-gray-300 mx-1"></div>
      <button type="button" className="hover:text-black"><FaLink /></button>
      <button type="button" className="hover:text-black"><FaListUl /></button>
      <button type="button" className="hover:text-black"><FaListOl /></button>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6">
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
             <input type="date" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-gray-500" />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
             <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] bg-white">
                <option>Chọn...</option>
                <option>Nam</option>
                <option>Nữ</option>
                <option>Khác</option>
             </select>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Học vấn</label>
             <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] bg-white">
                <option>Chọn...</option>
                <option>Cử nhân</option>
                <option>Thạc sĩ</option>
                <option>Tiến sĩ</option>
             </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Kinh nghiệm</label>
             <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] bg-white">
                <option>Chọn...</option>
                <option>Junior</option>
                <option>Middle</option>
                <option>Senior</option>
             </select>
          </div>
       </div>

       <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả bản thân</label>
          <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#3AB4E6] transition-colors">
             <EditorToolbar />
             <textarea 
               className="w-full p-4 h-40 focus:outline-none resize-none text-sm text-gray-600"
               placeholder="Viết đôi dòng giới thiệu về bản thân bạn tại đây..."
             ></textarea>
          </div>
       </div>

       <button className="bg-[#3AB4E6] text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-500 transition-colors">
          Lưu Thay Đổi
       </button>

    </div>
  );
};

export default ProfileInfoTab;