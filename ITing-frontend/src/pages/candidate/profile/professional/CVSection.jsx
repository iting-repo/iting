import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, CheckCircle, MoreVertical, Trash2, Star, Plus, Loader2, BarChart3, X, User } from 'lucide-react';
import { Button, Card, Input, ConfirmModal, Badge } from "../../../../components/common";
import axiosInstance from "../../../../utils/axiosInstance";
import cvService from "../../../../services/cvService";
import useConfirm from "../../../../hooks/useConfirm";
import { toast } from "sonner";
import CvBuilderModal from "../components/CvBuilderModal";

const CVSection = () => {
    const [cvs, setCvs] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [showBuilder, setShowBuilder] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [confirm, askConfirm, resetConfirm] = useConfirm();
    const [selectedFile, setSelectedFile] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    
    const [formData, setFormData] = useState({
        title: '',
        isDefault: false
    });

    // Per-row scoring state
    const [scoringCvId, setScoringCvId] = useState(null);
    const [scoreResult, setScoreResult] = useState(null);
    const [scoreModalCvId, setScoreModalCvId] = useState(null);
    const [scoreLanguage, setScoreLanguage] = useState('vi');

    useEffect(() => {
        fetchCVs();
        // Lấy avatar hiện tại (dùng làm ảnh trong CV builder)
        axiosInstance.get('/user/profile')
            .then((d) => setAvatarUrl(d?.avatarUrl || ''))
            .catch(() => {});
    }, []);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Vui lòng chọn file ảnh'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Ảnh tối đa 5MB'); return; }
        const fd = new FormData();
        fd.append('file', file);
        setAvatarUploading(true);
        try {
            const res = await axiosInstance.post('/user/profile/avatar/upload', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const url = res.avatarUrl || res.data?.avatarUrl;
            if (url) setAvatarUrl(url);
            toast.success('Đã cập nhật ảnh đại diện!');
        } catch (err) {
            console.error('Avatar upload failed', err);
            toast.error('Không thể tải ảnh lên. Vui lòng thử lại.');
        } finally {
            setAvatarUploading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

    const fetchCVs = async () => {
        try {
            const data = await axiosInstance.get('/user/professional-profile/cv');
            setCvs(data || []);
        } catch (error) {
            console.error("Failed to fetch CVs", error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            setFormErrors({ file: "Vui lòng chọn file CV!" });
            return;
        }

        const allowedTypes = [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!allowedTypes.includes(selectedFile.type)) {
            setFormErrors({ file: "Chỉ hỗ trợ định dạng PDF, DOC, DOCX" });
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setFormErrors({ file: "Kích thước file không được vượt quá 5MB" });
            return;
        }
        
        setFormErrors({});
        
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        if (formData.title) {
            uploadData.append('title', formData.title);
        }

        try {
            setIsUploading(true);
            await cvService.uploadCV(uploadData);
            
            // If user wants it default, we need a separate call if the upload endpoint doesn't handle it
            // Backend CVServiceImpl.uploadCV sets isDefault=false by default.
            // Let's check if we need to call setDefaultCV.
            
            toast.success("Tải CV lên thành công!");
            setFormData({ title: '', isDefault: false });
            setSelectedFile(null);
            setIsAdding(false);
            fetchCVs();
        } catch (error) {
            console.error("Failed to upload CV", error);
            toast.error(error.message || "Có lỗi xảy ra khi tải CV lên!");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = (id) => {
        askConfirm({
            title: "Xóa CV",
            message: "Bạn có chắc chắn muốn xóa CV này?",
            warning: "Hành động này không thể hoàn tác.",
            confirmText: "Xóa",
            onConfirm: async () => {
                resetConfirm();
                try {
                    await axiosInstance.delete(`/user/professional-profile/cv/${id}`);
                    fetchCVs();
                    toast.success("Đã xóa CV thành công.");
                } catch (error) {
                    console.error("Failed to delete CV", error);
                    toast.error("Có lỗi xảy ra khi xóa CV!");
                }
            }
        });
    };

    const handleSetDefault = async (id) => {
        try {
            await axiosInstance.patch(`/user/professional-profile/cv/${id}/default`);
            fetchCVs();
        } catch (error) {
            console.error("Failed to set default CV", error);
            alert("Có lỗi xảy ra khi thiết lập mặc định!");
        }
    };

    const handleScore = async (cvId, language = 'vi') => {
        try {
            setScoringCvId(cvId);
            setScoreLanguage(language);
            const result = await cvService.scoreCV(cvId, language);
            setScoreResult(result);
            setScoreModalCvId(cvId);
            fetchCVs();
        } catch (error) {
            console.error("Failed to score CV", error);
            const status = error?.httpStatus || error?.status;
            const errMsg = error?.error || error?.message || '';

            // 404 → CV đã bị xóa (auto-delete oldest khi upload CV thứ 4).
            // Refetch danh sách để UI đồng bộ với DB, CV stale sẽ tự biến mất.
            if (status === 404 || /không tồn tại|not found/i.test(errMsg)) {
                toast.error('CV này đã bị xóa. Danh sách CV đang được làm mới...', { duration: 4000 });
                setScoreModalCvId(null);
                setScoreResult(null);
                await fetchCVs();
            } else if (status === 502 || /tạm thời không khả dụng|temporarily unavailable|AI service/i.test(errMsg)) {
                // 502 → Gemini AI service tạm thời lỗi (Google 500 / network).
                // Khuyến khích user thử lại sau vài giây.
                toast.error(errMsg || 'AI chấm điểm tạm thời không khả dụng, vui lòng thử lại sau ít phút.', { duration: 5000 });
            } else {
                toast.error("Có lỗi khi chấm điểm CV. Vui lòng thử lại.");
            }
        } finally {
            setScoringCvId(null);
        }
    };

    const closeScoreModal = () => {
        setScoreModalCvId(null);
        setScoreResult(null);
    };

    const getScoreVariant = (score) => {
        if (score == null) return 'default';
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'danger';
    };

    const getScoreLabel = (score) => {
        if (score == null) return null;
        if (score >= 80) return scoreLanguage === 'en' ? 'Excellent' : 'Xuất sắc';
        if (score >= 60) return scoreLanguage === 'en' ? 'Good' : 'Khá';
        if (score >= 40) return scoreLanguage === 'en' ? 'Average' : 'Trung bình';
        return scoreLanguage === 'en' ? 'Needs improvement' : 'Cần cải thiện';
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900">CV / Resume</h3>
                    <p className="text-sm text-gray-600 mt-1">Quản lý các bản CV của bạn</p>
                </div>
                {!isAdding && (
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="primary" onClick={() => setShowBuilder(true)}>
                            <FileText className="w-4 h-4 mr-2" /> Tạo CV từ hồ sơ
                        </Button>
                        <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setIsAdding(true)}>
                            <Upload className="w-4 h-4 mr-2" /> Tải lên CV (PDF)
                        </Button>
                    </div>
                )}
            </div>

            <CvBuilderModal isOpen={showBuilder} onClose={() => setShowBuilder(false)} />

            {/* Ảnh đại diện — dùng làm avatar trong CV builder */}
            <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center shrink-0 border border-slate-200">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-6 h-6 text-slate-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">Ảnh đại diện cho CV</p>
                    <p className="text-xs text-slate-500">
                        {avatarUrl ? 'Ảnh này được dùng làm avatar khi tạo CV.' : 'Chưa có ảnh — tải lên để hiển thị avatar trong CV.'}
                    </p>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <Button variant="outline" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading}>
                    {avatarUploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                    {avatarUrl ? 'Đổi ảnh' : 'Tải ảnh'}
                </Button>
            </div>

            {isAdding && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                            <h4 className="text-lg font-bold text-gray-900">Thêm thẻ liên kết CV</h4>
                            <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">✕</button>
                        </div>
                        <div className="p-4 md:p-6 overflow-y-auto">
                            <form onSubmit={handleAddSubmit} className="space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Tên CV (Tùy chọn)</label>
                                        <Input name="title" value={formData.title} onChange={handleChange} placeholder="VD: Backend Developer CV" />
                                    </div>
                                    <div className={`border-2 border-dashed ${formErrors.file ? 'border-red-500' : 'border-gray-200'} rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative`}>
                                        <input 
                                            type="file" 
                                            accept=".pdf,.doc,.docx" 
                                            onChange={(e) => {
                                                setSelectedFile(e.target.files[0]);
                                                setFormErrors({});
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            required
                                        />
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                                            <Upload className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">
                                            {selectedFile ? selectedFile.name : "Kéo thả hoặc nhấp để chọn file"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Hỗ trợ PDF, DOC, DOCX (Tối đa 5MB)</p>
                                    </div>
                                    {formErrors.file && <span className="text-red-500 text-sm mt-1 block">* {formErrors.file}</span>}
                                </div>
                                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
                                    <Button type="button" variant="outline" onClick={() => setIsAdding(false)} disabled={isUploading}>Hủy</Button>
                                    <Button type="submit" variant="primary" disabled={isUploading || !selectedFile}>
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Đang tải lên...
                                            </>
                                        ) : "Bắt đầu tải lên"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {cvs.map((cv) => (
                    <div key={cv.id} className={`relative p-4 rounded-xl border-2 flex items-center gap-4 group transition-all ${cv.isDefault ? 'border-blue-200 bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${cv.isDefault ? 'bg-blue-600' : 'bg-gray-400'}`}>
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <a href={cv.fileUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-gray-800 hover:text-blue-600 hover:underline truncate">
                                    {cv.title}
                                </a>
                                {cv.isDefault && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-tighter">Mặc định</span>
                                )}
                                {cv.overallScore != null && (
                                    <Badge variant={getScoreVariant(cv.overallScore)}>
                                        {cv.overallScore}/100
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                {cv.cvStatus || 'UPLOADED'} • {cv.uploadedAt ? new Date(cv.uploadedAt).toLocaleDateString() : 'Vừa xong'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {!cv.isDefault && (
                                <button onClick={() => handleSetDefault(cv.id)} title="Đặt làm mặc định" className="p-2 text-gray-400 hover:text-amber-500 transition-colors">
                                    <Star className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => handleScore(cv.id)}
                                title="Chấm điểm CV"
                                disabled={scoringCvId === cv.id}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                            >
                                {scoringCvId === cv.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <BarChart3 className="w-4 h-4" />
                                )}
                            </button>
                            <button onClick={() => handleDelete(cv.id)} title="Xóa" className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {cvs.length === 0 && !isAdding && (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                            <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">Chưa có CV nào</p>
                        <p className="text-xs text-gray-500 mt-1">Bấm thêm để đường dẫn file CV của bạn</p>
                    </div>
                )}
            </div>

            <div className="mt-6 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                    Sử dụng CV mặc định giúp nhà tuyển dụng tìm thấy bạn nhanh hơn trong các bộ lọc tìm kiếm.
                </p>
            </div>

            {/* Score Result Modal */}
            {scoreModalCvId && scoreResult && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">
                                        {scoreLanguage === 'en' ? 'CV Scoring Result' : 'Kết quả chấm điểm CV'}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        {scoreLanguage === 'en' ? 'Overall score: ' : 'Điểm tổng: '}
                                        {scoreResult.overallScore}/100
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Language toggle */}
                                <div className="flex gap-1 bg-gray-100 rounded-full p-1">
                                    <button
                                        onClick={() => handleScore(scoreModalCvId, 'vi')}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${scoreLanguage === 'vi' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Tiếng Việt
                                    </button>
                                    <button
                                        onClick={() => handleScore(scoreModalCvId, 'en')}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${scoreLanguage === 'en' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        English
                                    </button>
                                </div>
                                <button onClick={closeScoreModal} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 md:p-6 space-y-6">
                            {/* Overall Score Banner */}
                            <div className={`rounded-xl p-4 text-center ${scoreResult.overallScore >= 80 ? 'bg-emerald-50 border border-emerald-200' : scoreResult.overallScore >= 60 ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
                                <div className="text-4xl font-black mb-1" style={{ color: scoreResult.overallScore >= 80 ? '#059669' : scoreResult.overallScore >= 60 ? '#d97706' : '#dc2626' }}>
                                    {scoreResult.overallScore}/100
                                </div>
                                <Badge variant={getScoreVariant(scoreResult.overallScore)}>
                                    {getScoreLabel(scoreResult.overallScore)}
                                </Badge>
                            </div>

                            {/* Dimension Breakdown */}
                            {scoreResult.scoreBreakdown && (
                                <div>
                                    <h5 className="text-sm font-semibold text-gray-800 mb-3">
                                        {scoreLanguage === 'en' ? 'Score Breakdown' : 'Điểm chi tiết theo tiêu chí'}
                                    </h5>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'formatAndReadability', labelVi: 'Format & Khả năng đọc', labelEn: 'Format & Readability' },
                                            { key: 'contentQuality', labelVi: 'Chất lượng nội dung', labelEn: 'Content Quality' },
                                            { key: 'skillAlignment', labelVi: 'Kỹ năng phù hợp', labelEn: 'Skill Alignment' },
                                            { key: 'experienceNarrative', labelVi: 'Kinh nghiệm & Tiến triển', labelEn: 'Experience Narrative' },
                                            { key: 'atsCompatibility', labelVi: 'Tương thích ATS', labelEn: 'ATS Compatibility' },
                                        ].map(({ key, labelVi, labelEn }) => {
                                            const dim = scoreResult.scoreBreakdown[key];
                                            if (!dim) return null;
                                            return (
                                                <div key={key} className="border border-gray-100 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {scoreLanguage === 'en' ? labelEn : labelVi}
                                                        </span>
                                                        <Badge variant={getScoreVariant(dim.score)}>{dim.score}/100</Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-500">{dim.feedback}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Strengths */}
                            {scoreResult.strengths?.length > 0 && (
                                <div>
                                    <h5 className="text-sm font-semibold text-emerald-700 mb-2">
                                        {scoreLanguage === 'en' ? 'Strengths' : 'Điểm mạnh'}
                                    </h5>
                                    <ul className="space-y-1">
                                        {scoreResult.strengths.map((s, i) => (
                                            <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                                <span className="text-emerald-500 mt-0.5">✓</span>{s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Improvement Areas */}
                            {scoreResult.improvementAreas?.length > 0 && (
                                <div>
                                    <h5 className="text-sm font-semibold text-amber-700 mb-2">
                                        {scoreLanguage === 'en' ? 'Areas for Improvement' : 'Cần cải thiện'}
                                    </h5>
                                    <ul className="space-y-1">
                                        {scoreResult.improvementAreas.map((s, i) => (
                                            <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                                <span className="text-amber-500 mt-0.5">→</span>{s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Critical Issues */}
                            {scoreResult.criticalIssues?.length > 0 && (
                                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                                    <h5 className="text-sm font-semibold text-red-700 mb-2">
                                        {scoreLanguage === 'en' ? 'Critical Issues' : 'Vấn đề nghiêm trọng'}
                                    </h5>
                                    <ul className="space-y-1">
                                        {scoreResult.criticalIssues.map((s, i) => (
                                            <li key={i} className="text-xs text-red-600 flex items-start gap-2">
                                                <span className="text-red-500 mt-0.5">⚠</span>{s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Recommendations */}
                            {scoreResult.recommendations?.length > 0 && (
                                <div>
                                    <h5 className="text-sm font-semibold text-blue-700 mb-2">
                                        {scoreLanguage === 'en' ? 'Recommendations' : 'Khuyến nghị'}
                                    </h5>
                                    <ul className="space-y-1">
                                        {scoreResult.recommendations.map((s, i) => (
                                            <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                                <span className="text-blue-500 mt-0.5">•</span>{s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Summary */}
                            {scoreResult.evaluationSummary && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <h5 className="text-xs font-semibold text-gray-600 mb-1">
                                        {scoreLanguage === 'en' ? 'Summary' : 'Tổng kết'}
                                    </h5>
                                    <p className="text-sm text-gray-700">{scoreResult.evaluationSummary}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 md:p-6 border-t border-gray-100 flex justify-end">
                            <Button variant="outline" onClick={closeScoreModal}>
                                {scoreLanguage === 'en' ? 'Close' : 'Đóng'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal isOpen={confirm.isOpen} onClose={resetConfirm} onConfirm={confirm.onConfirm} title={confirm.title} message={confirm.message} warning={confirm.warning} confirmText={confirm.confirmText} variant={confirm.variant} />
        </Card>
    );
};

export default CVSection;
