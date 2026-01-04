import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaArrowRight, FaCheck } from 'react-icons/fa';
import { BsBriefcaseFill, BsBuilding, BsFileText, BsGlobe, BsTelephone } from 'react-icons/bs';
import bgImage from '../../assets/bg_login.jpg'; // Dùng lại hình nền cũ

// 1. Component Logo Google chuẩn
const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

// 2. Component Logo Facebook chuẩn (Xanh dương)
const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
        <path fill="#1877F2" d="M24,4C12.954,4,4,12.954,4,24c0,9.961,7.266,18.232,16.712,19.724V29.771H15.68V24h5.032v-4.367c0-4.965,2.951-7.705,7.474-7.705c2.166,0,4.432,0.387,4.432,0.387v4.872h-2.497c-2.46,0-3.228,1.526-3.228,3.091V24h5.489l-0.877,5.771h-4.612v13.953C36.734,42.232,44,33.961,44,24C44,12.954,35.046,4,24,4z" />
        <path fill="#fff" d="M30.419,24L31.296,29.771H26.684V43.724C25.803,43.868,24.909,44,24,44c-0.909,0-1.803-0.132-2.684-0.276V29.771H15.68V24h5.636v-4.367c0-4.965,2.951-7.705,7.474-7.705c2.166,0,4.432,0.387,4.432,0.387v4.872h-2.497c-2.46,0-3.228,1.526-3.228,3.091V24H30.419z" />
    </svg>
);

const SuccessModal = ({ onClose }) => {
    const [startTimer, setStartTimer] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Kích hoạt hiệu ứng thanh đếm ngược chạy ngay khi popup hiện
        setTimeout(() => setStartTimer(true), 100);

        // 2. Hẹn giờ 5s để tự động đóng và chuyển trang
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        onClose(); // Reset state ở trang cha
        navigate('/'); // Chuyển về trang chủ
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            {/* Box nội dung */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-up">

                {/* Nội dung chính */}
                <div className="p-8 flex flex-col items-center text-center">

                    {/* Animated Checkmark */}
                    {/* Hand-drawn animated checkmark SVG */}
                    <div className="mb-6 text-[#3AB4E6]">
                        <svg
                            className="w-24 h-24" // Kích thước SVG
                            viewBox="0 0 52 52"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                className="animate-draw-stroke" // Áp dụng class animation vừa tạo
                                d="M14.1 27.2l7.1 7.2 16.7-16.8" // Đường dẫn tạo hình dấu check
                                stroke="currentColor" // Lấy màu từ text-green-500 của thẻ cha
                                strokeWidth="4" // Độ dày nét vẽ
                                strokeLinecap="round" // Bo tròn đầu nét vẽ cho mềm mại
                                strokeLinejoin="round" // Bo tròn góc nhọn
                            />
                        </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Đăng ký thành công!</h3>
                    <p className="text-gray-500 mb-8">
                        Tài khoản của bạn đã được ghi nhận và đang chờ
                        <span className="font-bold text-gray-700"> Admin xét duyệt</span>.
                        Vui lòng đợi kết quả qua email.
                    </p>

                    <button
                        onClick={handleClose}
                        className="w-full bg-[#3AB4E6] hover:bg-[#28aee2] text-white font-semibold py-3 rounded-lg transition-all"
                    >
                        Đồng ý
                    </button>
                </div>

                {/* Thanh đếm ngược (Countdown Bar) */}
                <div className="absolute bottom-0 left-0 h-1.5 bg-gray-100 w-full">
                    <div
                        className={`h-full bg-[#3AB4E6] transition-all ease-linear duration-[5000ms] ${startTimer ? 'w-0' : 'w-full'}`}
                    ></div>
                </div>

            </div>
        </div>
    );
};

const RegisterPage = () => {
    const [role, setRole] = useState('candidate'); // 'candidate' | 'company'
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const handleRegister = (e) => {
        e.preventDefault();
        // Xử lý đăng ký ở đây (gửi API, validate, v.v.)
        if (role === 'company') {
            setShowSuccessModal(true); // Hiện Popup nếu là Company
        } else {
            // Logic cho candidate (ví dụ chuyển trang luôn hoặc hiện thông báo khác)
            alert("Đăng ký ứng viên thành công!");
        }
    }

    return (
        <div className="h-screen flex bg-white font-sans">

            {showSuccessModal && <SuccessModal onClose={() => setShowSuccessModal(false)} />}

            {/* ================= LEFT COLUMN: FORM ================= */}
            <div className="w-full lg:w-[50%] flex flex-col px-8 md:px-20 xl:px-32 relative z-10 h-full overflow-y-auto no-scrollbar py-12">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-8">
                    <BsBriefcaseFill className="text-[#3AB4E6] text-2xl" />
                    <span className="text-2xl font-semibold text-gray-800 tracking-tight">ITWork</span>
                </div>

                <div>
                    <h1 className="text-[32px] font-semibold text-[#1F2937] mb-2 leading-tight">
                        Tạo tài khoản mới
                    </h1>
                    <p className="text-[#6B7280] text-sm mb-6">
                        Cùng tìm công việc IT chất lượng.<br />
                        Bạn đã có tài khoản? <Link to="/login" className="text-[#3AB4E6] font-medium hover:underline">Đăng nhập ngay</Link>
                    </p>

                    {/* --- ROLE SWITCHER --- */}
                    <div className="bg-[#F3F4F6] p-1.5 rounded-lg flex mb-6 shadow-inner">
                        <button
                            type="button"
                            onClick={() => setRole('candidate')}
                            // Đã xóa 'ring-1 ring-black/5' ở dòng dưới
                            className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${role === 'candidate'
                                ? 'bg-[#3AB4E6] text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-600'
                                }`}
                        >
                            Ứng viên
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('company')}
                            // Đã xóa 'ring-1 ring-black/5' ở dòng dưới
                            className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${role === 'company'
                                ? 'bg-[#3AB4E6] text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-600'
                                }`}
                        >
                            Nhà tuyển dụng
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-4">

                        {/* --- PHẦN RIÊNG CHO NHÀ TUYỂN DỤNG --- */}


                        {/* --- HÀNG 1: TÊN + USERNAME --- */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder={role === 'company' ? "Tên công ty/doanh nghiệp" : "Họ và tên"}
                                    className="w-full px-5 py-3.5 bg-[#F0F5FA] border border-transparent rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>

                        </div>

                        {/* --- EMAIL --- */}
                        <div>
                            <input
                                type="email"
                                placeholder={role === 'company' ? "Email công ty" : "Nhập email"}
                                className="w-full px-5 py-3.5 bg-[#F0F5FA] border border-transparent rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        {/* --- PASSWORD --- */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu"
                                className="w-full px-5 py-3.5 bg-[#F0F5FA] border border-transparent rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>

                        {/* --- CONFIRM PASSWORD --- */}
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Nhập lại mật khẩu"
                                className="w-full px-5 py-3.5 bg-[#F0F5FA] border border-transparent rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                            >
                                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>

                        {role === 'company' && (
                            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4 animate-fade-in-down">
                                <p className="text-xs text-[#3AB4E6] font-semibold uppercase tracking-wide">Chúng tôi sẽ dùng thông tin này để xác thực công ty</p>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Địa chỉ công ty/doanh nghiệp"
                                        className="w-full px-5 py-3.5 bg-white border border-blue-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <BsGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Website (nếu có)"
                                            className="w-full pl-10 pr-5 py-3.5 bg-white border border-blue-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="flex-1 relative">
                                        <BsTelephone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Số điện thoại"
                                            className="w-full pl-10 pr-5 py-3.5 bg-white border border-blue-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TERMS CHECKBOX --- */}
                        <div className="flex items-start text-sm mt-2">
                            <div className="flex items-center h-5">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            </div>
                            <label className="ml-2 text-gray-500">
                                Bạn đã đọc và đồng ý với <a href="#" className="text-[#3AB4E6] hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-[#3AB4E6] hover:underline">Chính sách bảo mật</a> của ITWork.
                            </label>
                        </div>

                        {/* --- BUTTON SUBMIT --- */}
                        <button
                            type="submit"
                            className="w-full bg-[#3AB4E6] hover:bg-[#19A4DD] text-white font-bold py-3.5 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                        >
                            Đăng Ký {role === 'company' ? '(Chờ duyệt)' : ''} <FaArrowRight size={14} />
                        </button>
                    </form>

                    <div className="relative my-6 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <span className="relative bg-white px-4 text-xs text-gray-400 uppercase tracking-wide">
                            Hoặc đăng nhập bằng
                        </span>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Nút Facebook */}
                        <button type="button" className="flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700">
                            <FacebookIcon /> {/* Dùng Component vừa tạo */}
                            <span className="text-sm">Facebook</span>
                        </button>

                        {/* Nút Google */}
                        <button type="button" className="flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700">
                            <GoogleIcon /> {/* Dùng Component vừa tạo */}
                            <span className="text-sm">Google</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= RIGHT COLUMN: BACKGROUND & STATS ================= */}
            {/* Sử dụng clip-path để tạo đường vát chéo đặc trưng */}
            <div
                className="hidden lg:block w-[50%] relative bg-cover bg-center"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    // Đây là kỹ thuật tạo đường chéo: Top thụt vào 80px, Bottom giữ nguyên
                    clipPath: 'polygon(80px 0, 100% 0, 100% 100%, 0 100%)',
                    marginLeft: '-1px' // Fix đường viền trắng nhỏ nếu có
                }}
            >
                {/* Overlay gradient tối màu để làm nổi text */}
                <div className="absolute inset-0 bg-[#1e293b]/85 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-90"></div>

                {/* Content bên phải */}
                <div className="absolute bottom-0 left-0 right-0 p-12 pl-24 text-white">
                    <h2 className="text-4xl font-bold leading-tight mb-8 drop-shadow-lg">
                        Hơn <span className="text-blue-400">1,75,324</span> ứng viên đang tham gia để có công việc chất lượng.
                    </h2>

                    {/* Stats Cards - Glassmorphism */}
                    <div className="flex gap-4">
                        {/* Card 1 */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex-1 min-w-[140px]">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-blue-300">
                                <BsBriefcaseFill size={20} />
                            </div>
                            <div className="text-xl font-bold">1,75,324</div>
                            <div className="text-[11px] text-gray-300 uppercase tracking-wide mt-1">Việc làm đang tuyển</div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex-1 min-w-[140px]">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-purple-300">
                                <BsBuilding size={20} />
                            </div>
                            <div className="text-xl font-bold">97,354</div>
                            <div className="text-[11px] text-gray-300 uppercase tracking-wide mt-1">Công ty</div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex-1 min-w-[140px]">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-green-300">
                                <BsFileText size={20} />
                            </div>
                            <div className="text-xl font-bold">7,532</div>
                            <div className="text-[11px] text-gray-300 uppercase tracking-wide mt-1">Công việc Mới</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default RegisterPage;