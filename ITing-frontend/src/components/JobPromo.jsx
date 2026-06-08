import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

// Banner mặc định khi admin chưa cấu hình banner Quảng cáo nào.
const FALLBACK = {
    title: 'Chúng tôi đang tuyển',
    imageDesktop: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    link: '/jobs',
    description: 'Tìm kiếm cơ hội nghề nghiệp tốt nhất tại các công ty hàng đầu. Đừng bỏ lỡ!',
};

/**
 * Ô quảng cáo ở sidebar trang việc làm — hiển thị banner loại QUẢNG CÁO (ADVERTISEMENT)
 * do admin cấu hình ở trang Quản lý Banner. Tự xoay vòng nếu có nhiều banner.
 */
const JobPromo = () => {
    const [ads, setAds] = useState([]);
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        let cancelled = false;
        axiosInstance
            .get('/public/banners', { params: { position: 'jobs_list' } })
            .then((res) => {
                const list = (Array.isArray(res) ? res : [])
                    .filter((b) => b.imageDesktop || b.imageMobile)
                    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
                if (!cancelled) setAds(list);
            })
            .catch(() => { /* dùng fallback */ });
        return () => { cancelled = true; };
    }, []);

    // Xoay vòng mỗi 6s nếu có nhiều hơn 1 banner.
    useEffect(() => {
        if (ads.length <= 1) return;
        const t = setInterval(() => setIdx((i) => (i + 1) % ads.length), 6000);
        return () => clearInterval(t);
    }, [ads.length]);

    const current = ads.length > 0 ? ads[idx % ads.length] : FALLBACK;
    const img = current.imageDesktop || current.imageMobile || FALLBACK.imageDesktop;
    const link = current.link || '/jobs';
    const isExternal = /^https?:\/\//i.test(link);

    return (
        <a
            href={link}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="mt-6 block rounded-xl overflow-hidden relative h-[400px] group shadow-lg"
        >
            <img
                src={img}
                alt={current.title || 'Quảng cáo'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

            <div className="absolute top-8 left-6 right-6">
                <h3 className="text-white text-3xl font-bold leading-tight mb-2 uppercase line-clamp-3">
                    {current.title || FALLBACK.title}
                </h3>
                <p className="text-white/80 text-sm font-medium">Ứng tuyển ngay!</p>
            </div>

            <div className="absolute bottom-8 left-6 right-6">
                {current.description && (
                    <p className="text-white/90 text-sm mb-4 line-clamp-3">{current.description}</p>
                )}
                <span className="block w-full text-center py-3 bg-white text-[#3AB4E6] font-bold rounded-lg group-hover:bg-gray-100 transition-colors shadow-lg">
                    Tham gia ngay
                </span>
            </div>

            {/* Chấm chỉ báo nếu có nhiều banner */}
            {ads.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {ads.map((_, i) => (
                        <span
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${i === idx % ads.length ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                        />
                    ))}
                </div>
            )}
        </a>
    );
};

export default JobPromo;
