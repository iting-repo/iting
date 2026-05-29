import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaRegUser, FaFileAlt, FaSearch, FaCheckCircle,
    FaPlay, FaChevronDown, FaChevronUp, FaArrowRight,
    FaMedal, FaUserTie, FaBuilding, FaTools
} from 'react-icons/fa';
import publicContentService from '../../services/publicContentService';

// Fallback khi API lỗi / chưa có FAQ nào published — giữ trải nghiệm
// không vỡ. Admin có thể tạo FAQ qua /admin/faq để override list này.
const FALLBACK_FAQS = [
    { title: "Tôi có thể tải lên CV không?", content: "Có, bạn có thể tải CV của mình trực tiếp lên hệ thống để nhà tuyển dụng dễ dàng xem và liên hệ." },
    { title: "Quy trình tuyển dụng mất bao lâu?", content: "Thời gian tuyển dụng phụ thuộc vào từng công ty và vị trí cụ thể. Thông thường quy trình kéo dài từ 1-3 tuần." },
    { title: "Quy trình tuyển chọn ứng viên bao gồm những bước nào?", content: "Thường bao gồm: Sàng lọc hồ sơ → Phỏng vấn sơ bộ → Phỏng vấn chuyên môn → Deal lương → Onboarding." },
    { title: "Nền tảng có tuyển dụng cho sinh viên mới ra trường hoặc thực tập sinh?", content: "Có, ITing có rất nhiều vị trí Internship và Fresher dành cho các bạn sinh viên mới ra trường." },
    { title: "Tôi có thể nhận thông báo khi có công việc mới phù hợp không?", content: "Có, bạn hãy bật tính năng 'Nhận thông báo việc làm' trong phần cài đặt tài khoản." },
];

const AboutPage = () => {
    const [openFaqIndex, setOpenFaqIndex] = useState(0);
    const [faqs, setFaqs] = useState(FALLBACK_FAQS);

    useEffect(() => {
        let alive = true;
        publicContentService
            .getFaqs()
            .then((data) => {
                if (!alive) return;
                const list = Array.isArray(data) ? data : [];
                if (list.length > 0) setFaqs(list);
            })
            .catch(() => {
                // giữ FALLBACK_FAQS
            });
        return () => { alive = false; };
    }, []);

    return (
        <div className="bg-white min-h-screen font-sans text-gray-700">

            {/* ================= SECTION 1: INTRO & HERO ================= */}
            <div className="container mx-auto px-4 max-w-7xl py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            Về ITing – Nơi kết nối nhân tài công nghệ với doanh nghiệp hàng đầu
                        </h1>
                    </div>
                    <div className="text-sm lg:text-base text-gray-500 space-y-4">
                        <p>
                            ITing là nền tảng tuyển dụng chuyên biệt cho lĩnh vực Công nghệ Thông tin, giúp ứng viên dễ dàng tìm thấy công việc phù hợp với kỹ năng và mục tiêu nghề nghiệp.
                        </p>
                        <p>
                            Với mạng lưới hàng trăm doanh nghiệp công nghệ uy tín và hệ thống lọc việc thông minh, chúng tôi mang đến trải nghiệm tìm việc nhanh chóng, minh bạch và hiệu quả.
                        </p>
                        <p>
                            Sứ mệnh của chúng tôi là kết nối nhân tài công nghệ với cơ hội xứng đáng – để mỗi developer, tester, designer hay PM đều tìm được nơi họ thuộc về.
                        </p>
                    </div>
                </div>

                {/* Hero Image (Ảnh mờ trong design -> Thay bằng ảnh Unsplash) */}
                <div className="rounded-3xl overflow-hidden h-[250px] md:h-[400px] lg:h-[500px] shadow-lg">
                    <img
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                        alt="ITing Team"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* ================= SECTION 2: HOW IT WORKS ================= */}
            <div className="container mx-auto px-4 max-w-7xl py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Cách ITing hoạt động</h2>
                    <p className="text-gray-500">Chỉ với vài bước đơn giản, bạn có thể bắt đầu hành trình nghề nghiệp trong lĩnh vực công nghệ.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Step 1 */}
                    <div className="p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow text-center group">
                        <div className="w-14 h-14 mx-auto bg-blue-50 text-[#3AB4E6] rounded-full flex items-center justify-center text-2xl mb-6 group-hover:bg-[#3AB4E6] group-hover:text-white transition-colors">
                            <FaRegUser />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-2">Tạo tài khoản</h3>
                        <p className="text-sm text-gray-500">Đăng ký miễn phí và hoàn thiện hồ sơ nghề nghiệp của bạn.</p>
                    </div>

                    {/* Step 2 */}
                    <div className="p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow text-center group">
                        <div className="w-14 h-14 mx-auto bg-blue-50 text-[#3AB4E6] rounded-full flex items-center justify-center text-2xl mb-6 group-hover:bg-[#3AB4E6] group-hover:text-white transition-colors">
                            <FaFileAlt />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-2">Tải lên CV</h3>
                        <p className="text-sm text-gray-500">Giới thiệu kỹ năng và kinh nghiệm để nhà tuyển dụng dễ dàng tìm thấy.</p>
                    </div>

                    {/* Step 3 */}
                    <div className="p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow text-center group">
                        <div className="w-14 h-14 mx-auto bg-blue-50 text-[#3AB4E6] rounded-full flex items-center justify-center text-2xl mb-6 group-hover:bg-[#3AB4E6] group-hover:text-white transition-colors">
                            <FaSearch />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-2">Tìm việc phù hợp</h3>
                        <p className="text-sm text-gray-500">Khám phá hàng trăm cơ hội việc làm IT được gợi ý theo năng lực.</p>
                    </div>

                    {/* Step 4 */}
                    <div className="p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow text-center group">
                        <div className="w-14 h-14 mx-auto bg-blue-50 text-[#3AB4E6] rounded-full flex items-center justify-center text-2xl mb-6 group-hover:bg-[#3AB4E6] group-hover:text-white transition-colors">
                            <FaCheckCircle />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-2">Ứng tuyển ngay</h3>
                        <p className="text-sm text-gray-500">Gửi hồ sơ trực tiếp và theo dõi trạng thái ứng tuyển dễ dàng.</p>
                    </div>
                </div>
            </div>

            {/* ================= SECTION 3: VIDEO BANNER ================= */}
            <div className="relative h-[500px] w-full bg-gray-900 flex items-center justify-center">
                {/* Background Image Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                        alt="Video Banner"
                        className="w-full h-full object-cover opacity-40"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center px-4">
                    {/* Section heading — bỏ play button vì video chưa có; thay bằng icon decorative non-interactive. */}
                    <div aria-hidden="true" className="w-20 h-20 bg-[#3AB4E6] rounded-full flex items-center justify-center text-white text-3xl mb-8 mx-auto shadow-[0_0_30px_rgba(58,180,230,0.6)]">
                        <FaPlay className="pl-1" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white max-w-3xl mx-auto leading-tight mb-12">
                        Cuộc sống tốt đẹp bắt đầu từ một công ty tốt
                    </h2>

                    {/* Bottom Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto border-t border-white/20 pt-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-[#3AB4E6] text-white w-6 h-6 rounded flex items-center justify-center font-bold text-sm">1</span>
                                <h4 className="text-white font-bold">Cơ hội nghề nghiệp đa dạng</h4>
                            </div>
                            <Link to="/jobs" className="text-[#3AB4E6] text-xs hover:underline">Khám phá việc làm →</Link>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-[#3AB4E6] text-white w-6 h-6 rounded flex items-center justify-center font-bold text-sm">2</span>
                                <h4 className="text-white font-bold">Kết nối với nhà tuyển dụng uy tín</h4>
                            </div>
                            <Link to="/companies" className="text-[#3AB4E6] text-xs hover:underline">Xem doanh nghiệp →</Link>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-[#3AB4E6] text-white w-6 h-6 rounded flex items-center justify-center font-bold text-sm">3</span>
                                <h4 className="text-white font-bold">Phát triển sự nghiệp lâu dài</h4>
                            </div>
                            <Link to="/blogs" className="text-[#3AB4E6] text-xs hover:underline">Đọc cẩm nang →</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= SECTION 4: FAQ ================= */}
            <div className="container mx-auto px-4 max-w-4xl py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Câu hỏi thường gặp</h2>
                    <p className="text-gray-500">Giúp bạn hiểu rõ hơn cách ITing hoạt động.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((item, index) => {
                        const key = item.id ?? index;
                        const num = String(index + 1).padStart(2, '0');
                        const isOpen = openFaqIndex === index;
                        return (
                            <div key={key} className="rounded-xl overflow-hidden transition-all duration-300">
                                <button
                                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                                    className={`w-full flex items-center justify-between p-6 text-left transition-colors ${isOpen ? 'bg-[#89CFF0]/20' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    <span className={`font-bold text-lg ${isOpen ? 'text-gray-900' : 'text-gray-600'}`}>
                                        <span className="mr-4 text-[#3AB4E6] opacity-50">{num}</span>
                                        {item.title}
                                    </span>
                                    {isOpen
                                        ? <FaChevronUp className="text-[#3AB4E6]" />
                                        : <FaChevronDown className="text-gray-400" />}
                                </button>

                                {isOpen && (
                                    <div
                                        className="bg-[#89CFF0]/20 px-6 pb-6 pl-14 text-gray-600 text-sm leading-relaxed faq-content"
                                        // content do admin nhập qua ReactQuill → HTML.
                                        // ReactQuill sanitize trước khi lưu, BE chỉ proxy.
                                        dangerouslySetInnerHTML={{ __html: item.content || '' }}
                                    />
                                )}
                                <div className="h-[1px] bg-gray-100 w-full"></div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ================= SECTION 5: WHY CHOOSE US / GALLERY ================= */}
            <div className="container mx-auto px-4 max-w-7xl py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Gallery (Masonry style mockup) */}
                    <div className="grid grid-cols-2 gap-4 h-[300px] md:h-[400px] lg:h-[500px]">
                        <div className="h-full rounded-2xl overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Office 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="grid grid-rows-2 gap-4 h-full">
                            <div className="rounded-2xl overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Office 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="rounded-2xl overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Office 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Chúng tôi chỉ hợp tác với những người giỏi nhất
                        </h2>
                        <p className="text-gray-500 mb-8">
                            Chúng tôi kết nối với các công ty công nghệ hàng đầu và những nhân tài xuất sắc nhất để mang đến cơ hội việc làm chất lượng và phù hợp nhất cho bạn.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 sm:gap-y-8 gap-x-4">
                            <div className="flex gap-4">
                                <div className="text-[#3AB4E6] text-2xl mt-1"><FaMedal /></div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Công việc chất lượng</h4>
                                    <p className="text-xs text-gray-500 mt-1">Được kiểm duyệt kỹ càng.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-[#3AB4E6] text-2xl mt-1"><FaTools /></div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Công cụ tạo CV</h4>
                                    <p className="text-xs text-gray-500 mt-1">Chuyên nghiệp & Hiện đại.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-[#3AB4E6] text-2xl mt-1"><FaBuilding /></div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Công ty hàng đầu</h4>
                                    <p className="text-xs text-gray-500 mt-1">Đối tác uy tín toàn cầu.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-[#3AB4E6] text-2xl mt-1"><FaUserTie /></div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Nhân tài hàng đầu</h4>
                                    <p className="text-xs text-gray-500 mt-1">Kết nối chuyên gia giỏi.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= SECTION 6: NEWS & BLOG ================= */}
            <div className="container mx-auto px-4 max-w-7xl py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Tin tức và Bài viết</h2>
                    <p className="text-gray-500">Cập nhật xu hướng tuyển dụng, kỹ năng nghề nghiệp và chia sẻ từ các chuyên gia.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Card 1 — demo cards, link tới blog list (chưa có blog detail tương ứng) */}
                    <Link to="/blogs" className="group cursor-pointer block">
                        <div className="rounded-2xl overflow-hidden h-[300px] mb-4 relative">
                            <span className="absolute top-4 left-4 bg-[#3AB4E6] text-white text-xs font-bold px-3 py-1 rounded-full z-10">News</span>
                            <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Blog 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="pr-4">
                            <p className="text-xs text-gray-400 mb-2">30 Tháng 3, 2024</p>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#3AB4E6] transition-colors">
                                Khơi Dậy Tinh Thần Làm Việc: Chiến Lược Nâng Cao Sự Gắn Kết Của Nhân Viên Năm 2024
                            </h3>
                            <span className="text-[#3AB4E6] text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                                Đọc thêm <FaArrowRight size={12} />
                            </span>
                        </div>
                    </Link>

                    {/* Card 2 */}
                    <Link to="/blogs" className="group cursor-pointer block">
                        <div className="rounded-2xl overflow-hidden h-[300px] mb-4 relative">
                            <span className="absolute top-4 left-4 bg-[#3AB4E6] text-white text-xs font-bold px-3 py-1 rounded-full z-10">Blog</span>
                            <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Blog 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="pr-4">
                            <p className="text-xs text-gray-400 mb-2">30 Tháng 3, 2024</p>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#3AB4E6] transition-colors">
                                Cách Tránh 6 Lỗi Phổ Biến Nhất Khi Phỏng Vấn Xin Việc
                            </h3>
                            <span className="text-[#3AB4E6] text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                                Đọc thêm <FaArrowRight size={12} />
                            </span>
                        </div>
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default AboutPage;