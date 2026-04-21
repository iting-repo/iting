import React, { useEffect, useMemo, useState } from 'react';
import { FaBriefcase, FaExternalLinkAlt, FaFilePdf, FaMapMarkerAlt, FaPhone, FaTimes, FaUser } from 'react-icons/fa';
import axiosInstance from '../../../../utils/axiosInstance';

const emptyArray = [];

const RecruiterPreviewModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    return (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-4" onClick={onClose}>
            <div
                className="w-full md:max-w-6xl h-[100dvh] md:h-[92dvh] bg-white md:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-base md:text-xl font-bold text-gray-900">Xem trước hồ sơ với vai trò nhà tuyển dụng</h3>
                        <p className="text-sm text-gray-500">Những gì bên tuyển dụng sẽ thấy khi mở profile của bạn</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                        <FaTimes />
                    </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-6">
                    {loading && <div className="text-center py-10 text-gray-500">Đang tải dữ liệu preview...</div>}

                    {!loading && error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}

                    {!loading && !error && (
                        <>
                            <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4 md:p-5">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <img
                                        src={personalProfile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(personalProfile?.fullName || 'Candidate')}&background=random`}
                                        alt={personalProfile?.fullName || 'Candidate'}
                                        className="w-20 h-20 rounded-2xl object-cover border border-gray-200 bg-white"
                                    />
                                    <div className="flex-1">
                                        <h4 className="text-xl font-bold text-gray-900">{personalProfile?.fullName || 'Chưa cập nhật'}</h4>
                                        <p className="text-blue-700 font-medium mt-1">{professionalProfile?.headline || 'Chưa cập nhật chức danh'}</p>
                                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                                            <span className="inline-flex items-center gap-2"><FaPhone className="text-gray-400" />{personalProfile?.phoneNum || 'Chưa cập nhật'}</span>
                                            <span className="inline-flex items-center gap-2"><FaMapMarkerAlt className="text-gray-400" />{professionalProfile?.location || 'Chưa cập nhật'}</span>
                                            <span className="inline-flex items-center gap-2"><FaBriefcase className="text-gray-400" />{professionalProfile?.totalExperienceYears ?? 0} năm kinh nghiệm</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">{professionalProfile?.shortBio || 'Ứng viên chưa thêm phần giới thiệu ngắn.'}</p>
                            </section>

                            <section className="rounded-2xl border border-gray-100 p-4 md:p-5">
                                <h5 className="font-semibold text-gray-900 mb-3">CV ứng viên</h5>
                                {defaultCv ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-blue-900 truncate">{defaultCv.title || defaultCv.fileName || 'CV mặc định'}</p>
                                            <p className="text-xs text-blue-700">{defaultCv.isDefault ? 'CV mặc định' : 'CV đã tải lên'}</p>
                                        </div>
                                        <a
                                            href={defaultCv.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-blue-200 text-blue-700 font-medium hover:bg-blue-100 whitespace-nowrap"
                                        >
                                            <FaFilePdf /> Xem CV
                                            <FaExternalLinkAlt className="text-xs" />
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Chưa có CV để hiển thị.</p>
                                )}
                            </section>

                            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="rounded-2xl border border-gray-100 p-4 md:p-5">
                                    <h5 className="font-semibold text-gray-900 mb-3">Kỹ năng</h5>
                                    {skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((s) => (
                                                <span key={s.id} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                    {s.name} {s.level ? `- ${s.level}` : ''}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Chưa cập nhật.</p>
                                    )}
                                </div>

                                <div className="rounded-2xl border border-gray-100 p-4 md:p-5">
                                    <h5 className="font-semibold text-gray-900 mb-3">Liên kết mạng xã hội</h5>
                                    {socialLinks.length > 0 ? (
                                        <ul className="space-y-2 text-sm">
                                            {socialLinks.map((item) => (
                                                <li key={item.id}>
                                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline inline-flex items-center gap-2">
                                                        <FaUser className="text-xs text-gray-400" /> {item.platform}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">Chưa cập nhật.</p>
                                    )}
                                </div>
                            </section>

                            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="rounded-2xl border border-gray-100 p-4 md:p-5">
                                    <h5 className="font-semibold text-gray-900 mb-3">Kinh nghiệm</h5>
                                    {experiences.length > 0 ? (
                                        <div className="space-y-3">
                                            {experiences.map((exp) => (
                                                <div key={exp.id} className="text-sm">
                                                    <p className="font-semibold text-gray-800">{exp.position} - {exp.companyName}</p>
                                                    <p className="text-gray-500">{exp.startDate} - {exp.isCurrent ? 'Hiện tại' : (exp.endDate || 'N/A')}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Chưa cập nhật.</p>
                                    )}
                                </div>

                                <div className="rounded-2xl border border-gray-100 p-4 md:p-5">
                                    <h5 className="font-semibold text-gray-900 mb-3">Học vấn</h5>
                                    {educations.length > 0 ? (
                                        <div className="space-y-3">
                                            {educations.map((edu) => (
                                                <div key={edu.id} className="text-sm">
                                                    <p className="font-semibold text-gray-800">{edu.schoolName}</p>
                                                    <p className="text-gray-600">{edu.major}{edu.degree ? ` - ${edu.degree}` : ''}</p>
                                                    <p className="text-gray-500">{edu.startDate} - {edu.endDate || 'Hiện tại'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Chưa cập nhật.</p>
                                    )}
                                </div>
                            </section>

                            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="rounded-2xl border border-gray-100 p-4 md:p-5">
                                    <h5 className="font-semibold text-gray-900 mb-3">Chứng chỉ</h5>
                                    {certificates.length > 0 ? (
                                        <div className="space-y-2 text-sm">
                                            {certificates.map((c) => (
                                                <p key={c.id} className="text-gray-700">{c.title} - {c.issuingOrganization}</p>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Chưa cập nhật.</p>
                                    )}
                                </div>

                                <div className="rounded-2xl border border-gray-100 p-4 md:p-5">
                                    <h5 className="font-semibold text-gray-900 mb-3">Portfolio</h5>
                                    {portfolios.length > 0 ? (
                                        <div className="space-y-2 text-sm">
                                            {portfolios.map((p) => (
                                                <div key={p.id}>
                                                    <p className="font-medium text-gray-800">{p.title}</p>
                                                    {p.url ? (
                                                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                                                            {p.url}
                                                        </a>
                                                    ) : (
                                                        <p className="text-gray-500">Không có link</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Chưa cập nhật.</p>
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecruiterPreviewModal;
