import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { resolveAssetUrl } from '../utils/assetUrl';

/**
 * Banner ngang theo vị trí (position) — dùng cho các slot quảng cáo trên trang public
 * (vd trang blog). Lấy banner đang bật của position, tự xoay vòng nếu có nhiều.
 * Không hiển thị gì nếu admin chưa cấu hình banner cho vị trí đó.
 *
 * @param {{ position: string, className?: string }} props
 */
const PageBanner = ({ position, className = '' }) => {
    const [ads, setAds] = useState([]);
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        if (!position) return;
        let cancelled = false;
        axiosInstance
            .get('/public/banners', { params: { position } })
            .then((res) => {
                const list = (Array.isArray(res) ? res : [])
                    .filter((b) => b.imageDesktop || b.imageMobile)
                    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
                if (!cancelled) setAds(list);
            })
            .catch(() => { /* không hiển thị */ });
        return () => { cancelled = true; };
    }, [position]);

    useEffect(() => {
        if (ads.length <= 1) return;
        const t = setInterval(() => setIdx((i) => (i + 1) % ads.length), 6000);
        return () => clearInterval(t);
    }, [ads.length]);

    if (ads.length === 0) return null;

    const cur = ads[idx % ads.length];
    const img = resolveAssetUrl(cur.imageDesktop || cur.imageMobile);
    const link = cur.link || '#';
    const isExternal = /^https?:\/\//i.test(link);

    return (
        <a
            href={link}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className={`block rounded-2xl overflow-hidden shadow-sm border border-gray-100 group relative ${className}`}
            title={cur.title}
        >
            <img
                src={img}
                alt={cur.title || 'Banner'}
                className="w-full h-auto max-h-[220px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            {ads.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {ads.map((_, i) => (
                        <span
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${i === idx % ads.length ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`}
                        />
                    ))}
                </div>
            )}
        </a>
    );
};

export default PageBanner;
