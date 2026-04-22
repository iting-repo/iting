import React from 'react';
import { FaEye, FaPlusCircle } from 'react-icons/fa';
import BasicInfoSection from '../professional/BasicInfoSection';
import CertificateSection from '../professional/CertificateSection';
import CVSection from '../professional/CVSection';
import EducationSection from '../professional/EducationSection';
import ExperienceSection from '../professional/ExperienceSection';
import PortfolioSection from '../professional/PortfolioSection';
import SkillsSection from '../professional/SkillsSection';

const ProfessionalInfoTab = () => {
    return (
        <div className="space-y-10">
            {/* Header with Preview Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <div>
                    <h3 className="text-xl font-bold text-blue-900">Hoàn thiện hồ sơ chuyên nghiệp</h3>
                    <p className="text-blue-700 text-sm mt-1">Thông tin này sẽ được hiển thị trực tiếp cho nhà tuyển dụng khi họ xem hồ sơ của bạn.</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm whitespace-nowrap">
                    <FaEye /> Xem với vai trò nhà tuyển dụng
                </button>
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 gap-8">
                {/* Basic Info & CV (Top row priority) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <BasicInfoSection />
                    <CVSection />
                </div>

                {/* Main sections */}
                <ExperienceSection />
                <EducationSection />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <SkillsSection />
                    <CertificateSection />
                </div>

                <PortfolioSection />
            </div>

            {/* Bottom Help/CTA */}
            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 mb-4">Bạn muốn thêm mục khác vào hồ sơ?</p>
                <button className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-black transition-all">
                    <FaPlusCircle /> Thêm tùy chọn mới
                </button>
            </div>
        </div>
    );
};

export default ProfessionalInfoTab;
