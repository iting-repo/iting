import React, { useState, useEffect } from 'react';
import { Cpu, Plus, X, Save, ChevronDown } from 'lucide-react';
import { Button, Card, Input, ConfirmDialog } from "../../../../components/common";
import axiosInstance from "../../../../utils/axiosInstance";
import { toast } from 'sonner';

const SkillsSection = () => {
    const [skills, setSkills] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newSkillName, setNewSkillName] = useState('');
    const [availableSkills, setAvailableSkills] = useState([]);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
    const [formErrors, setFormErrors] = useState({});

    const fetchSkills = async () => {
        try {
            const data = await axiosInstance.get('/user/professional-profile/skills');
            setSkills(data || []);
        } catch (error) {
            console.error("Failed to fetch skills", error);
        }
    };

    const fetchAvailableSkills = async () => {
        try {
            const data = await axiosInstance.get('/public/categories/skills');
            setAvailableSkills(data || []);
        } catch (error) {
            console.error("Failed to fetch available skills", error);
        }
    };

    useEffect(() => {
        fetchSkills();
        fetchAvailableSkills();
    }, []);

    const handleAddSkill = async (e) => {
        e.preventDefault();
        if (!newSkillName.trim()) {
            setFormErrors({ name: "Vui lòng nhập tên kỹ năng" });
            return;
        }
        setFormErrors({});
        try {
            await axiosInstance.post('/user/professional-profile/skills', {
                name: newSkillName.trim()
            });
            setNewSkillName('');
            setIsAdding(false);
            fetchSkills();
            toast.success("Thêm kỹ năng thành công!");
        } catch (error) {
            console.error("Failed to add skill", error);
            toast.error("Có lỗi xảy ra khi thêm kỹ năng!");
        }
    };

    const handleDeleteSkill = async (id) => {
        setConfirmModal({ isOpen: true, id });
    };

    const confirmDeleteSkill = async () => {
        const id = confirmModal.id;
        try {
            await axiosInstance.delete(`/user/professional-profile/skills/${id}`);
            fetchSkills();
            toast.success("Xóa kỹ năng thành công!");
        } catch (error) {
            console.error("Failed to delete skill", error);
            toast.error("Có lỗi xảy ra khi xóa kỹ năng!");
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900">Kỹ năng</h3>
                    <p className="text-sm text-gray-600 mt-1">Các công nghệ và công cụ bạn thông thạo</p>
                </div>
                {!isAdding && (
                    <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setIsAdding(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Thêm kỹ năng
                    </Button>
                )}
            </div>

            {isAdding && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                            <h4 className="text-lg font-bold text-gray-900">Thêm kỹ năng mới</h4>
                            <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">✕</button>
                        </div>
                        <div className="p-4 md:p-6 overflow-y-auto">
                            <form onSubmit={handleAddSkill} className="space-y-4 flex flex-col">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs text-gray-500 mb-1">Tên kỹ năng <span className="text-red-500">*</span></label>
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                                        <div className="relative">
                                            <select
                                                className="w-full h-10 px-3 py-2 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-blue-500 text-gray-600 text-sm"
                                                value=""
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        setNewSkillName(e.target.value);
                                                    }
                                                }}
                                            >
                                                <option value="">Chọn từ danh sách</option>
                                                {availableSkills
                                                    .filter(s => !skills.some(existing => existing.name === s.name))
                                                    .map((skill, index) => (
                                                    <option key={`available-skill-${index}`} value={skill.name}>
                                                        {skill.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Input 
                                                placeholder="VD: ReactJS, Java..." 
                                                value={newSkillName}
                                                onChange={(e) => setNewSkillName(e.target.value)}
                                                className={`w-full md:w-64 ${formErrors.name ? 'border-red-500' : ''}`}
                                            />
                                            {formErrors.name && <span className="text-red-500 text-xs">* {formErrors.name}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
                                    <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Hủy</Button>
                                    <Button type="submit" variant="primary">Lưu</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                        <div key={skill.id} className="group flex items-center gap-2 px-4 py-2 bg-blue-50/50 border border-blue-100/50 rounded-xl hover:border-blue-300 hover:bg-white transition-all">
                            <span className="text-sm font-semibold text-blue-700">{skill.name}</span>
                            <button 
                                onClick={() => handleDeleteSkill(skill.id)}
                                className="opacity-0 group-hover:opacity-100 text-blue-300 hover:text-red-500 transition-all ml-2"
                                title="Xóa"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {skills.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        Bạn chưa cập nhật kỹ năng
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null })}
                onConfirm={confirmDeleteSkill}
                title="Xóa kỹ năng"
                message="Bạn có chắc chắn muốn xóa kỹ năng này?"
                type="danger"
            />
        </Card>
    );
};

export default SkillsSection;
