import React, { useState } from 'react';
import {
    FaMapMarkerAlt, FaDollarSign, FaClock, FaBriefcase, FaRegBookmark,
    FaExclamationTriangle, FaBell, FaLaptop, FaGift, FaUser,
    FaAward, FaGraduationCap, FaWallet, FaEnvelope, FaPhone, FaRegComment
} from 'react-icons/fa';
import JobCard from '../../components/JobCard'; // Import component JobCard cũ
import JobApplyModal from '../../components/JobApplyModal';

const JobDetailPage = () => {

    // --- MOCK DATA ---
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const jobDetail = {
        title: "Java BackEnd Developer",
        company: "Công ty cổ phần CROW GAMING",
        deadline: "30/11/2025",
        salary: "$40000-$42000",
        location: "Số 9 Nguyễn Hoàng - Mỹ Đình 2 - Nam Từ Liêm - Hà Nội",
        description: [
            "Tham gia phát triển và bảo trì hệ thống backend sử dụng Java, với các framework Spring Boot, Spring MVC.",
            "Phối hợp với team để xây dựng, tối ưu hiệu suất và đảm bảo tính ổn định của các API RESTful và SOAP.",
            "Thực hiện tích hợp hệ thống với các đối tác bên ngoài, bao gồm các nhà mạng viễn thông (Telco).",
            "Hỗ trợ triển khai và vận hành các giải pháp lưu trữ và xử lý dữ liệu như Redis, Kafka, MongoDB, và SQL Databases.",
            "Tham gia xử lý sự cố, fix bug, viết unit test để nâng cao chất lượng mã nguồn và đảm bảo sản phẩm ổn định.",
            "Làm việc theo mô hình Agile/Scrum, phối hợp chặt chẽ với các bộ phận BA, QA, và DevOps nhằm đảm bảo tiến độ và chất lượng dự án."
        ],
        requirements: [
            "Có ít nhất 2 năm kinh nghiệm phát triển ứng dụng backend với Java, ưu tiên sử dụng Spring Boot, Hibernate/JPA.",
            "Nắm vững kiến thức cơ bản về Lập trình hướng đối tượng (OOP), RESTful API, SQL/NoSQL databases."
        ],
        priority: [
            "Đã tham gia các dự án liên quan đến Telco (nhà mạng) hoặc Backend cho Game.",
            "Có kinh nghiệm làm việc với Redis, Kafka, MongoDB.",
            "Biết sử dụng các công cụ như SOAP UI, Docker, Git.",
            "Có tinh thần chủ động học hỏi, trách nhiệm cao, và khả năng làm việc tốt dưới áp lực deadline."
        ],
        benefits: [
            "Mức lương: 18-25 triệu VND gross/tháng + thưởng dự án (mức lương có thể thỏa thuận theo năng lực).",
            "Môi trường làm việc trẻ trung, năng động, khuyến khích học hỏi và phát triển cá nhân.",
            "Cơ hội tham gia các dự án lớn, áp dụng các công nghệ hiện đại hàng đầu.",
            "Chế độ nghỉ mát, khám sức khỏe định kỳ và đóng BHXH đầy đủ theo quy định của Luật Lao động."
        ]
    };

    const relatedJobs = [
        {
            id: 1,
            title: "Internal Creative Coordinator",
            company: "Green Group",
            logo: "https://logo.clearbit.com/spotify.com",
            category: "Commerce",
            type: "Full time",
            salary: "$44000-$46000",
            location: "New-York, USA",
            timePosted: "24 min ago"
        },
        {
            id: 2,
            title: "District Intranet Director",
            company: "VonRueden - Weber Co",
            logo: "https://logo.clearbit.com/slack.com",
            category: "Commerce",
            type: "Full time",
            salary: "$42000-$48000",
            location: "New-York, USA",
            timePosted: "24 min ago"
        },
        {
            id: 3,
            title: "Corporate Tactics Facilitator",
            company: "Cormier, Turner and Flatley Inc",
            logo: "https://logo.clearbit.com/google.com",
            category: "Commerce",
            type: "Full time",
            salary: "$38000-$40000",
            location: "New-York, USA",
            timePosted: "26 min ago"
        }
    ];

    return (
        <div className="bg-white min-h-screen py-10 font-sans">
            <JobApplyModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                jobTitle={jobDetail.title}
            />
            <div className="container mx-auto px-4 max-w-7xl">

                {/* LAYOUT GRID: Left (Main) - Right (Sidebar) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* ================= LEFT COLUMN (CONTENT) ================= */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* 1. JOB HEADER */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="bg-[#E6F6FD] text-[#00B4D8] text-xs font-bold px-3 py-1 rounded-full">
                                    10 phút trước
                                </span>
                                <span className="flex-1"></span>
                                <button className="flex items-center gap-2 text-[#00B4D8] text-sm font-bold border border-[#00B4D8] px-4 py-2 rounded-lg hover:bg-[#E6F6FD] transition-colors">
                                    <FaBell /> Gửi tôi việc làm tương tự
                                </button>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-20 h-20 rounded-xl border border-gray-100 p-2 flex items-center justify-center shadow-sm">
                                    <img src="https://logo.clearbit.com/java.com" alt="Company Logo" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{jobDetail.title}</h1>
                                    <p className="text-gray-500 font-medium">{jobDetail.company}</p>
                                </div>
                            </div>

                            {/* Meta Data Row */}
                            <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-gray-500 bg-[#F5F7FA] p-4 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#00B4D8]"><FaBriefcase /></span>
                                    Marketing/Quảng cáo
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#00B4D8]"><FaClock /></span>
                                    Toàn thời gian
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#00B4D8]"><FaDollarSign /></span>
                                    {jobDetail.salary}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#00B4D8]"><FaMapMarkerAlt /></span>
                                    Hà Nội
                                </div>
                                <div className="w-full pt-2 mt-2 border-t border-gray-200 text-gray-400 text-xs">
                                    <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded mr-2">Hạn nộp hồ sơ: {jobDetail.deadline}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsApplyModalOpen(true)}
                                    className="flex-1 py-3 bg-[#00B4D8] text-white font-bold rounded-lg hover:bg-[#0096B4] shadow-md transition-all transform hover:-translate-y-0.5">
                                    Ứng Tuyển Ngay
                                </button>
                                <button className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-red-500 transition-colors">
                                    <FaRegBookmark size={20} />
                                </button>
                            </div>
                        </div>

                        {/* 2. JOB DESCRIPTION & DETAILS */}
                        <div className="space-y-8 text-gray-700 leading-relaxed">

                            {/* Mô tả */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Mô tả công việc</h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {jobDetail.description.map((item, idx) => <li key={idx}>{item}</li>)}
                                </ul>
                            </section>

                            {/* Yêu cầu */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Yêu cầu ứng viên</h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {jobDetail.requirements.map((item, idx) => <li key={idx}>{item}</li>)}
                                </ul>
                            </section>

                            {/* Ưu tiên */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Ưu tiên ứng viên</h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {jobDetail.priority.map((item, idx) => <li key={idx}>{item}</li>)}
                                </ul>
                            </section>

                            {/* Quyền lợi */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Quyền lợi</h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {jobDetail.benefits.map((item, idx) => <li key={idx}>{item}</li>)}
                                </ul>
                            </section>

                            {/* Icons Section (Thiết bị & Quyền lợi thêm) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded bg-[#E6F6FD] text-[#00B4D8] flex items-center justify-center flex-shrink-0">
                                        <FaLaptop size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Thiết bị làm việc</h3>
                                        <p className="text-sm text-gray-500">Được cấp máy tính</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded bg-[#E6F6FD] text-[#00B4D8] flex items-center justify-center flex-shrink-0">
                                        <FaGift size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Quyền lợi</h3>
                                        <p className="text-sm text-gray-500">Bảo hiểm xã hội, Team building, Du lịch hàng năm, Thưởng tháng 13...</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Địa điểm & Thời gian */}
                            <section className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">Địa điểm làm việc</h3>
                                    <p className="text-sm text-gray-500">• {jobDetail.location}</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">Thời gian làm việc</h3>
                                    <p className="text-sm text-gray-500">• Thứ 2 - Thứ 6 (từ 08:15 đến 17:30)</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">Cách thức ứng tuyển</h3>
                                    <p className="text-sm text-gray-500">• Ứng viên nộp hồ sơ trực tuyến bằng cách bấm <strong>Ứng tuyển ngay</strong> dưới đây.</p>
                                    <p className="text-sm text-gray-400 mt-2">Hạn nộp hồ sơ: 30/11/2025</p>
                                </div>
                            </section>

                            {/* Bottom Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsApplyModalOpen(true)}
                                    className="px-6 py-2.5 bg-[#00B4D8] text-white font-bold rounded hover:bg-[#0096B4] transition-colors">
                                    Ứng Tuyển Ngay
                                </button>
                                <button className="px-6 py-2.5 border border-[#00B4D8] text-[#00B4D8] font-bold rounded hover:bg-[#E6F6FD] transition-colors">
                                    Lưu Tin
                                </button>
                            </div>

                            {/* Warning Banner */}
                            <div className="bg-gray-50 p-4 rounded-lg flex gap-3 border border-gray-100 items-start">
                                <FaExclamationTriangle className="text-yellow-500 mt-1 flex-shrink-0" />
                                <p className="text-xs text-gray-500">
                                    <strong>Báo cáo tin tuyển dụng:</strong> Nếu bạn thấy rằng tin tuyển dụng này không đúng hoặc có dấu hiệu lừa đảo, <a href="#" className="text-[#00B4D8] underline">hãy phản ánh với chúng tôi.</a>
                                </p>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <h3 className="font-bold text-gray-800">Tags:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Full time', 'Commerce', 'New - York', 'Corporate', 'Location'].map((tag, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-[#E6F6FD] text-[#00B4D8] text-xs font-medium rounded hover:bg-[#d0f0fd] cursor-pointer">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 3. RELATED JOBS */}
                        <div className="pt-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Việc làm liên quan</h2>
                            <div className="space-y-4">
                                {relatedJobs.map(job => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* 1. THÔNG TIN CHUNG CARD */}
                        <div className="bg-[#E6F6FD]/50 p-6 rounded-2xl">
                            <h3 className="font-bold text-gray-800 mb-6">Thông tin chung</h3>

                            <div className="space-y-5">
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaUser /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Cấp bậc</p>
                                        <p className="text-gray-500 text-sm">Nhân viên</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaClock /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Hình thức làm việc</p>
                                        <p className="text-gray-500 text-sm">Toàn thời gian</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaBriefcase /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Lĩnh vực</p>
                                        <p className="text-gray-500 text-sm">Tài chính</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaAward /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Kinh nghiệm</p>
                                        <p className="text-gray-500 text-sm">2 Năm</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaGraduationCap /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Học vấn</p>
                                        <p className="text-gray-500 text-sm">Cao đẳng trở lên</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaWallet /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Lương</p>
                                        <p className="text-gray-500 text-sm">Thỏa thuận</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaMapMarkerAlt /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Địa điểm</p>
                                        <p className="text-gray-500 text-sm">Nam Từ Liêm - Hà Nội</p>
                                    </div>
                                </div>
                            </div>

                            {/* MAP PLACEHOLDER */}
                            <div className="mt-6 rounded-xl overflow-hidden h-40 border border-gray-200">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.924048679543!2d105.77258331476346!3d21.035727985994535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454b991d80fd5%3A0x53cefc99d6b0bf86!2zUuG6oXAgQ2hp4bq_dSBQaGltIFF14buRYyBHaWE!5e0!3m2!1svi!2s!4v1642672322442!5m2!1svi!2s"
                                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                                    title="Job Location"
                                ></iframe>
                            </div>
                        </div>

                        {/* 2. CONTACT FORM */}
                        <div className="bg-[#E6F6FD]/30 p-6 rounded-2xl border border-[#E6F6FD]">
                            <h3 className="font-bold text-gray-800 mb-6">Gửi tin nhắn đến chúng tôi</h3>
                            <form className="space-y-4">
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-3.5 text-gray-400 text-xs" />
                                    <input type="text" placeholder="Tên đầy đủ" className="w-full pl-9 py-2.5 bg-white border border-transparent rounded-lg text-sm focus:ring-2 focus:ring-[#00B4D8] outline-none" />
                                </div>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-3.5 text-gray-400 text-xs" />
                                    <input type="email" placeholder="Địa chỉ email" className="w-full pl-9 py-2.5 bg-white border border-transparent rounded-lg text-sm focus:ring-2 focus:ring-[#00B4D8] outline-none" />
                                </div>
                                <div className="relative">
                                    <FaPhone className="absolute left-3 top-3.5 text-gray-400 text-xs" />
                                    <input type="tel" placeholder="Số điện thoại" className="w-full pl-9 py-2.5 bg-white border border-transparent rounded-lg text-sm focus:ring-2 focus:ring-[#00B4D8] outline-none" />
                                </div>
                                <div className="relative">
                                    <FaRegComment className="absolute left-3 top-3.5 text-gray-400 text-xs" />
                                    <textarea placeholder="Tin nhắn của bạn" rows="4" className="w-full pl-9 py-2.5 bg-white border border-transparent rounded-lg text-sm focus:ring-2 focus:ring-[#00B4D8] outline-none resize-none"></textarea>
                                </div>
                                <button type="button" className="w-full py-2.5 bg-[#00B4D8] text-white font-bold rounded-lg hover:bg-[#0096B4] transition-colors shadow-sm text-sm">
                                    Gửi Tin Nhắn
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetailPage;