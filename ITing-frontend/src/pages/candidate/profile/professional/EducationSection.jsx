import React from 'react';
import { GraduationCap, Plus, Calendar, MapPin } from 'lucide-react';
import { Button, Card } from "../../../../components/common";

const EducationSection = () => {
    const educationList = [
        {
            id: 1,
            school: 'Đại học Bách Khoa TP.HCM',
            degree: 'Kỹ sư Khoa học máy tính',
            duration: '2016 - 2020',
            location: 'TP. Hồ Chí Minh'
        }
    ];

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900">Học vấn</h3>
                    <p className="text-sm text-gray-600 mt-1">Lịch sử học tập và các bằng cấp của bạn</p>
                </div>
                <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    <Plus className="w-4 h-4 mr-2" /> Thêm học vấn
                </Button>
            </div>

            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {educationList.map((edu) => (
                    <div key={edu.id} className="relative pl-12">
                        <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-blue-600 z-10 shadow-sm">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">{edu.school}</h4>
                                <p className="text-blue-600 font-medium">{edu.degree}</p>
                                <div className="flex flex-wrap gap-4 mt-3">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        <span>{edu.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <MapPin className="w-4 h-4" />
                                        <span>{edu.location}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="text-sm text-gray-400 hover:text-blue-600 font-medium">Chỉnh sửa</button>
                                <span className="text-gray-200">|</span>
                                <button className="text-sm text-gray-400 hover:text-red-600 font-medium">Xóa</button>
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
        </Card>
    );
};

export default EducationSection;
