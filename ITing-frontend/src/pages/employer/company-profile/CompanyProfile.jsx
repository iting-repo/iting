import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaUser, FaGlobe, FaCog, FaPlus, FaRocket, FaSpinner, FaShieldAlt, FaFileContract, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import FoundingInfoTab from './components/FoundingInfoTab';
import SocialMediaTab from './components/SocialMediaTab';
import SettingsTab from './components/SettingsTab';
import Verification from '../Verification';
import DataProcessing from '../DataProcessing';
import companyService from '../../../services/companyService';
import { Breadcrumb } from '../../../components/common';

const CompanyProfile = () => {
  const { t } = useTranslation();
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

  // Sync tab from URL query param (?tab=settings)
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['founding', 'social', 'settings', 'verification', 'data-processing'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'founding': return <FoundingInfoTab onTabChange={setActiveTab} />;
      case 'social': return <SocialMediaTab onTabChange={setActiveTab} />;
      case 'settings': return <SettingsTab onTabChange={setActiveTab} />;
      case 'verification': return <Verification />;
      case 'data-processing': return <DataProcessing />;
      default: return <FoundingInfoTab onTabChange={setActiveTab} />;
    }
  };

  // CTA steps dựa trên dữ liệu thực từ 3 tab
  const ctaSteps = useMemo(() => {
    if (!company) return [];

    const infoStatus = company.companyInfoUpdateStatus;
    const infoDone = infoStatus === 'APPROVED' || company.verificationLevel === 'BASIC' || company.verificationLevel === 'ADVANCED' || company.verificationLevel === 'VERIFIED';
    const infoPending = infoStatus === 'PENDING_REVIEW';

    const licenseDone = company.documentReviewStatus === 'APPROVED' || company.verificationLevel === 'ADVANCED' || company.verificationLevel === 'VERIFIED';
    const licensePending = company.documentReviewStatus === 'PENDING_REVIEW';

    const consentDone = company.consentDocumentStatus === 'APPROVED';
    const consentPending = company.consentDocumentStatus === 'PENDING_REVIEW';

    return [
      {
        label: 'Cập nhật thông tin công ty',
        description: 'Điền đầy đủ thông tin doanh nghiệp',
        done: infoDone,
        pending: infoPending,
        tab: 'founding',
        icon: <FaUser />,
        color: 'green',
      },
      {
        label: 'Xác thực Giấy ĐKKD',
        description: 'Tải lên giấy đăng ký kinh doanh',
        done: licenseDone,
        pending: licensePending,
        tab: 'verification',
        icon: <FaShieldAlt />,
        color: 'blue',
      },
      {
        label: 'Thỏa thuận dữ liệu',
        description: 'Nộp văn bản thỏa thuận xử lý dữ liệu',
        done: consentDone,
        pending: consentPending,
        tab: 'data-processing',
        icon: <FaFileContract />,
        color: 'amber',
      },
    ];
  }, [company]);

  const completedSteps = ctaSteps.filter(s => s.done).length;

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
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 min-h-screen pt-12">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-sky-50 rounded-2xl flex items-center justify-center mb-6 text-[#3AB4E6] mx-auto">
            <FaRocket className="text-4xl" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-3">
            Chào mừng đến với ITing!
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
            Hoàn thành 3 bước dưới đây để xác thực doanh nghiệp và mở khóa đầy đủ tính năng nhà tuyển dụng.
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">Tiến trình thiết lập</span>
            <span className="text-sm font-bold text-[#3AB4E6]">{completedSteps}/{ctaSteps.length} hoàn thành</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200/60">
            <div
              className="h-full rounded-full bg-[#3AB4E6] transition-all duration-700 ease-out"
              style={{ width: `${ctaSteps.length > 0 ? Math.round((completedSteps / ctaSteps.length) * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* 3 Steps from data */}
        <div className="max-w-2xl mx-auto space-y-4 mb-10">
          {ctaSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setCompany({ ...company, profileSetup: true }) || setTimeout(() => setActiveTab(step.tab), 0)}
              className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-all text-left group hover:shadow-md ${
                step.done
                  ? 'bg-green-50/50 border-green-200'
                  : step.pending
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-white border-gray-200 hover:border-[#3AB4E6]'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-lg ${
                step.done
                  ? 'bg-green-100 text-green-600'
                  : step.pending
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-[#3AB4E6]'
              }`}>
                {step.done ? <FaCheckCircle /> : step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${step.done ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                  Bước {idx + 1}: {step.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {step.done && (
                  <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full uppercase">Hoàn thành</span>
                )}
                {step.pending && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full uppercase">Chờ duyệt</span>
                )}
                {!step.done && !step.pending && (
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full uppercase">Chưa làm</span>
                )}
                <FaArrowRight className="text-gray-300 group-hover:text-[#3AB4E6] transition-colors" />
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => setCompany({ ...company, profileSetup: true })}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#3AB4E6] text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(58,180,230,0.39)] hover:brightness-105 active:scale-95 transition-all"
          >
            <FaPlus />
            Bắt đầu thiết lập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 min-h-screen">
      <Breadcrumb
        rootLabel="Tổng quan"
        rootLink="/employer/dashboard"
        items={[{ label: 'Hồ sơ công ty' }]}
      />
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        {t('company_profile.title')}
      </h2>
      <p className="text-gray-500 text-sm mb-6">Quản lý và cập nhật thông tin doanh nghiệp của bạn</p>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('founding')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'founding'
            ? 'border-[#3AB4E6] text-[#3AB4E6]'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <FaUser /> {t('company_profile.tabs.founding')}
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'verification'
            ? 'border-[#3AB4E6] text-[#3AB4E6]'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <FaShieldAlt /> Xác thực tài khoản
        </button>

        <button
          onClick={() => setActiveTab('data-processing')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'data-processing'
            ? 'border-[#3AB4E6] text-[#3AB4E6]'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <FaFileContract /> Thỏa thuận dữ liệu
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'social'
            ? 'border-[#3AB4E6] text-[#3AB4E6]'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <FaGlobe /> {t('company_profile.tabs.social')}
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
