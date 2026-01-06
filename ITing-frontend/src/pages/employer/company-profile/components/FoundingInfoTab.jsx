import React from 'react';
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaLink, FaListUl, FaListOl } from 'react-icons/fa';

const FoundingInfoTab = () => {
  return (
    <div className="max-w-4xl">
      {/* 1. LOGO UPLOAD */}
      <div className="mb-8">
        <label className="block text-gray-700 font-medium mb-2">Logo công ty</label>
        <p className="text-xs text-gray-400 mb-3">Upload Logo</p>
        
        <div className="flex flex-col items-start gap-3">
          {/* Placeholder Image Box */}
          <div className="w-48 h-48 bg-gray-500 rounded-lg flex items-center justify-center text-white">
             {/* Hiển thị ảnh thật ở đây nếu có */}
          </div>
          
          <div className="flex gap-4 text-sm">
             <span className="text-gray-500">3.5 MB</span>
             <button className="text-red-500 hover:underline">Xóa</button>
             <button className="text-blue-500 hover:underline font-medium">Thay đổi</button>
          </div>
        </div>
      </div>

      {/* 2. COMPANY NAME */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Tên công ty</label>
        <input 
          type="text" 
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
          placeholder="Nhập tên công ty..."
        />
      </div>

      {/* 3. ABOUT US (RICH TEXT EDITOR SIMULATION) */}
      <div className="mb-8">
        <label className="block text-gray-700 font-medium mb-2">Về chúng tôi</label>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
           {/* Toolbar giả lập */}
           <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex gap-3 text-gray-500">
              <button className="hover:text-black"><FaBold /></button>
              <button className="hover:text-black"><FaItalic /></button>
              <button className="hover:text-black"><FaUnderline /></button>
              <button className="hover:text-black"><FaStrikethrough /></button>
              <div className="w-px bg-gray-300 mx-1"></div>
              <button className="hover:text-black"><FaLink /></button>
              <button className="hover:text-black"><FaListUl /></button>
              <button className="hover:text-black"><FaListOl /></button>
           </div>
           {/* Textarea */}
           <textarea 
             className="w-full p-4 h-40 focus:outline-none resize-none"
             placeholder="Viết thông tin mô tả công ty..."
           ></textarea>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <button className="bg-[#1967D2] text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
        Lưu Thay Đổi
      </button>
    </div>
  );
};

export default FoundingInfoTab;