import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useModalEscape } from '../../../../hooks/useModalEscape';
import { FaEnvelope, FaExternalLinkAlt, FaStar, FaRegStar, FaUserTie, FaTimes, FaPhone } from 'react-icons/fa';
import axiosInstance from '../../../../utils/axiosInstance';

const emptyArray = [];

const RecruiterPreviewModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useModalEscape(isOpen ? onClose : null);

    const [personalProfile, setPersonalProfile] = useState(null);
    const [professionalProfile, setProfessionalProfile] = useState(null);
    const [skills, setSkills] = useState(emptyArray);
    const [experiences, setExperiences] = useState(emptyArray);
    const [educations, setEducations] = useState(emptyArray);
    const [certificates, setCertificates] = useState(emptyArray);
    const [portfolios, setPortfolios] = useState(emptyArray);
    const [socialLinks, setSocialLinks] = useState(emptyArray);
    const [cvs, setCvs] = useState(emptyArray);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const fetchPreview = async () => {
            setLoading(true);
            setError('');

            try {
                const [
                    personal,
                    professional,
                    fetchedSkills,
                    fetchedExperiences,
                    fetchedEducations,
                    fetchedCertificates,
                    fetchedPortfolios,
                    fetchedSocialLinks,
                    fetchedCvs,
                ] = await Promise.all([
                    axiosInstance.get('/user/profile'),
                    axiosInstance.get('/user/professional-profile'),
                    axiosInstance.get('/user/professional-profile/skills'),
                    axiosInstance.get('/user/professional-profile/experience'),
                    axiosInstance.get('/user/professional-profile/education'),
                    axiosInstance.get('/user/professional-profile/certificates'),
                    axiosInstance.get('/user/professional-profile/portfolios'),
                    axiosInstance.get('/user/professional-profile/social-links'),
                    axiosInstance.get('/user/professional-profile/cv'),
                ]);

                setPersonalProfile(personal || null);
                setProfessionalProfile(professional || null);
                setSkills(fetchedSkills || emptyArray);
                setExperiences(fetchedExperiences || emptyArray);
                setEducations(fetchedEducations || emptyArray);
                setCertificates(fetchedCertificates || emptyArray);
                setPortfolios(fetchedPortfolios || emptyArray);
                setSocialLinks(fetchedSocialLinks || emptyArray);
                setCvs(fetchedCvs || emptyArray);
            } catch (e) {
                console.error('Failed to load recruiter preview', e);
                setError('Không thể tải dữ liệu preview. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchPreview();
    }, [isOpen]);

    const defaultCv = useMemo(() => cvs.find((cv) => cv.isDefault) || cvs[0], [cvs]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
            onClick={onClose} >

            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden relative animate-scale-up border border-white/20 flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                {/* CỘT TRÁI: PREVIEW CV (4/7) */}
                <div className="flex-[4] bg-slate-100 flex flex-col border-r border-slate-200">
                    <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-[#1967D2]">
                                <FaUserTie size={18} />
                            </div>
                            <h3 className="font-bold text-slate-800">Review Hồ sơ ứng viên (Xem trước)</h3>
                        </div>
                        {defaultCv?.fileUrl && (
                            <a
                                href={defaultCv.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-[#1967D2] hover:underline flex items-center gap-1"
                            >
                                <FaExternalLinkAlt size={10} /> Mở trong tab mới
                            </a>
                        )}
                    </div>

                    <div className="flex-1 bg-[#525659] overflow-hidden">
                        {defaultCv?.fileUrl ? (
                            <iframe
                                src={`${defaultCv.fileUrl}#toolbar=0`}
                                className="w-full h-full border-none"
                                title="Xem trước CV"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4 p-12 text-center bg-slate-100">
                                <div className="p-6 bg-slate-200 rounded-full animate-pulse">
                                    <FaUserTie size={48} className="opacity-20" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-600">Không tìm thấy file CV</p>
                                    <p className="text-sm">Bạn chưa đính kèm CV hoặc file đã bị lỗi.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* CỘT PHẢI: THÔNG TIN & THAO TÁC (3/7) */}
                <div className="flex-[3] flex flex-col bg-white overflow-hidden">
                    {/* Header Action */}
                    <div className="p-6 border-b border-slate-100 flex justify-end items-center shrink-0">
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                        {loading && <div className="text-center py-10 text-slate-500">Đang tải dữ liệu preview...</div>}
                        {!loading && error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}

                        {!loading && !error && (
                            <>
                                {/* Profile Summary */}
                                <div className="flex items-center gap-5">
                                    <img
                                        src={personalProfile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(personalProfile?.fullName || 'Ung vien')}&background=random`}
                                        alt={personalProfile?.fullName}
                                        className="w-20 h-20 rounded-2xl border-2 border-slate-100 shadow-sm object-cover bg-white"
                                    />
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-7">{personalProfile?.fullName || "Chưa cập nhật"}</h2>
                                        <p className="text-blue-600 font-bold text-sm mt-1">{professionalProfile?.headline || "Vị trí ứng tuyển"}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-slate-400 text-xs">Xem với vai trò: NHÀ TUYỂN DỤNG</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Quick Box */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Số điện thoại</p>
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                            <FaPhone className="text-blue-500" size={12} />
                                            {personalProfile?.phoneNum || "N/A"}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</p>
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm truncate" title={personalProfile?.email}>
                                            <FaEnvelope className="text-blue-500" size={12} />
                                            {personalProfile?.email || "N/A"}
                                        </div>
                                    </div>
                                </div>

                                {/* Introduction */}
                                <section>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                        Giới thiệu bản thân
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                                        {professionalProfile?.shortBio || "Ứng viên chưa cập nhật thông tin giới thiệu chi tiết."}
                                    </p>
                                </section>

                                {/* Skills Section */}
                                {skills && skills.length > 0 && (
                                    <section>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                            Kỹ năng
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((skill, idx) => (
                                                <span key={idx} className="px-3 py-1.5 bg-green-50 text-green-700 font-bold text-xs rounded-lg border border-green-100 flex items-center gap-1.5">
                                                    {skill.name}
                                                    
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Social Links Section */}
                                {socialLinks && socialLinks.length > 0 && (
                                    <section>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                                            Liên kết mạng xã hội
                                        </h4>
                                        <div className="flex flex-col gap-2">
                                            {socialLinks.map((link, idx) => (
                                                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-2 w-max">
                                                    <FaExternalLinkAlt size={12} /> {link.platform || link.url}
                                                </a>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Experience Section */}
                                {experiences && experiences.length > 0 && (
                                    <section>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                                            Kinh nghiệm làm việc
                                        </h4>
                                        <div className="space-y-4">
                                            {experiences.map((exp, idx) => (
                                                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <h5 className="font-bold text-slate-800">{exp.position} - {exp.companyName}</h5>
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">
                                                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString('vi-VN') : ''} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
                                                    </p>
                                                    {exp.description && (
                                                        <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{exp.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Education Section */}
                                {educations && educations.length > 0 && (
                                    <section>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                            Học vấn
                                        </h4>
                                        <div className="space-y-4">
                                            {educations.map((edu, idx) => (
                                                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <h5 className="font-bold text-slate-800">{edu.schoolName}</h5>
                                                    <p className="text-sm text-slate-600 font-medium">{edu.major || edu.fieldOfStudy} {edu.degree && `- ${edu.degree}`}</p>
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">
                                                        {edu.startDate ? new Date(edu.startDate).toLocaleDateString('vi-VN') : ''} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
                                                    </p>
                                                    {edu.description && (
                                                        <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{edu.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Certificates Section */}
                                {certificates && certificates.length > 0 && (
                                    <section>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                                            Chứng chỉ
                                        </h4>
                                        <div className="space-y-3">
                                            {certificates.map((cert, idx) => (
                                                <div key={idx} className="p-3 bg-yellow-50/50 rounded-xl border border-yellow-100">
                                                    <h5 className="font-bold text-slate-800">{cert.title || cert.name}</h5>
                                                    <p className="text-sm text-slate-600">{cert.issuingOrganization || cert.organization}</p>
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">
                                                        Cấp: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('vi-VN') : 'N/A'} 
                                                        {cert.credentialUrl && (
                                                            <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">
                                                                Xem chứng chỉ
                                                            </a>
                                                        )}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Portfolios Section */}
                                {portfolios && portfolios.length > 0 && (
                                    <section>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                            Portfolio / Dự án
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {portfolios.map((port, idx) => (
                                                <div key={idx} className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100">
                                                    <h5 className="font-bold text-slate-800">{port.title}</h5>
                                                    {port.url && (
                                                        <a href={port.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                                            <FaExternalLinkAlt size={10} /> Link dự án
                                                        </a>
                                                    )}
                                                    {port.description && (
                                                        <p className="text-sm text-slate-600 mt-2 line-clamp-3" title={port.description}>{port.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default RecruiterPreviewModal;
