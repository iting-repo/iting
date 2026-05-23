import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import publicService from '../../services/publicService';
import { GlobalLoading } from '../../components/common';
import { FaArrowLeft, FaCalendarAlt, FaTag, FaEye } from 'react-icons/fa';

const BlogDetailPage = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogDetail = async () => {
            try {
                setLoading(true);
                const response = await publicService.getBlogBySlug(slug);
                const data = response.data || response;
                setBlog(data);
                // View is already incremented by backend on GET /{slug}
            } catch (err) {
                console.error("Lỗi khi tải chi tiết blog:", err);
                setError("Không tìm thấy bài viết hoặc bài viết đã bị ẩn.");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchBlogDetail();
        }
    }, [slug]);

    if (loading) {
        return <GlobalLoading message="Đang tải bài viết..." />;
    }

    if (error || !blog) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || "Không tìm thấy bài viết"}</h2>
                <Link to="/blogs" className="text-[#3AB4E6] hover:underline flex items-center justify-center gap-2">
                    <FaArrowLeft /> Quay lại trang blog
                </Link>
            </div>
        );
    }

    const formattedDate = new Date(blog.createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back button */}
                <Link to="/blogs" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#3AB4E6] mb-6 transition-colors">
                    <FaArrowLeft /> Quay lại trang blog
                </Link>

                {/* Article Card */}
                <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Thumbnail */}
                    {blog.thumbnailUrl && (
                        <div className="w-full h-[250px] md:h-[400px] overflow-hidden">
                            <img 
                                src={blog.thumbnailUrl} 
                                alt={blog.title} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-8 md:p-12">
                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                            <span className="flex items-center gap-1 bg-blue-50 text-[#3AB4E6] px-3 py-1 rounded-full font-medium">
                                <FaTag size={12} /> {blog.category || 'Tin tức'}
                            </span>
                            <span className="flex items-center gap-1">
                                <FaCalendarAlt size={12} /> {formattedDate}
                            </span>
                            <span className="flex items-center gap-1">
                                <FaEye size={12} /> {(blog.viewCount || 0).toLocaleString()} lượt xem
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 leading-tight">
                            {blog.title}
                        </h1>

                        {/* Summary if exists */}
                        {blog.summary && (
                            <div className="text-lg text-gray-600 mb-8 font-medium italic border-l-4 border-[#3AB4E6] pl-4">
                                {blog.summary}
                            </div>
                        )}

                        {/* Content */}
                        <div 
                            className="prose prose-lg max-w-none prose-blue"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BlogDetailPage;
