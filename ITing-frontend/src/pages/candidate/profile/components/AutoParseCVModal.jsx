import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaMagic, FaFileAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useModalEscape } from '../../../../hooks/useModalEscape';
import cvService from '../../../../services/cvService';
import axiosInstance from '../../../../utils/axiosInstance';
import { toast } from 'sonner';

/** Convert Gemini date "YYYY-MM" → backend "YYYY-MM-DD" (first of month). Null nếu rỗng. */
const toFullDate = (ym) => {
    if (!ym || typeof ym !== 'string') return null;
    if (/^\d{4}-\d{2}$/.test(ym)) return `${ym}-01`;
    if (/^\d{4}-\d{2}-\d{2}$/.test(ym)) return ym;
    return null;
};

const AutoParseCVModal = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(0); // 0: Select, 1: Parsing, 2: Success
    const [progress, setProgress] = useState(0);
    const [parseLog, setParseLog] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useModalEscape(isOpen ? onClose : null);

    useEffect(() => {
        if (!isOpen) {
            setStep(0);
            setProgress(0);
            setParseLog('');
            setSelectedFile(null);
            setParsedData(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (step === 1) {
            let currentProgress = 0;
            const interval = setInterval(() => {
                currentProgress += Math.random() * 15;
                if (currentProgress > 100) currentProgress = 100;
                setProgress(Math.floor(currentProgress));

                if (currentProgress > 20 && currentProgress < 40) setParseLog('Đang trích xuất Thông tin cơ bản...');
                if (currentProgress > 40 && currentProgress < 60) setParseLog('Đang phân tích Kinh nghiệm làm việc...');
                if (currentProgress > 60 && currentProgress < 80) setParseLog('Đang nhận diện Kỹ năng chuyên môn...');
                if (currentProgress > 80 && currentProgress < 95) setParseLog('Đang trích xuất Học vấn & Chứng chỉ...');
                if (currentProgress >= 100) {
                    clearInterval(interval);
                    setParseLog('Phân tích hoàn tất!');
                    setTimeout(() => setStep(2), 500);
                }
            }, 300);
            return () => clearInterval(interval);
        }
    }, [step]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleStartParse = async () => {
        if (!selectedFile) {
            toast.error('Vui lòng chọn một file CV (PDF hoặc Ảnh) trước');
            return;
        }

        setStep(1);
        setParseLog('Đang tải file lên hệ thống AI...');
        setProgress(10);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Gửi API call tới Spring Boot.
            // axiosInstance interceptor đã unwrap response.data → response chính là body Gemini trả về.
            const response = await cvService.parseCV(formData);
            let finalJson = typeof response === 'string' ? JSON.parse(response) : response;
            
            setParsedData(finalJson);
            setProgress(100);
            setParseLog('Phân tích hoàn tất!');
            setTimeout(() => setStep(2), 600);
            
        } catch (error) {
            console.error('Lỗi khi phân tích CV:', error);
            toast.error('Có lỗi xảy ra khi phân tích CV. Vui lòng thử lại sau.');
            setStep(0);
            setProgress(0);
        }
    };

    const handleFinish = async () => {
        if (!parsedData) {
            onClose();
            return;
        }
        setIsSaving(true);

        const counters = { skills: 0, experiences: 0, educations: 0, certificates: 0, skipped: 0, updated: 0, errors: 0 };
        const norm = (s) => (s || '').toString().trim().toLowerCase();

        // Fetch existing để dedup: parse lần 2 sẽ skip/update item đã có thay vì tạo duplicate.
        let existing = { skills: [], experiences: [], educations: [], certificates: [] };
        try {
            const [s, exps, edus, certs] = await Promise.all([
                axiosInstance.get('/user/professional-profile/skills'),
                axiosInstance.get('/user/professional-profile/experience'),
                axiosInstance.get('/user/professional-profile/education'),
                axiosInstance.get('/user/professional-profile/certificates'),
            ]);
            existing = {
                skills: Array.isArray(s) ? s : (s?.data || []),
                experiences: Array.isArray(exps) ? exps : (exps?.data || []),
                educations: Array.isArray(edus) ? edus : (edus?.data || []),
                certificates: Array.isArray(certs) ? certs : (certs?.data || []),
            };
        } catch (e) {
            console.warn('Could not fetch existing profile for dedup, proceeding anyway:', e);
        }

        const skillKey = (x) => norm(x?.name);
        const expKey = (x) => `${norm(x?.companyName)}|${norm(x?.position)}`;
        const eduKey = (x) => `${norm(x?.schoolName)}|${norm(x?.major || x?.degree)}`;
        const certKey = (x) => `${norm(x?.title)}|${norm(x?.issuingOrganization)}`;

        const existingSkillKeys = new Set(existing.skills.map(skillKey));
        const existingExpMap = new Map(existing.experiences.map((x) => [expKey(x), x]));
        const existingEduMap = new Map(existing.educations.map((x) => [eduKey(x), x]));
        const existingCertMap = new Map(existing.certificates.map((x) => [certKey(x), x]));

        // Skills: skip nếu name đã tồn tại (case-insensitive)
        for (const skill of (parsedData.skills || [])) {
            const name = typeof skill === 'string' ? skill.trim() : skill?.name?.trim();
            if (!name) continue;
            if (existingSkillKeys.has(norm(name))) { counters.skipped++; continue; }
            try {
                await axiosInstance.post('/user/professional-profile/skills', { name });
                counters.skills++;
                existingSkillKeys.add(norm(name));
            } catch (e) {
                counters.errors++;
                console.error('Add skill failed:', name, e);
            }
        }

        // Experiences: PUT nếu (companyName, position) đã tồn tại; else POST
        for (const exp of (parsedData.experiences || [])) {
            if (!exp?.companyName || !exp?.position || !exp?.startDate) continue;
            const body = {
                companyName: exp.companyName,
                position: exp.position,
                startDate: toFullDate(exp.startDate),
                endDate: toFullDate(exp.endDate),
                isCurrent: !exp.endDate,
                description: exp.description || '',
            };
            const key = expKey(exp);
            const dup = existingExpMap.get(key);
            try {
                if (dup) {
                    await axiosInstance.put(`/user/professional-profile/experience/${dup.id}`, body);
                    counters.updated++;
                } else {
                    await axiosInstance.post('/user/professional-profile/experience', body);
                    counters.experiences++;
                }
            } catch (e) {
                counters.errors++;
                console.error('Add/update experience failed:', exp, e);
            }
        }

        // Educations: PUT nếu (schoolName, major/degree) đã tồn tại; else POST
        for (const edu of (parsedData.educations || [])) {
            if (!edu?.schoolName || !edu?.startDate) continue;
            const body = {
                schoolName: edu.schoolName,
                major: edu.degree || edu.major || edu.schoolName,
                degree: edu.degree || '',
                areaOfStudy: '',
                startDate: toFullDate(edu.startDate),
                endDate: toFullDate(edu.endDate),
            };
            const key = eduKey({ schoolName: edu.schoolName, major: body.major, degree: body.degree });
            const dup = existingEduMap.get(key);
            try {
                if (dup) {
                    await axiosInstance.put(`/user/professional-profile/education/${dup.id}`, body);
                    counters.updated++;
                } else {
                    await axiosInstance.post('/user/professional-profile/education', body);
                    counters.educations++;
                }
            } catch (e) {
                counters.errors++;
                console.error('Add/update education failed:', edu, e);
            }
        }

        // Certificates: PUT nếu (title, organization) đã tồn tại; else POST
        for (const cert of (parsedData.certificates || [])) {
            if (!cert?.name) continue;
            const body = {
                title: cert.name,
                issuingOrganization: cert.organization?.trim() || null,
                issueDate: toFullDate(cert.issueDate),
                expirationDate: null,
                doesNotExpire: true,
            };
            const key = certKey({ title: body.title, issuingOrganization: body.issuingOrganization });
            const dup = existingCertMap.get(key);
            try {
                if (dup) {
                    await axiosInstance.put(`/user/professional-profile/certificates/${dup.id}`, body);
                    counters.updated++;
                } else {
                    await axiosInstance.post('/user/professional-profile/certificates', body);
                    counters.certificates++;
                }
            } catch (e) {
                counters.errors++;
                console.error('Add/update certificate failed:', cert, e);
            }
        }

        setIsSaving(false);

        const added = counters.skills + counters.experiences + counters.educations + counters.certificates;
        const parts = [];
        if (added > 0) parts.push(`thêm ${added} mục mới`);
        if (counters.updated > 0) parts.push(`cập nhật ${counters.updated} mục`);
        if (counters.skipped > 0) parts.push(`bỏ qua ${counters.skipped} trùng`);
        const summary = parts.length ? parts.join(', ') : 'không có thay đổi';

        if (counters.errors > 0) {
            toast.warning(`Đã ${summary}. (${counters.errors} lỗi — kiểm tra console)`);
        } else {
            toast.success(`Đã ${summary} từ CV.`);
        }

        onClose();
        if (onComplete) onComplete(parsedData);
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center gap-2 text-indigo-700">
                        <FaMagic />
                        <h3 className="font-bold">Auto-Fill bằng AI</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-indigo-100 text-indigo-400 transition-colors">
                        <FaTimes />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 0 && (
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-500 mb-4">
                                <FaFileAlt size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800">Tự động điền hồ sơ</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Chọn CV của bạn (PDF/Image). AI của ITing sẽ đọc và tự động điền các thông tin như Kỹ năng, Kinh nghiệm, và Học vấn vào hồ sơ chuyên nghiệp.
                            </p>
                            
                            <div className="mt-4">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-indigo-300 border-dashed rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FaFileAlt className="w-8 h-8 mb-2 text-indigo-500" />
                                        <p className="mb-2 text-sm text-indigo-600 font-medium">
                                            {selectedFile ? selectedFile.name : 'Click để chọn file CV'}
                                        </p>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept=".pdf,image/*" 
                                        onChange={handleFileChange} 
                                    />
                                </label>
                            </div>

                            <button
                                onClick={handleStartParse}
                                disabled={!selectedFile}
                                className={`w-full mt-4 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                                    selectedFile ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <FaMagic /> Bắt đầu phân tích
                            </button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="text-center space-y-6 py-4">
                            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                                <div
                                    className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"
                                ></div>
                                <FaMagic className="text-indigo-600 animate-pulse" size={28} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-1">AI đang xử lý...</h4>
                                <p className="text-sm text-indigo-600 font-medium">{progress}%</p>
                            </div>
                            
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 animate-pulse">{parseLog}</p>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center space-y-4 py-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-500 mb-4">
                                <FaCheckCircle size={40} />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800">Phân tích thành công!</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                AI đã trích xuất các thông tin sau từ CV. Bấm <strong>Áp dụng</strong> để thêm vào hồ sơ.
                            </p>

                            {/* Preview counters */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-indigo-50 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-indigo-600">{(parsedData?.skills || []).length}</div>
                                    <div className="text-xs text-indigo-700">Kỹ năng</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-purple-600">{(parsedData?.experiences || []).length}</div>
                                    <div className="text-xs text-purple-700">Kinh nghiệm</div>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-blue-600">{(parsedData?.educations || []).length}</div>
                                    <div className="text-xs text-blue-700">Học vấn</div>
                                </div>
                                <div className="bg-amber-50 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-amber-600">{(parsedData?.certificates || []).length}</div>
                                    <div className="text-xs text-amber-700">Chứng chỉ</div>
                                </div>
                            </div>

                            <button
                                onClick={handleFinish}
                                disabled={isSaving}
                                className={`w-full mt-4 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                                    isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {isSaving ? <><FaSpinner className="animate-spin" /> Đang áp dụng...</> : 'Áp dụng vào hồ sơ'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AutoParseCVModal;
