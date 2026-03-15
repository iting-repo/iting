import React from 'react';
import { Award, Plus, Trash2, Calendar } from 'lucide-react';
import { Button, Card } from "../../../../components/common";

const CertificateSection = () => {
    const certificates = [
        { id: 1, name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2023' },
        { id: 2, name: 'Professional Scrum Master I', issuer: 'Scrum.org', date: '2022' },
    ];

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900">Chứng chỉ</h3>
                    <p className="text-sm text-gray-600 mt-1">Chứng chỉ và bằng cấp chuyên môn</p>
                </div>
                <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    <Plus className="w-4 h-4 mr-2" /> Thêm mới
                </Button>
            </div>

            <div className="space-y-4">
                {certificates.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                        <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                            <Award className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 truncate">{cert.name}</h4>
                            <p className="text-sm text-gray-600">{cert.issuer}</p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                                <Calendar className="w-3 h-3" />
                                <span>Cấp năm {cert.date}</span>
                            </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 transition-all">
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
