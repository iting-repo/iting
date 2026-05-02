import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, MoreVertical, Trash2, Star, Plus, Loader2 } from 'lucide-react';
import { Button, Card, Input } from "../../../../components/common";
import axiosInstance from "../../../../utils/axiosInstance";
import cvService from "../../../../services/cvService";
import { toast } from "sonner";

const CVSection = () => {
    const [cvs, setCvs] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '',
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
        if (!selectedFile) {
            toast.error("Vui lòng chọn file CV!");
            return;
        }
        
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
                        <Upload className="w-4 h-4 mr-2" /> Tải lên CV (PDF)
                    </Button>
                )}
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
                                    
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                        <input 
                                            type="file" 
                                            accept=".pdf,.doc,.docx" 
                                            onChange={(e) => setSelectedFile(e.target.files[0])}
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
        </Card>
    );
};

export default CVSection;
