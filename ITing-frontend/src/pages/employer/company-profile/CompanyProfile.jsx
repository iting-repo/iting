import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import hook
import { FaUser, FaGlobe, FaCog } from 'react-icons/fa';
import FoundingInfoTab from './components/FoundingInfoTab';
import SocialMediaTab from './components/SocialMediaTab';
import SettingsTab from './components/SettingsTab';

const CompanyProfile = () => {
  const { t } = useTranslation(); // 2. Khởi tạo hàm t
  const [activeTab, setActiveTab] = useState('founding');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'founding': return <FoundingInfoTab />;
      case 'social': return <SocialMediaTab />;
      case 'settings': return <SettingsTab />;
      default: return <FoundingInfoTab />;
    }
  };

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