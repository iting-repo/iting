import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Calendar, MapPin, Building2, Trash2 } from 'lucide-react';
import { Button, Card, Input } from "../../../../components/common";
import axiosInstance from "../../../../utils/axiosInstance";

const ExperienceSection = () => {
    const [experiences, setExperiences] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    
    const [formData, setFormData] = useState({
        companyName: '',
        position: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: ''
    });

    useEffect(() => {
        fetchExperiences();
    }, []);

    const fetchExperiences = async () => {
        try {
            const data = await axiosInstance.get('/user/professional-profile/experience');
            setExperiences(data || []);
        } catch (error) {
            console.error("Failed to fetch experiences", error);
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
        if (!formData.companyName.trim() || !formData.position.trim() || !formData.startDate) return;
        
        try {
            const payload = { ...formData };
            if (payload.isCurrent || !payload.endDate) {
                payload.endDate = null;
            }
            
            await axiosInstance.post('/user/professional-profile/experience', payload);
            setFormData({
                companyName: '',
                position: '',
                startDate: '',
                endDate: '',
                isCurrent: false,
                description: ''
            });
            setIsAdding(false);
            fetchExperiences();
        } catch (error) {
            console.error("Failed to add experience", error);
            alert("Có lỗi xảy ra khi thêm kinh nghiệm!");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa kinh nghiệm này?")) return;
        try {
            await axiosInstance.delete(`/user/professional-profile/experience/${id}`);
            fetchExperiences();
        } catch (error) {
            console.error("Failed to delete experience", error);
            alert("Có lỗi xảy ra khi xóa kinh nghiệm!");
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
                    <h3 className="font-semibold text-lg text-gray-900">Kinh nghiệm làm việc</h3>
                    <p className="text-sm text-gray-600 mt-1">Chi tiết về các công việc bạn đã từng đảm nhận</p>
                </div>
                {!isAdding && (
                    <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setIsAdding(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Thêm kinh nghiệm
                    </Button>
                )}
            </div>

            {isAdding && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                            <h4 className="text-lg font-bold text-gray-900">Thêm kinh nghiệm mới</h4>
                            <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">✕</button>
                        </div>
                        <div className="p-4 md:p-6 overflow-y-auto">
                            <form onSubmit={handleAddSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Vị trí chức danh *</label>
                                        <Input name="position" value={formData.position} onChange={handleChange} required placeholder="VD: Senior Frontend Developer" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Tên công ty *</label>
                                        <Input name="companyName" value={formData.companyName} onChange={handleChange} required placeholder="VD: FPT Software" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                                        <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                                        <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} disabled={formData.isCurrent} />
                                        <div className="mt-2 flex items-center">
                                            <input 
                                                type="checkbox" 
                                                id="isCurrent" 
                                                name="isCurrent" 
                                                checked={formData.isCurrent} 
                                                onChange={handleChange} 
                                                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                            />
                                            <label htmlFor="isCurrent" className="text-xs text-gray-600">Tôi đang làm việc tại đây</label>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả công việc</label>
                                    <textarea 
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-[#9D5CE9] transition-all"
                                        placeholder="Mô tả công việc, nhiệm vụ chính và thành tích đạt được..."
                                    />
                                </div>
                                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
                                    <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Hủy</Button>
                                    <Button type="submit" variant="primary">Lưu kinh nghiệm</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className={`space-y-10 relative ${experiences.length > 0 ? 'before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100' : ''}`}>
                {experiences.map((exp) => (
                    <div key={exp.id} className="relative pl-12 flex flex-col md:flex-row gap-6 group">
                        {/* Dot/Icon */}
                        <div className="absolute left-0 top-0 w-10 h-10 rounded-xl bg-green-50 border-2 border-white flex items-center justify-center text-green-600 z-10 shadow-sm">
                            <Briefcase className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                <h4 className="font-bold text-gray-900 text-lg uppercase tracking-tight">{exp.position}</h4>
                                <span className="text-sm font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                                    {formatDate(exp.startDate)} - {exp.isCurrent ? 'Hiện tại' : formatDate(exp.endDate)}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-4 mb-4">
                                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    <span>{exp.companyName}</span>
                                </div>
                            </div>

                            {exp.description && (
                                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">
                                    {exp.description}
                                </p>
                            )}
                            
                            <div className="flex gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDelete(exp.id)} className="text-sm font-bold text-red-500 hover:underline flex items-center gap-1">
                                    <Trash2 className="w-3.5 h-3.5" /> Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {experiences.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        Bạn chưa cập nhật kinh nghiệm làm việc
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ExperienceSection;
