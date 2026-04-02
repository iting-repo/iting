import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { SiZoom, SiTinder, SiDribbble, SiAsana } from 'react-icons/si'; // Import logo các đối tác

const ContactPage = () => {
    return (
        <div className="bg-white min-h-screen font-sans text-gray-700">

            {/* ================= SECTION 1: INFO & FORM ================= */}
            <div className="container mx-auto px-4 max-w-7xl py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                    {/* --- LEFT COLUMN: TEXT & INFO --- */}
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
                            Bạn sẽ phát triển, bạn sẽ thành công. Chúng tôi cam kết điều đó.
                        </h1>
                        <p className="text-gray-500 mb-10 text-lg">
                            Chúng tôi luôn sẵn sàng đồng hành cùng bạn trên hành trình sự nghiệp. Hãy liên hệ với chúng tôi nếu bạn cần hỗ trợ, tư vấn hoặc hợp tác tuyển dụng.
                        </p>

                        {/* Contact Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Phone */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[#00B4D8]">
                                    <FaPhoneAlt />
                                    <h3 className="font-bold text-gray-900">Gọi để được tư vấn</h3>
                                </div>
                                <p className="text-gray-600 font-medium text-lg">+257 388-6895</p>
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[#00B4D8]">
                                    <FaEnvelope />
                                    <h3 className="font-bold text-gray-900">Gửi email cho chúng tôi</h3>
                                </div>
                                <p className="text-gray-600 font-medium text-lg">jobwork@global.net</p>
                            </div>

                            {/* Working Hours */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[#00B4D8]">
                                    <FaClock />
                                    <h3 className="font-bold text-gray-900">Giờ làm việc</h3>
                                </div>
                                <p className="text-gray-600">Thứ Hai – Thứ Sáu:</p>
                                <p className="text-gray-600 font-medium">10:00 – 22:00</p>
                            </div>

                            {/* Office */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[#00B4D8]">
                                    <FaMapMarkerAlt />
                                    <h3 className="font-bold text-gray-900">Văn phòng</h3>
                                </div>
                                <p className="text-gray-600 font-medium text-lg">KTX Khu B</p>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: CONTACT FORM --- */}
                    <div className="bg-[#E6F6FD] p-8 md:p-10 rounded-3xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Thông tin liên hệ</h2>
                            <p className="text-sm text-gray-500 mt-1">Thông tin chúng tôi có thể liên hệ</p>
                        </div>

                        <form className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 ml-1">Tên</label>
                                    <input
                                        type="text"
                                        placeholder="Nhập tên của bạn"
                                        className="w-full p-3.5 rounded-xl border-none focus:ring-2 focus:ring-[#00B4D8] outline-none text-sm placeholder-gray-400 shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 ml-1">Họ</label>
                                    <input
                                        type="text"
                                        placeholder="Nhập họ của bạn"
                                        className="w-full p-3.5 rounded-xl border-none focus:ring-2 focus:ring-[#00B4D8] outline-none text-sm placeholder-gray-400 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 ml-1">Địa chỉ email</label>
                                <input
                                    type="email"
                                    placeholder="Nhập Địa chỉ email"
                                    className="w-full p-3.5 rounded-xl border-none focus:ring-2 focus:ring-[#00B4D8] outline-none text-sm placeholder-gray-400 shadow-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 ml-1">Nội dung tin nhắn</label>
                                <textarea
                                    rows="4"
                                    placeholder="Nhập nội dung tin nhắn"
                                    className="w-full p-3.5 rounded-xl border-none focus:ring-2 focus:ring-[#00B4D8] outline-none text-sm placeholder-gray-400 shadow-sm resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="button"
                                className="w-full py-3.5 bg-[#4DB6E8] hover:bg-[#3da1d1] text-white font-bold rounded-xl transition-colors shadow-lg mt-4"
                            >
                                Gửi Tin Nhắn
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* ================= SECTION 2: MAP ================= */}
            {/* Sử dụng ảnh static map hoặc iframe google map */}
            <div className="container mx-auto px-4 max-w-7xl mb-16">
                <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-lg border border-gray-100 relative group">
                    {/* Giả lập Map bằng ảnh */}
                    <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                        alt="Office Map"
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    {/* Pin Location */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-12 h-12 bg-[#00B4D8] rounded-full flex items-center justify-center text-white text-2xl shadow-xl animate-bounce">
                            <FaMapMarkerAlt />
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= SECTION 3: PARTNERS ================= */}
            <div className="container mx-auto px-4 max-w-5xl py-12 border-t border-gray-100">
                <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2 text-3xl font-bold text-gray-400 hover:text-blue-500 cursor-pointer">
                        <SiZoom /> <span className="text-xl">zoom</span>
                    </div>
                    <div className="flex items-center gap-2 text-3xl font-bold text-gray-400 hover:text-pink-500 cursor-pointer">
                        <SiTinder /> <span className="text-xl">tinder</span>
                    </div>
                    <div className="flex items-center gap-2 text-3xl font-bold text-gray-400 hover:text-pink-600 cursor-pointer">
                        <SiDribbble /> <span className="text-xl">dribbble</span>
                    </div>
                    <div className="flex items-center gap-2 text-3xl font-bold text-gray-400 hover:text-red-500 cursor-pointer">
                        <SiAsana /> <span className="text-xl">asana</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ContactPage;