import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, MoreVertical, Trash2, Star, Plus } from 'lucide-react';
import { Button, Card, Input } from "../../../../components/common";
import axiosInstance from "../../../../utils/axiosInstance";

const CVSection = () => {
    const [cvs, setCvs] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        file: null,
        isDefault: false
    });

    useEffect(() => {
        fetchCVs();
    }, []);

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
        if (!formData.file) return;

        if (formData.file.type !== 'application/pdf') {
            alert('Chỉ chấp nhận file PDF');
            return;
        }

        const maxSizeMb = 5;
        if (formData.file.size > maxSizeMb * 1024 * 1024) {
            alert('Kích thước CV tối đa là 5MB');
            return;
        }
        
        try {
            setIsUploading(true);
            const payload = new FormData();
            payload.append('file', formData.file);
            if (formData.title.trim()) {
                payload.append('title', formData.title.trim());
            }

            await axiosInstance.post('/candidates/cvs/upload', payload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setFormData({ title: '', file: null, isDefault: false });
            setIsAdding(false);
            fetchCVs();
        } catch (error) {
            console.error("Failed to add CV", error);
            const errorMessage =
                error?.message ||
                error?.error ||
                error?.details ||
                "Có lỗi xảy ra khi thêm CV!";
            alert(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa CV này?")) return;
        try {
            await axiosInstance.delete(`/user/professional-profile/cv/${id}`);
            fetchCVs();
        } catch (error) {
            console.error("Failed to delete CV", error);
            alert("Có lỗi xảy ra khi xóa CV!");
        }
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

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900">CV / Resume</h3>
                    <p className="text-sm text-gray-600 mt-1">Quản lý các bản CV của bạn</p>
                </div>
                {!isAdding && (
                    <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setIsAdding(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Tải CV PDF
                    </Button>
                )}
            </div>

            {isAdding && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                            <h4 className="text-lg font-bold text-gray-900">Tải CV lên hệ thống</h4>
                            <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">✕</button>
                        </div>
                        <div className="p-4 md:p-6 overflow-y-auto">
                            <form onSubmit={handleAddSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Tên CV *</label>
                                        <Input name="title" value={formData.title} onChange={handleChange} required placeholder="VD: Backend Developer CV" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">File CV (PDF) *</label>
                                        <input
                                            name="file"
                                            type="file"
                                            accept="application/pdf"
                                            required
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    file,
                                                    title: prev.title || file?.name?.replace(/\.pdf$/i, '') || '',
                                                }));
                                            }}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-[#3AB4E6] transition-all"
                                        />
                                        <p className="mt-1 text-[11px] text-gray-500">Chấp nhận PDF, tối đa 5MB.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
                                    <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Hủy</Button>
                                    <Button type="submit" variant="primary" disabled={isUploading}>{isUploading ? 'Đang tải...' : 'Lưu CV'}</Button>
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
                            <div className="flex items-center gap-2">
                                <a href={cv.fileUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-gray-800 hover:text-blue-600 hover:underline truncate">
                                    {cv.title}
                                </a>
                                {cv.isDefault && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-tighter">Mặc định</span>
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
                        <p className="text-xs text-gray-500 mt-1">Bấm thêm để tải file CV PDF lên S3</p>
                    </div>
                )}
            </div>

            <div className="mt-6 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                    Sử dụng CV mặc định giúp nhà tuyển dụng tìm thấy bạn nhanh hơn trong các bộ lọc tìm kiếm.
                </p>
            </div>
        </Card>
    );
};

export default CVSection;
