import React from 'react';
import { FileText, Upload, CheckCircle, MoreVertical } from 'lucide-react';
import { Button, Card } from "../../../../components/common";

const CVSection = () => {
    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900">CV / Resume</h3>
                    <p className="text-sm text-gray-600 mt-1">Tải lên bản CV mới nhất của bạn</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Active CV */}
                <div className="relative p-4 rounded-xl border-2 border-blue-200 bg-blue-50/50 flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-800 truncate">Nguyen_Van_A_CV.pdf</h4>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-tighter">Mặc định</span>
                        </div>
                        <p className="text-xs text-gray-500">Đã tải lên ngày 12/03/2024 • 1.2 MB</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <button className="p-2 text-gray-400 hover:text-gray-600">
                             <MoreVertical className="w-4 h-4" />
                         </button>
                    </div>
                </div>

                {/* Upload Zone */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-gray-50 transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Tải lên CV mới</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Tối đa 5MB)</p>
                </div>
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
