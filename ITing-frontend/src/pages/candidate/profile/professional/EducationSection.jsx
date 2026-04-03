import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Calendar, MapPin, Trash2, BookOpen } from 'lucide-react';
import { Button, Card, Input, ConfirmDialog } from "../../../../components/common";
import axiosInstance from "../../../../utils/axiosInstance";
import { toast } from 'sonner';

const EducationSection = () => {
    const [educationList, setEducationList] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    
    const [formData, setFormData] = useState({
        schoolName: '',
        major: '',
        areaOfStudy: '',
        degree: '',
        startDate: '',
        endDate: '',
        description: ''
    });

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

    useEffect(() => {
        fetchEducationList();
    }, []);

    const fetchEducationList = async () => {
        try {
            const data = await axiosInstance.get('/user/professional-profile/education');
            setEducationList(data || []);
        } catch (error) {
            console.error("Failed to fetch education", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!formData.schoolName.trim() || !formData.major.trim() || !formData.startDate) return;
        
        try {
            const payload = { ...formData };
            if (!payload.endDate) payload.endDate = null;
            
            await axiosInstance.post('/user/professional-profile/education', payload);
            setFormData({
                schoolName: '',
                major: '',
                areaOfStudy: '',
                degree: '',
                startDate: '',
                endDate: '',
                description: ''
            });
            setIsAdding(false);
            fetchEducationList();
            toast.success("Thêm học vấn thành công!");
        } catch (error) {
            console.error("Failed to add education", error);
            toast.error("Có lỗi xảy ra khi thêm học vấn!");
        }
    };

    const handleDelete = (id) => {
        setConfirmModal({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        const id = confirmModal.id;
        try {
            await axiosInstance.delete(`/user/professional-profile/education/${id}`);
            fetchEducationList();
            toast.success("Xóa học vấn thành công!");
        } catch (error) {
            console.error("Failed to delete education", error);
            toast.error("Có lỗi xảy ra khi xóa học vấn!");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900">Học vấn</h3>
                    <p className="text-sm text-gray-600 mt-1">Lịch sử học tập và các bằng cấp của bạn</p>
                </div>
                {!isAdding && (
                    <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setIsAdding(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Thêm học vấn
                    </Button>
                )}
            </div>

            {isAdding && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                            <h4 className="text-lg font-bold text-gray-900">Thêm học vấn mới</h4>
                            <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">✕</button>
                        </div>
                        <div className="p-4 md:p-6 overflow-y-auto">
                            <form onSubmit={handleAddSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Trường/Cơ sở đào tạo *</label>
                                        <Input name="schoolName" value={formData.schoolName} onChange={handleChange} required placeholder="VD: Đại học Bách Khoa" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ngành học/Chuyên ngành *</label>
                                        <Input name="major" value={formData.major} onChange={handleChange} required placeholder="VD: Khoa học máy tính" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Bằng cấp</label>
                                        <Input name="degree" value={formData.degree} onChange={handleChange} placeholder="VD: Cử nhân, Kỹ sư..." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Lĩnh vực nghiên cứu</label>
                                        <Input name="areaOfStudy" value={formData.areaOfStudy} onChange={handleChange} placeholder="VD: Software Engineering" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                                        <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                                        <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả thêm</label>
                                    <textarea 
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-[#3AB4E6] transition-all"
                                        placeholder="Thành tích đạt được, câu lạc bộ, GPA..."
                                    />
                                </div>
                                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
                                    <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Hủy</Button>
                                    <Button type="submit" variant="primary">Lưu học vấn</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className={`space-y-8 relative ${educationList.length > 0 ? 'before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100' : ''}`}>
                {educationList.map((edu) => (
                    <div key={edu.id} className="relative pl-12 group">
                        <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-blue-600 z-10 shadow-sm">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                            <div className="flex-1 pr-6">
                                <h4 className="font-bold text-gray-900 text-lg">{edu.schoolName}</h4>
                                <p className="text-blue-600 font-medium">
                                    {edu.degree ? `${edu.degree} - ${edu.major}` : edu.major}
                                </p>
                                <div className="flex flex-wrap gap-4 mt-3">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Hiện tại'}</span>
                                    </div>
                                    {edu.areaOfStudy && (
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                            <BookOpen className="w-4 h-4" />
                                            <span>{edu.areaOfStudy}</span>
                                        </div>
                                    )}
                                </div>
                                {edu.description && (
                                    <p className="text-sm text-gray-600 mt-3 leading-relaxed bg-gray-50 p-3 rounded border border-gray-100 whitespace-pre-wrap">
                                        {edu.description}
                                    </p>
                                )}
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDelete(edu.id)} className="text-sm flex items-center gap-1 text-red-500 hover:text-red-700 font-medium">
                                    <Trash2 className="w-4 h-4" /> Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {educationList.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        Bạn chưa cập nhật thông tin học vấn
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title="Xóa học vấn"
                message="Bạn có chắc chắn muốn xóa học vấn này?"
                type="danger"
            />
        </Card>
    );
};

export default EducationSection;
