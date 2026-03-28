import React, { useState, useEffect } from 'react';
import { Award, Plus, Trash2, Calendar, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Button, Card, Input } from "../../../../components/common";
import axiosInstance from "../../../../utils/axiosInstance";

const CertificateSection = () => {
    const [certificates, setCertificates] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        issuingOrganization: '',
        issueDate: '',
        expirationDate: '',
        credentialId: '',
        credentialUrl: '',
        doesNotExpire: true
    });

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const data = await axiosInstance.get('/user/professional-profile/certificates');
            setCertificates(data || []);
        } catch (error) {
            console.error("Failed to fetch certificates", error);
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
        if (!formData.title.trim() || !formData.issuingOrganization.trim()) return;
        
        try {
            const payload = { ...formData };
            if (payload.doesNotExpire || !payload.expirationDate) {
                payload.expirationDate = null;
            }
            if (!payload.issueDate) {
                payload.issueDate = null; // API might require date format string like "2023-01-01" or null
            }
            
            await axiosInstance.post('/user/professional-profile/certificates', payload);
            setFormData({
                title: '',
                issuingOrganization: '',
                issueDate: '',
                expirationDate: '',
                credentialId: '',
                credentialUrl: '',
                doesNotExpire: true
            });
            setIsAdding(false);
            fetchCertificates();
        } catch (error) {
            console.error("Failed to add certificate", error);
            alert("Có lỗi xảy ra khi thêm chứng chỉ!");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa chứng chỉ này?")) return;
        try {
            await axiosInstance.delete(`/user/professional-profile/certificates/${id}`);
            fetchCertificates();
        } catch (error) {
            console.error("Failed to delete certificate", error);
            alert("Có lỗi xảy ra khi xóa chứng chỉ!");
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900">Chứng chỉ</h3>
                    <p className="text-sm text-gray-600 mt-1">Chứng chỉ và bằng cấp chuyên môn</p>
                </div>
                {!isAdding && (
                    <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setIsAdding(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Thêm mới
                    </Button>
                )}
            </div>

            {isAdding && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                            <h4 className="text-lg font-bold text-gray-900">Thêm chứng chỉ mới</h4>
                            <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">✕</button>
                        </div>
                        <div className="p-4 md:p-6 overflow-y-auto">
                            <form onSubmit={handleAddSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Tên chứng chỉ *</label>
                                        <Input name="title" value={formData.title} onChange={handleChange} required placeholder="VD: AWS Certified..." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Tổ chức cấp *</label>
                                        <Input name="issuingOrganization" value={formData.issuingOrganization} onChange={handleChange} required placeholder="VD: Amazon Web Services" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ngày cấp</label>
                                        <Input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ngày hết hạn</label>
                                        <Input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} disabled={formData.doesNotExpire} />
                                        <div className="mt-2 flex items-center">
                                            <input 
                                                type="checkbox" 
                                                id="doesNotExpire" 
                                                name="doesNotExpire" 
                                                checked={formData.doesNotExpire} 
                                                onChange={handleChange} 
                                                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                            />
                                            <label htmlFor="doesNotExpire" className="text-xs text-gray-600">Chứng chỉ này không có ngày hết hạn</label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Mã xác thực (Credential ID)</label>
                                        <Input name="credentialId" value={formData.credentialId} onChange={handleChange} placeholder="VD: 12345ABC" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">URL Chứng chỉ</label>
                                        <Input name="credentialUrl" value={formData.credentialUrl} onChange={handleChange} placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
                                    <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Hủy</Button>
                                    <Button type="submit" variant="primary">Lưu chứng chỉ</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {certificates.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                        <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                            <Award className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 truncate">{cert.title}</h4>
                            <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                            <div className="flex items-center gap-4 mt-2">
                                {cert.issueDate && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Cấp ngày: {cert.issueDate.split('T')[0]}</span>
                                    </div>
                                )}
                                {cert.credentialUrl && (
                                    <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                        <ExternalLink className="w-3.5 h-3.5" /> Xem chứng chỉ
                                    </a>
                                )}
                            </div>
                        </div>
                        <button onClick={() => handleDelete(cert.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 transition-all" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {certificates.length === 0 && (
                    <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                        Chưa có chứng chỉ nào được thêm
                    </div>
                )}
            </div>
        </Card>
    );
};

export default CertificateSection;
