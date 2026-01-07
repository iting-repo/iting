import React, { useState, useEffect } from 'react';
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaLink, FaListUl, FaListOl } from 'react-icons/fa';

const FoundingInfoTab = ({ data, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
    address: '',
    website: '',
    companyEmail: '',
    industry: '',
    companySize: '',
    representativeName: '',
    representativePhone: '',
    taxCode: ''
  });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        description: data.description || '',
        logoUrl: data.logoUrl || '',
        address: data.address || '',
        website: data.website || '',
        companyEmail: data.companyEmail || '',
        industry: data.industry || '',
        companySize: data.companySize || '',
        representativeName: data.representativeName || '',
        representativePhone: data.representativePhone || '',
        taxCode: data.taxCode || ''
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl">
      {/* 1. LOGO UPLOAD */}
      <div className="mb-8">
        <label className="block text-gray-700 font-medium mb-2">Logo công ty</label>
        <p className="text-xs text-gray-400 mb-3">Upload Logo</p>

        <div className="flex flex-col items-start gap-3">
          {/* Placeholder Image Box */}
          <div className="w-48 h-48 bg-gray-500 rounded-lg flex items-center justify-center text-white overflow-hidden bg-contain bg-no-repeat bg-center border border-gray-200">
            {formData.logoUrl ? (
              <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-gray-400">No Logo</span>
            )}
          </div>

          <div className="flex gap-4 text-sm">
            <span className="text-gray-500">Max 5 MB</span>
            <button className="text-red-500 hover:underline">Xóa</button>
            <button className="text-blue-500 hover:underline font-medium">Thay đổi</button>
          </div>
        </div>
      </div>

      {/* 2. BASIC INFO */}
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Thông tin cơ bản</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Tên công ty</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
            placeholder="Nhập tên công ty..."
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Mã số thuế</label>
          <input
            type="text"
            name="taxCode"
            value={formData.taxCode}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
            placeholder="Mã số thuế..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Website</label>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Email công ty</label>
          <input
            type="email"
            name="companyEmail"
            value={formData.companyEmail}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
            placeholder="Email liên hệ..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Lĩnh vực (Industry)</label>
          <input
            type="text"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
            placeholder="CNTT, Tài chính, ..."
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Quy mô công ty</label>
          <input
            type="text"
            name="companySize"
            value={formData.companySize}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
            placeholder="VD: 50-100 nhân viên"
          />
        </div>
      </div>

      {/* 3. CONTACT INFO */}
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 mt-8">Thông tin liên hệ & Người đại diện</h3>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Địa chỉ</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
          placeholder="Địa chỉ trụ sở..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Người đại diện</label>
          <input
            type="text"
            name="representativeName"
            value={formData.representativeName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
            placeholder="Tên người đại diện..."
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">SĐT Người đại diện</label>
          <input
            type="text"
            name="representativePhone"
            value={formData.representativePhone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
            placeholder="Số điện thoại..."
          />
        </div>
      </div>

      {/* 4. ABOUT US */}
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 mt-8">Về chúng tôi</h3>
      <div className="mb-8">
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
            name="description"
            value={formData.description}
            onChange={handleChange}
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