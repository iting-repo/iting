import React from 'react';
import { Layout, Plus, ExternalLink, Github } from 'lucide-react';
import { Button, Card } from "../../../../components/common";

const PortfolioSection = () => {
    const projects = [
        {
            id: 1,
            title: 'E-commerce Platform',
            description: 'Hệ thống bán hàng trực tuyến với tích hợp thanh toán VnPay.',
            tech: ['React', 'Node.js', 'MongoDB'],
            link: '#',
            image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=250&fit=crop'
        },
        {
            id: 2,
            title: 'AI Chat Application',
            description: 'Ứng dụng chat tích hợp OpenAI API cho doanh nghiệp.',
            tech: ['Next.js', 'Python', 'Redis'],
            link: '#',
            image: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=400&h=250&fit=crop'
        }
    ];

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900">Dự án & Portfolio</h3>
                    <p className="text-sm text-gray-600 mt-1">Sản phẩm thực tế bạn đã tham gia thực hiện</p>
                </div>
                <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    <Plus className="w-4 h-4 mr-2" /> Thêm dự án
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                    <div key={project.id} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white hover:shadow-xl transition-all duration-300">
                        {/* Project Image Placeholder */}
                        <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                            <img 
                                src={project.image} 
                                alt={project.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{project.title}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                {project.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                {project.tech.map(t => (
                                    <span key={t} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">
                                        {t}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
                                <a href={project.link} className="flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-blue-600">
                                    <ExternalLink className="w-4 h-4" /> Demo
                                </a>
                                <a href="#" className="flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-blue-600">
                                    <Github className="w-4 h-4" /> Source
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {projects.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    Bạn chưa thêm dự án nào vào Portfolio
                </div>
            )}
        </Card>
    );
};

export default PortfolioSection;
