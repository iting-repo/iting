import React, { useState, useEffect } from 'react';
import { FaUser, FaBriefcase, FaShareAlt, FaShieldAlt } from 'react-icons/fa';
import PersonalInfoTab from './components/PersonalInfoTab';
import ProfessionalInfoTab from './components/ProfessionalInfoTab';
import SocialLinksTab from './components/SocialLinksTab';
import AccountTab from './components/AccountTab';

const CandidateProfile = ({ defaultTab = 'personal' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab); // 'personal' | 'professional' | 'social' | 'account'

  // Cập nhật tab khi defaultTab thay đổi (ví dụ: chuyển đổi giữa route Profile và Settings)
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const renderContent = () => {
    switch(activeTab) {
      case 'personal': return <PersonalInfoTab />;
      case 'professional': return <ProfessionalInfoTab />;
      case 'social': return <SocialLinksTab />;
      case 'account': return <AccountTab />;
      default: return <PersonalInfoTab />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 min-h-screen shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {activeTab === 'account' ? 'Thiết lập tài khoản' : 'Hồ sơ của tôi'}
      </h2>

      {/* TABS HEADER */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'personal' ? 'border-[#3AB4E6] text-[#3AB4E6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
           <FaUser /> Thông tin cá nhân
        </button>
        <button 
          onClick={() => setActiveTab('professional')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'professional' ? 'border-[#3AB4E6] text-[#3AB4E6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
           <FaBriefcase /> Hồ sơ chuyên nghiệp
        </button>
        <button 
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'social' ? 'border-[#3AB4E6] text-[#3AB4E6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
           <FaShareAlt /> Liên kết mạng xã hội
        </button>
        <button 
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'account' ? 'border-[#3AB4E6] text-[#3AB4E6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
           <FaShieldAlt /> Bảo mật & Tài khoản
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="animate-fade-in">
         {renderContent()}
      </div>

    </div>
  );
};

export default CandidateProfile;