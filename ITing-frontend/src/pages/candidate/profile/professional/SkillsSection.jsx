import React from 'react';
import { Cpu, Plus, X } from 'lucide-react';
import { Button, Card } from "../../../../components/common";

const SkillsSection = () => {
    const skillCategories = [
        {
            title: 'Kỹ năng chuyên môn',
            skills: ['ReactJS', 'JavaScript', 'NodeJS', 'TypeScript', 'Tailwind CSS']
        },
        {
            title: 'Công cụ & Quy trình',
            skills: ['Git', 'Docker', 'Agile/Scrum', 'CI/CD']
        }
    ];

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900">Kỹ năng</h3>
                    <p className="text-sm text-gray-600 mt-1">Các công nghệ và công cụ bạn thông thạo</p>
                </div>
                <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    <Plus className="w-4 h-4 mr-2" /> Thêm kỹ năng
                </Button>
            </div>

            <div className="space-y-8">
                {skillCategories.map((category) => (
                    <div key={category.title}>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <Cpu className="w-3.5 h-3.5" />
                             {category.title}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {category.skills.map((skill) => (
                                <div key={skill} className="group flex items-center gap-2 px-4 py-2 bg-blue-50/50 border border-blue-100/50 rounded-xl hover:border-blue-300 hover:bg-white transition-all">
                                    <span className="text-sm font-semibold text-blue-700">{skill}</span>
                                    <button className="opacity-0 group-hover:opacity-100 text-blue-300 hover:text-red-500 transition-all">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {skillCategories.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        Bạn chưa cập nhật kỹ năng
                    </div>
                )}
            </div>
        </Card>
    );
};

export default SkillsSection;
