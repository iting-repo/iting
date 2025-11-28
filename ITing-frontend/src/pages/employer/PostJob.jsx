import React, { useState } from 'react';
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaLink, FaListUl, FaListOl, FaArrowRight, FaChevronDown } from 'react-icons/fa';

const PostJob = () => {
  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobPosition: '',
    techStack: '',
    workType: '',
    quantity: '',
    deadline: '',
    city: '',
    district: '',
    address: '',
    minSalary: '',
    maxSalary: '',
    salaryType: 'month', // Mặc định theo tháng
    description: '',
    responsibilities: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu job:", formData);
    alert("Đăng bài thành công (Kiểm tra console)");
  };

  // Component Toolbar dùng chung cho Text Editor
  const EditorToolbar = () => (
    <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex gap-4 text-gray-500 mb-2">
      <button type="button" className="hover:text-black"><FaBold /></button>
      <button type="button" className="hover:text-black"><FaItalic /></button>
      <button type="button" className="hover:text-black"><FaUnderline /></button>
      <button type="button" className="hover:text-black"><FaStrikethrough /></button>
      <div className="w-px bg-gray-300 mx-1"></div>
      <button type="button" className="hover:text-black"><FaLink /></button>
      <button type="button" className="hover:text-black"><FaListUl /></button>
      <button type="button" className="hover:text-black"><FaListOl /></button>
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 animate-fade-in">
      <form onSubmit={handleSubmit}>
        
        {/* === 1. TIÊU ĐỀ CÔNG VIỆC === */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Tiêu đề công việc</h3>
          <input 
            type="text" 
            name="jobTitle"
            placeholder="Thêm tiêu đề vào đây" 
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm"
            onChange={handleChange}
          />
        </div>

        {/* === 2. THÔNG TIN CHI TIẾT === */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin chi tiết</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
             {/* Vị trí */}
             <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Vị trí tuyển dụng</label>
                <div className="relative">
                   <select name="jobPosition" onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-500 text-sm">
                      <option value="">Chọn...</option>
                      <option value="frontend">Frontend Developer</option>
                      <option value="backend">Backend Developer</option>
                      <option value="fullstack">Fullstack Developer</option>
                   </select>
                   <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                </div>
             </div>

             {/* Công nghệ */}
             <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Công nghệ yêu cầu</label>
                <div className="relative">
                   <select name="techStack" onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-500 text-sm">
                      <option value="">Chọn...</option>
                      <option value="react">ReactJS</option>
                      <option value="node">NodeJS</option>
                      <option value="java">Java</option>
                   </select>
                   <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                </div>
             </div>

             {/* Hình thức */}
             <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Hình thức làm việc</label>
                <div className="relative">
                   <select name="workType" onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-500 text-sm">
                      <option value="">Chọn...(Full-time, Part-time,...)</option>
                      <option value="fulltime">Full-time</option>
                      <option value="parttime">Part-time</option>
                      <option value="remote">Remote</option>
                   </select>
                   <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Số lượng */}
             <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Số lượng cần tuyển</label>
                <input 
                  type="number" 
                  name="quantity"
                  placeholder="Nhập số lượng" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm"
                  onChange={handleChange}
                />
             </div>
             {/* Ngày hết hạn */}
             <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Ngày hết hạn</label>
                <input 
                  type="date" 
                  name="deadline"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm text-gray-500"
                  onChange={handleChange}
                />
             </div>
          </div>
        </div>

        {/* === 3. ĐỊA CHỈ LÀM VIỆC === */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Địa chỉ làm việc</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Tỉnh/Thành */}
             <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Tỉnh/Thành phố</label>
                <div className="relative">
                   <select name="city" onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-500 text-sm">
                      <option value="">Chọn...</option>
                      <option value="hcm">TP. Hồ Chí Minh</option>
                      <option value="hn">Hà Nội</option>
                   </select>
                   <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                </div>
             </div>

             {/* Quận/Huyện */}
             <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Quận/Huyện</label>
                <div className="relative">
                   <select name="district" onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-500 text-sm">
                      <option value="">Chọn...</option>
                      <option value="q1">Quận 1</option>
                      <option value="qbinhthanh">Bình Thạnh</option>
                   </select>
                   <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                </div>
             </div>

             {/* Địa chỉ cụ thể */}
             <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Địa chỉ cụ thể</label>
                <input 
                  type="text" 
                  name="address"
                  placeholder="Nhập vị trí cụ thể" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm"
                  onChange={handleChange}
                />
             </div>
          </div>
        </div>

        {/* === 4. MỨC LƯƠNG === */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Mức lương</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Tối thiểu */}
             <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Tối thiểu</label>
                <div className="relative">
                   <input 
                     type="number" 
                     name="minSalary"
                     placeholder="Giá trị tối thiểu..." 
                     className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm"
                     onChange={handleChange}
                   />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">VND</span>
                </div>
             </div>

             {/* Tối đa */}
             <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Tối đa</label>
                <div className="relative">
                   <input 
                     type="number" 
                     name="maxSalary"
                     placeholder="Giá trị tối đa..." 
                     className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm"
                     onChange={handleChange}
                   />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">VND</span>
                </div>
             </div>

             {/* Hình thức trả lương */}
             <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Hình thức trả lương</label>
                <div className="relative">
                   <select name="salaryType" onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-500 text-sm">
                      <option value="month">Theo tháng</option>
                      <option value="project">Theo dự án</option>
                      <option value="hour">Theo giờ</option>
                   </select>
                   <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                </div>
             </div>
          </div>
        </div>

        {/* === 5. MÔ TẢ & TRÁCH NHIỆM === */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Mô tả công việc & Trách nhiệm</h3>
          
          {/* Editor 1: Mô tả */}
          <div className="mb-6">
             <label className="block text-gray-700 text-sm font-medium mb-2">Mô tả</label>
             <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#3AB4E6] transition-colors">
                <EditorToolbar />
                <textarea 
                  name="description"
                  className="w-full p-4 h-40 focus:outline-none resize-none text-sm text-gray-600"
                  placeholder="Add your job description..."
                  onChange={handleChange}
                ></textarea>
             </div>
          </div>

          {/* Editor 2: Trách nhiệm */}
          <div>
             <label className="block text-gray-700 text-sm font-medium mb-2">Trách nhiệm</label>
             <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#3AB4E6] transition-colors">
                <EditorToolbar />
                <textarea 
                  name="responsibilities"
                  className="w-full p-4 h-40 focus:outline-none resize-none text-sm text-gray-600"
                  placeholder="Add your job responsibilities..."
                  onChange={handleChange}
                ></textarea>
             </div>
          </div>
        </div>

        {/* === BUTTON SUBMIT === */}
        <button 
          type="submit"
          className="bg-[#1967D2] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
        >
          Đăng Bài <FaArrowRight size={14} />
        </button>

      </form>
    </div>
  );
};

export default PostJob;