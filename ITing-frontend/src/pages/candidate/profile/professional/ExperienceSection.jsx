import React from 'react';
import { Briefcase, Plus, Calendar, MapPin, Building2 } from 'lucide-react';
import { Button, Card } from "../../../../components/common";

const ExperienceSection = () => {
    const experiences = [
        {
            id: 1,
            company: 'FPT Software',
            role: 'Senior Frontend Developer',
            duration: '06/2021 - Hiện tại',
            location: 'TP. Hồ Chí Minh',
            description: 'Phát triển các hệ thống quản trị nội bộ sử dụng ReactJS và NextJS. Tối ưu hóa hiệu năng ứng dụng tăng 30% speed score.'
        },
        {
            id: 2,
            company: 'VNG Corporation',
            role: 'Fullstack Developer',
            duration: '01/2019 - 05/2021',
            location: 'TP. Hồ Chí Minh',
            description: 'Tham gia xây dựng các tính năng mới cho ZaloPay. Làm việc với Microservices architecture.'
        }
    ];

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900">Kinh nghiệm làm việc</h3>
                    <p className="text-sm text-gray-600 mt-1">Chi tiết về các công việc bạn đã từng đảm nhận</p>
                </div>
                <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    <Plus className="w-4 h-4 mr-2" /> Thêm kinh nghiệm
                </Button>
            </div>

            <div className="space-y-10 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {experiences.map((exp) => (
                    <div key={exp.id} className="relative pl-12 flex flex-col md:flex-row gap-6">
                        {/* Dot/Icon */}
                        <div className="absolute left-0 top-0 w-10 h-10 rounded-xl bg-green-50 border-2 border-white flex items-center justify-center text-green-600 z-10 shadow-sm">
                            <Briefcase className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                <h4 className="font-bold text-gray-900 text-lg uppercase tracking-tight">{exp.role}</h4>
                                <span className="text-sm font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">{exp.duration}</span>
                            </div>

                            <div className="flex flex-wrap gap-4 mb-4">
                                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    <span>{exp.company}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span>{exp.location}</span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {exp.description}
                            </p>
                            
                            <div className="flex gap-4 mt-4">
                                <button className="text-sm font-bold text-blue-600 hover:underline">Chỉnh sửa</button>
                                <button className="text-sm font-bold text-red-500 hover:underline">Xóa</button>
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
