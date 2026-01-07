import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaFileAlt, FaGlobe, FaCog } from 'react-icons/fa';
import PersonalTab from './components/PersonalTab';
import ProfileInfoTab from './components/ProfileInfoTab';
import SocialLinksTab from './components/SocialLinksTab';
import AccountSettingsTab from './components/AccountSettingsTab';
import { fetchProfileRequest } from '../../../store/user/userSlice';

const CandidateProfile = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'profile' | 'social' | 'settings'

  const { currentUser } = useSelector((state) => state.auth);
  const { profile, isLoading } = useSelector((state) => state.user);

  // Hardcode userId = 3 tạm thời nếu chưa có auth thực tế, hoặc lấy từ currentUser
  const userId = currentUser?.userId;

  useEffect(() => {
    if (userId && !profile) {
      dispatch(fetchProfileRequest({ userId }));
    }
  }, [dispatch, userId, profile]);

  const renderContent = () => {
    switch (activeTab) {
      case 'personal': return <PersonalTab initialData={profile} isLoading={isLoading} />;
      case 'profile': return <ProfileInfoTab />;
      case 'social': return <SocialLinksTab />;
      case 'settings': return <AccountSettingsTab />;
      default: return <PersonalTab initialData={profile} isLoading={isLoading} />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 min-h-screen shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Cài đặt</h2>

      {/* TABS HEADER */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'personal' ? 'border-[#3AB4E6] text-[#3AB4E6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <FaUser /> Cá nhân
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'profile' ? 'border-[#3AB4E6] text-[#3AB4E6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <FaFileAlt /> Hồ sơ
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'social' ? 'border-[#3AB4E6] text-[#3AB4E6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <FaGlobe /> Liên kết khác
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'settings' ? 'border-[#3AB4E6] text-[#3AB4E6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <FaCog /> Cài đặt tài khoản
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