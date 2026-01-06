import React from 'react';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

const AddCVModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
           <h3 className="text-xl font-bold text-gray-800">Thêm CV/Resume</h3>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes size={20} /></button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
           <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tên Cv/Resume</label>
              <input type="text" placeholder="Ví dụ: CV Fullstack Developer" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" />
           </div>

           <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tải lên CV/Resume</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                 <FaCloudUploadAlt className="text-4xl text-gray-400 mb-3 group-hover:text-[#3AB4E6] transition-colors" />
                 <p className="font-bold text-gray-700">Chọn tệp hoặc thả vào đây</p>
                 <p className="text-xs text-gray-400 mt-1">Chỉ hỗ trợ tệp PDF. Dung lượng tối đa 12 MB.</p>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
           <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition-colors">
              Hủy
           </button>
           <button className="px-6 py-2.5 bg-[#3AB4E6] text-white font-bold rounded-lg hover:bg-blue-500 transition-colors">
              Thêm CV/Resume
           </button>
        </div>

      </div>
    </div>
  );
};

export default AddCVModal;