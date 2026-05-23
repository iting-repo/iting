import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { FaUser, FaBriefcase, FaShareAlt, FaShieldAlt } from 'react-icons/fa';
import PersonalInfoTab from './components/PersonalInfoTab';
import ProfessionalInfoTab from './components/ProfessionalInfoTab';
import SocialLinksTab from './components/SocialLinksTab';
import AccountTab from './components/AccountTab';

const VALID_TABS = ['personal', 'professional', 'social', 'account'];

const CandidateProfile = ({ defaultTab = 'personal' }) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Ưu tiên: query param ?tab= > location.state.tab > defaultTab prop
  const resolveInitialTab = () => {
    const queryTab = searchParams.get('tab');
    if (queryTab && VALID_TABS.includes(queryTab)) return queryTab;
    const stateTab = location.state?.tab;
    if (stateTab && VALID_TABS.includes(stateTab)) return stateTab;
    return defaultTab;
  };

  const [activeTab, setActiveTab] = useState(resolveInitialTab);

  // Cập nhật tab khi defaultTab, query param, hoặc state thay đổi
  useEffect(() => {
    setActiveTab(resolveInitialTab());
  }, [defaultTab, searchParams, location.state]);

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
    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 min-h-screen shadow-sm border border-gray-100 flex flex-col w-full overflow-hidden">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
        {activeTab === 'account' ? 'Thiết lập tài khoản' : 'Hồ sơ của tôi'}
      </h2>

      {/* TABS HEADER */}
      <div className="flex border-b border-gray-200 mb-6 sm:mb-8 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'personal' ? 'border-[#3AB4E6] text-[#3AB4E6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
           <FaUser /> Thông tin cá nhân
        </button>
        <button 
          onClick={() => setActiveTab('professional')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'professional' ? 'border-[#3AB4E6] text-[#3AB4E6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
           <FaBriefcase /> Hồ sơ chuyên nghiệp
        </button>
        <button 
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'social' ? 'border-[#3AB4E6] text-[#3AB4E6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
           <FaShareAlt /> Liên kết mạng xã hội
        </button>
        <button 
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'account' ? 'border-[#3AB4E6] text-[#3AB4E6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
           <FaShieldAlt /> Bảo mật & Tài khoản
        </button>
      </div>

      {/* Required field legend */}
      <p className="text-xs text-gray-500 mb-4">
        <span className="text-red-500 font-semibold">*</span> Trường bắt buộc
      </p>

      {/* CONTENT AREA */}
      <div className="animate-fade-in">
         {renderContent()}
      </div>

    </div>
  );
};

export default CandidateProfile;