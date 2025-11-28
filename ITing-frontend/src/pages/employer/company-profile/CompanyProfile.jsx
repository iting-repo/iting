import React, { useState } from 'react';
import { FaUser, FaGlobe, FaCog } from 'react-icons/fa';
import FoundingInfoTab from './components/FoundingInfoTab';
import SocialMediaTab from './components/SocialMediaTab';
import SettingsTab from './components/SettingsTab';

const CompanyProfile = () => {
  const [activeTab, setActiveTab] = useState('founding'); // 'founding' | 'social' | 'settings'

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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin công ty</h2>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('founding')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2 ${
            activeTab === 'founding'
              ? 'border-[#3AB4E6] text-[#3AB4E6]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FaUser /> Thông tin giới thiệu
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2 ${
            activeTab === 'social'
              ? 'border-[#3AB4E6] text-[#3AB4E6]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FaGlobe /> Mạng xã hội
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2 ${
            activeTab === 'settings'
              ? 'border-[#3AB4E6] text-[#3AB4E6]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FaCog /> Cài đặt tài khoản
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