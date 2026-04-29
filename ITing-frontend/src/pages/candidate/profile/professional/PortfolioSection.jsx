import React, { useState, useEffect } from 'react';
import { Layout, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { Button, Card, Input } from "../../../../components/common";
import axiosInstance from "../../../../utils/axiosInstance";

const PortfolioSection = () => {
    const [portfolios, setPortfolios] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        description: ''
    });

    useEffect(() => {
        fetchPortfolios();
    }, []);

    const fetchPortfolios = async () => {
        try {
            const data = await axiosInstance.get('user/professional-profile/portfolios');
            setPortfolios(data || []);
        } catch (error) {
            console.error("Failed to fetch portfolios", error);
            // It might be under /user/..., fallback if /api/ fails due to baseURL
            if (error.response && error.response.status === 404) {
               try {
                  const data2 = await axiosInstance.get('/user/professional-profile/portfolios');
                  setPortfolios(data2 || []);
               } catch (e2) {}
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;
        try {
            await axiosInstance.post('/user/professional-profile/portfolio', formData);
            setFormData({ title: '', url: '', description: '' });
            setIsAdding(false);
            fetchPortfolios();
        } catch (error) {
            console.error("Failed to add portfolio", error);
            alert("Có lỗi xảy ra khi thêm dự án!");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa dự án này?")) return;
        try {
            await axiosInstance.delete(`/user/professional-profile/portfolio/${id}`);
            fetchPortfolios();
        } catch (error) {
            console.error("Failed to delete portfolio", error);
            alert("Có lỗi xảy ra khi xóa dự án!");
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900">Dự án & Portfolio</h3>
                    <p className="text-sm text-gray-600 mt-1">Sản phẩm thực tế bạn đã tham gia thực hiện</p>
                </div>
                {!isAdding && (
                    <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setIsAdding(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Thêm dự án
                    </Button>
                )}
            </div>

            {isAdding && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                            <h4 className="text-lg font-bold text-gray-900">Thêm dự án mới</h4>
                            <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">✕</button>
                        </div>
                        <div className="p-4 md:p-6 overflow-y-auto">
                            <form onSubmit={handleAddSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tên dự án *</label>
                                    <Input name="title" value={formData.title} onChange={handleChange} required placeholder="VD: Ứng dụng quản lý nhân sự" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Đường dẫn (URL)</label>
                                    <Input name="url" value={formData.url} onChange={handleChange} placeholder="https://..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả dự án</label>
                                    <textarea 
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-[#9D5CE9] transition-all"
                                        placeholder="Mô tả ngắn gọn về dự án, vai trò của bạn..."
                                    />
                                </div>
                                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
                                    <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Hủy</Button>
                                    <Button type="submit" variant="primary">Lưu dự án</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolios.map((project) => (
                    <div key={project.id} className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors pr-6">{project.title}</h4>
                                <button onClick={() => handleDelete(project.id)} className="opacity-0 group-hover:opacity-100 absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-4 flex-1 whitespace-pre-wrap">
                                {project.description}
                            </p>

                            {project.url && (
                                <div className="pt-3 border-t border-gray-100 mt-auto">
                                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800">
                                        <ExternalLink className="w-4 h-4" /> Xem dự án
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {portfolios.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    Bạn chưa thêm dự án nào vào Portfolio
                </div>
            )}
        </Card>
    );
};

export default PortfolioSection;
