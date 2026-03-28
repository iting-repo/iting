import React, { useState } from 'react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaLink,
  FaListUl,
  FaListOl,
  FaArrowRight,
  FaChevronDown,
  FaTimes,
} from 'react-icons/fa';

const PostJob = ({ onClose, onSubmitSuccess }) => {
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
    responsibilities: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
  const newErrors = {};

  if (!formData.jobTitle) newErrors.jobTitle = 'Bắt buộc';
  if (!formData.jobPosition) newErrors.jobPosition = 'Bắt buộc';
  if (!formData.workType) newErrors.workType = 'Bắt buộc';
  if (!formData.quantity) newErrors.quantity = 'Bắt buộc';
  if (!formData.deadline) newErrors.deadline = 'Bắt buộc';
  if (!formData.city) newErrors.city = 'Bắt buộc';
  if (!formData.address) newErrors.address = 'Bắt buộc';
  if (!formData.minSalary) newErrors.minSalary = 'Bắt buộc';
  if (!formData.maxSalary) newErrors.maxSalary = 'Bắt buộc';
  if (!formData.description) newErrors.description = 'Bắt buộc';

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = (e) => {
  e.preventDefault();

  if (!validate()) return;

  console.log('Dữ liệu job:', formData);

  if (onSubmitSuccess) {
    onSubmitSuccess(formData);
  }

  alert('Đăng bài thành công');
  onClose();
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     console.log('Dữ liệu job:', formData);

//     if (onSubmitSuccess) {
//       onSubmitSuccess(formData);
//     }

//     alert('Đăng bài thành công (Kiểm tra console)');
//     if (onClose) onClose();
//   };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center 
      bg-black/40 backdrop-blur-sm 
      transition-opacity duration-300 ease-in-out
      animate-fade-in
      px-4 py-6">
      <div className="w-full max-w-6xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 animate-fade-in">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Đăng công việc</h2>
            <p className="text-sm text-gray-500 mt-1">Tạo bài đăng tuyển dụng mới</p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Tiêu đề công việc</h3>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                placeholder="Thêm tiêu đề vào đây"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm"
                onChange={handleChange}
              />
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin chi tiết</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Vị trí tuyển dụng</label>
                  <div className="relative">
                    <select
                      name="jobPosition"
                      value={formData.jobPosition}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-500 text-sm"
                    >
                      <option value="">Chọn...</option>
                      <option value="frontend">Frontend Developer</option>
                      <option value="backend">Backend Developer</option>
                      <option value="fullstack">Fullstack Developer</option>
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Công nghệ yêu cầu</label>
                  <div className="relative">
                    <select
                      name="techStack"
                      value={formData.techStack}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-500 text-sm"
                    >
                      <option value="">Chọn...</option>
                      <option value="react">ReactJS</option>
                      <option value="node">NodeJS</option>
                      <option value="java">Java</option>
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Hình thức làm việc</label>
                  <div className="relative">
                    <select
                      name="workType"
                      value={formData.workType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-500 text-sm"
                    >
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
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Số lượng cần tuyển</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    placeholder="Nhập số lượng"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm"
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Ngày hết hạn</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm text-gray-500"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Địa chỉ làm việc</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Tỉnh/Thành phố</label>
                  <div className="relative">
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-500 text-sm"
                    >
                      <option value="">Chọn...</option>
                      <option value="hcm">TP. Hồ Chí Minh</option>
                      <option value="hn">Hà Nội</option>
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Quận/Huyện</label>
                  <div className="relative">
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-500 text-sm"
                    >
                      <option value="">Chọn...</option>
                      <option value="q1">Quận 1</option>
                      <option value="qbinhthanh">Bình Thạnh</option>
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Địa chỉ cụ thể</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    placeholder="Nhập vị trí cụ thể"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Mức lương</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Tối thiểu</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="minSalary"
                      value={formData.minSalary}
                      placeholder="Giá trị tối thiểu..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm"
                      onChange={handleChange}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">VND</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Tối đa</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="maxSalary"
                      value={formData.maxSalary}
                      placeholder="Giá trị tối đa..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm"
                      onChange={handleChange}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">VND</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Hình thức trả lương</label>
                  <div className="relative">
                    <select
                      name="salaryType"
                      value={formData.salaryType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-500 text-sm"
                    >
                      <option value="month">Theo tháng</option>
                      <option value="project">Theo dự án</option>
                      <option value="hour">Theo giờ</option>
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Mô tả công việc & Trách nhiệm</h3>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">Mô tả</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#3AB4E6] transition-colors">
                  <EditorToolbar />
                  <textarea
                    name="description"
                    value={formData.description}
                    className="w-full p-4 h-40 focus:outline-none resize-none text-sm text-gray-600"
                    placeholder="Add your job description..."
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Trách nhiệm</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#3AB4E6] transition-colors">
                  <EditorToolbar />
                  <textarea
                    name="responsibilities"
                    value={formData.responsibilities}
                    className="w-full p-4 h-40 focus:outline-none resize-none text-sm text-gray-600"
                    placeholder="Add your job responsibilities..."
                    onChange={handleChange}
                  />
                </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="border border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors hover:bg-gray-50"
              >
                Hủy
              </button>

              <button
                type="submit"
                className="bg-[#1967D2] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
              >
                Đăng Bài <FaArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;