import React from 'react';

const JobPromo = () => {
    return (
        <div className="mt-6 rounded-xl overflow-hidden relative h-[400px] group shadow-lg">
            {/* Background Image (Giả lập ảnh mờ) */}
            <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="We are hiring"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Dark Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

            {/* Content */}
            <div className="absolute top-8 left-6 right-6">
                <h3 className="text-white text-3xl font-bold leading-tight mb-2 uppercase">
                    Chúng tôi <br /> đang tuyển
                </h3>
                <p className="text-white/80 text-sm font-medium">Ứng tuyển ngay!</p>
            </div>

            <div className="absolute bottom-8 left-6 right-6">
                <p className="text-white/90 text-sm mb-4 line-clamp-3">
                    Tìm kiếm cơ hội nghề nghiệp tốt nhất tại các công ty hàng đầu. Đừng bỏ lỡ!
                </p>
                <button className="w-full py-3 bg-white text-[#00B4D8] font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg">
                    Tham gia ngay
                </button>
            </div>
        </div>
    );
};

export default JobPromo;