import React, { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { SiZoom, SiTinder, SiDribbble, SiAsana } from 'react-icons/si'; // Import logo các đối tác
import { toast } from 'sonner';

const ContactPage = () => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', message: '' });
    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = {};
        if (!formData.firstName) errors.firstName = "Vui lòng nhập tên";
        if (!formData.lastName) errors.lastName = "Vui lòng nhập họ";
        if (!formData.email) errors.email = "Vui lòng nhập email";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Email không hợp lệ";
        if (!formData.message) errors.message = "Vui lòng nhập nội dung";

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});
        toast.success("Gửi tin nhắn thành công!");
        setFormData({ firstName: '', lastName: '', email: '', message: '' });
    };
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
                                <div className="flex items-center gap-2 text-[#3AB4E6]">
                                    <FaPhoneAlt />
                                    <h3 className="font-bold text-gray-900">Gọi để được tư vấn</h3>
                                </div>
                                <p className="text-gray-600 font-medium text-lg">+257 388-6895</p>
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[#3AB4E6]">
                                    <FaEnvelope />
                                    <h3 className="font-bold text-gray-900">Gửi email cho chúng tôi</h3>
                                </div>
                                <p className="text-gray-600 font-medium text-lg">jobwork@global.net</p>
                            </div>

                            {/* Working Hours */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[#3AB4E6]">
                                    <FaClock />
                                    <h3 className="font-bold text-gray-900">Giờ làm việc</h3>
                                </div>
                                <p className="text-gray-600">Thứ Hai – Thứ Sáu:</p>
                                <p className="text-gray-600 font-medium">10:00 – 22:00</p>
                            </div>

                            {/* Office */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[#3AB4E6]">
                                    <FaMapMarkerAlt />
                                    <h3 className="font-bold text-gray-900">Văn phòng</h3>
                                </div>
                                <p className="text-gray-600 font-medium text-lg">KTX Khu B</p>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: CONTACT FORM --- */}
                    <div className="bg-[#E6F6FD] p-6 sm:p-8 md:p-10 rounded-3xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Thông tin liên hệ</h2>
                            <p className="text-sm text-gray-500 mt-1">Thông tin chúng tôi có thể liên hệ</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 ml-1">Tên</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Nhập tên của bạn"
                                        className={`w-full p-3.5 rounded-xl border ${formErrors.firstName ? 'border-red-500' : 'border-none'} focus:ring-2 focus:ring-[#3AB4E6] outline-none text-sm placeholder-gray-400 shadow-sm`}
                                    />
                                    {formErrors.firstName && <span className="text-red-500 text-sm mt-1 block">* {formErrors.firstName}</span>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 ml-1">Họ</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Nhập họ của bạn"
                                        className={`w-full p-3.5 rounded-xl border ${formErrors.lastName ? 'border-red-500' : 'border-none'} focus:ring-2 focus:ring-[#3AB4E6] outline-none text-sm placeholder-gray-400 shadow-sm`}
                                    />
                                    {formErrors.lastName && <span className="text-red-500 text-sm mt-1 block">* {formErrors.lastName}</span>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 ml-1">Địa chỉ email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Nhập Địa chỉ email"
                                    className={`w-full p-3.5 rounded-xl border ${formErrors.email ? 'border-red-500' : 'border-none'} focus:ring-2 focus:ring-[#3AB4E6] outline-none text-sm placeholder-gray-400 shadow-sm`}
                                />
                                {formErrors.email && <span className="text-red-500 text-sm mt-1 block">* {formErrors.email}</span>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 ml-1">Nội dung tin nhắn</label>
                                <textarea
                                    rows="4"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Nhập nội dung tin nhắn"
                                    className={`w-full p-3.5 rounded-xl border ${formErrors.message ? 'border-red-500' : 'border-none'} focus:ring-2 focus:ring-[#3AB4E6] outline-none text-sm placeholder-gray-400 shadow-sm resize-none`}
                                ></textarea>
                                {formErrors.message && <span className="text-red-500 text-sm mt-1 block">* {formErrors.message}</span>}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-[#4DB6E8] hover:bg-[#3da1d1] text-white font-bold rounded-xl transition-colors shadow-lg mt-4"
                            >
                                Gửi Tin Nhắn
                            </button>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ContactPage;