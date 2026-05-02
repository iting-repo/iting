import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import hook
import { FaUser, FaGlobe, FaCog, FaPlus, FaRocket, FaSpinner } from 'react-icons/fa';
import FoundingInfoTab from './components/FoundingInfoTab';
import SocialMediaTab from './components/SocialMediaTab';
import SettingsTab from './components/SettingsTab';
import companyService from '../../../services/companyService';

const CompanyProfile = () => {
  const { t } = useTranslation(); // 2. Khởi tạo hàm t
  const [activeTab, setActiveTab] = useState('founding');
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const data = await companyService.getMyCompany();
      setCompany(data);
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'founding': return <FoundingInfoTab onTabChange={setActiveTab} />;
      case 'social': return <SocialMediaTab onTabChange={setActiveTab} />;
      case 'settings': return <SettingsTab onTabChange={setActiveTab} />;
      default: return <FoundingInfoTab onTabChange={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl shadow-sm border border-gray-100 min-h-screen">
        <FaSpinner className="text-4xl text-[#3AB4E6] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  // Nếu chưa thiết lập thông tin (profileSetup == false)
  if (company && !company.profileSetup) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-sky-50 rounded-2xl flex items-center justify-center mb-6 text-[#3AB4E6]">
          <FaRocket className="text-4xl" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-3">
          Chào mừng đến với ITing!
        </h2>
        <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
          Tài khoản của bạn hiện chưa có thông tin công ty. Vui lòng tạo yêu cầu cập nhật thông tin để bắt đầu sử dụng đầy đủ các tính năng dành cho nhà tuyển dụng.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => {
              // Chuyển sang tab founding và thông tin ở đó sẽ tự hiển thị nút tạo yêu cầu
              // Hoặc ta có thể truyền state để mở modal trực tiếp nếu cần
              setCompany({ ...company, profileSetup: true }); // Giả lập để vào xem giao diện tabs
            }}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#3AB4E6] text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(58,180,230,0.39)] hover:brightness-105 active:scale-95 transition-all"
          >
            <FaPlus />
            Tạo yêu cầu ngay
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-3xl">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-3">
              <FaPlus className="text-sm" />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Bước 1</p>
            <p className="text-sm font-medium text-gray-700">Tạo yêu cầu</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-3">
              <FaCog className="text-sm" />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Bước 2</p>
            <p className="text-sm font-medium text-gray-700">Chờ phê duyệt</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-blue-50 text-[#1967D2] rounded-full flex items-center justify-center mb-3">
              <FaGlobe className="text-sm" />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Bước 3</p>
            <p className="text-sm font-medium text-gray-700">Sẵn sàng tuyển dụng</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 min-h-screen">
      {/* 3. Dùng t('key') cho tiêu đề */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {t('company_profile.title')}
      </h2>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('founding')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2 ${activeTab === 'founding'
            ? 'border-[#3AB4E6] text-[#3AB4E6]'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <FaUser /> {t('company_profile.tabs.founding')}
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2 ${activeTab === 'social'
            ? 'border-[#3AB4E6] text-[#3AB4E6]'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <FaGlobe /> {t('company_profile.tabs.social')}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2 ${activeTab === 'settings'
            ? 'border-[#3AB4E6] text-[#3AB4E6]'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <FaCog /> {t('company_profile.tabs.settings')}
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="animate-fade-in">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CompanyProfile;
