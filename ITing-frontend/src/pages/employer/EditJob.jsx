import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBold, FaItalic, FaUnderline, FaLink, FaListUl, FaListOl, FaSave, FaArrowLeft, FaChevronDown } from 'react-icons/fa';

const EditJob = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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
    salaryType: 'month',
    description: '',
    responsibilities: ''
  });

  // Giả lập gọi API lấy chi tiết công việc theo ID
  useEffect(() => {
    // Trong thực tế: const data = await api.getJobById(id);
    // Ở đây mình fake data mẫu:
    setTimeout(() => {
      setFormData({
        jobTitle: 'Senior UI/UX Designer',
        jobPosition: 'fullstack',
        techStack: 'react',
        workType: 'fulltime',
        quantity: '5',
        deadline: '2025-12-31',
        city: 'hcm',
        district: 'q1',
        address: 'Tòa nhà Bitexco, số 2 Hải Triều',
        minSalary: '15000000',
        maxSalary: '30000000',
        salaryType: 'month',
        description: 'Mô tả mẫu đã được load từ database...',
        responsibilities: 'Trách nhiệm mẫu...'
      });
      setLoading(false);
    }, 500); // Delay 0.5s cho giống thật
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu cập nhật:", formData);
    alert("Cập nhật công việc thành công!");
    navigate('/employer/manage-jobs'); // Quay về danh sách
  };

  // Toolbar Component (Tái sử dụng)
  const EditorToolbar = () => (
    <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex gap-4 text-gray-500 mb-2">
      <button type="button" className="hover:text-black"><FaBold /></button>
      <button type="button" className="hover:text-black"><FaItalic /></button>
      <button type="button" className="hover:text-black"><FaUnderline /></button>
      <div className="w-px bg-gray-300 mx-1"></div>
      <button type="button" className="hover:text-black"><FaListUl /></button>
      <button type="button" className="hover:text-black"><FaListOl /></button>
    </div>
  );

  if (loading) return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu công việc...</div>;

  return (
    <div className="animate-fade-in">
      {/* Header: Nút back + Tiêu đề */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-500">
            <FaArrowLeft />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa công việc</h2>
            <p className="text-gray-500 text-sm">ID: #{id}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit}>
          
          {/* === 1. TIÊU ĐỀ === */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tiêu đề công việc</h3>
            <input 
              type="text" 
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm font-medium"
            />
          </div>

          {/* === 2. CHI TIẾT === */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin chi tiết</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
               <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Vị trí</label>
                  <div className="relative">
                     <select name="jobPosition" value={formData.jobPosition} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-sm">
                        <option value="frontend">Frontend Developer</option>
                        <option value="backend">Backend Developer</option>
                        <option value="fullstack">Fullstack Developer</option>
                     </select>
                     <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>
               </div>
               {/* Các select khác tương tự (Tech stack, Work type) - Giữ nguyên code form cũ */}
               <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Công nghệ</label>
                  <div className="relative">
                     <select name="techStack" value={formData.techStack} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-sm">
                        <option value="react">ReactJS</option>
                        <option value="node">NodeJS</option>
                     </select>
                     <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>
               </div>
               <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Hình thức</label>
                  <div className="relative">
                     <select name="workType" value={formData.workType} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-sm">
                        <option value="fulltime">Full-time</option>
                        <option value="parttime">Part-time</option>
                     </select>
                     <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Số lượng</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm" />
               </div>
               <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Ngày hết hạn</label>
                  <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm" />
               </div>
            </div>
          </div>

          {/* === 3. ĐỊA CHỈ & LƯƠNG (Giản lược code cho gọn, logic y hệt PostJob nhưng thêm value={formData...}) === */}
          <div className="mb-8">
             <h3 className="text-lg font-bold text-gray-800 mb-4">Địa chỉ & Lương</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm" placeholder="Địa chỉ" />
                <div className="flex gap-4">
                    <input type="number" name="minSalary" value={formData.minSalary} onChange={handleChange} className="w-1/2 px-4 py-3 border border-gray-200 rounded-lg text-sm" placeholder="Min Lương" />
                    <input type="number" name="maxSalary" value={formData.maxSalary} onChange={handleChange} className="w-1/2 px-4 py-3 border border-gray-200 rounded-lg text-sm" placeholder="Max Lương" />
                </div>
             </div>
          </div>

          {/* === 4. MÔ TẢ === */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Nội dung</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
               <EditorToolbar />
               <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-4 h-40 focus:outline-none text-sm text-gray-600" />
            </div>
          </div>

          {/* === BUTTON ACTIONS === */}
          <div className="flex gap-4">
            <button 
              type="submit"
              className="bg-[#1967D2] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
            >
              <FaSave /> Lưu Thay Đổi
            </button>
            <button 
              type="button"
              onClick={() => navigate('/employer/manage-jobs')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditJob;