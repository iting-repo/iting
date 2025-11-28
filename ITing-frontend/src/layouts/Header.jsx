import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/auth/authSlice';
// Import Icons
import { BsBriefcaseFill, BsBell, BsEnvelope, BsPersonCircle } from 'react-icons/bs';
import { FaChevronDown, FaSignOutAlt, FaUserAlt, FaBuilding } from 'react-icons/fa';

// Giả lập action logout (Thay bằng action thật của bạn sau này)
// import { logout } from '../store/auth/authSlice';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // --------------------------------------------------------

  const { currentUser } = useSelector((state) => state.auth);
  const role = currentUser ? currentUser.role : 'guest';
  const user = currentUser ? currentUser : null;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  }

  // State cho Dropdown User
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // --- HÀM RENDER MENU GIỮA (NAVIGATION) ---
  const renderNavLinks = () => {
    // Class chung cho link
    const linkClass = "text-gray-300 hover:text-white font-medium transition-colors duration-200";
    const activeClass = "text-white font-bold"; // Style cho trang đang đứng

    // Helper check active
    const isActive = (path) => location.pathname === path ? activeClass : linkClass;

    switch (role) {
      case 'candidate':
        return (
          <>
            <Link to="/jobs" className={isActive('/jobs')}>Việc làm</Link>
            <Link to="/companies" className={isActive('/companies')}>Công ty</Link>
            <Link to="/blog" className={isActive('/blog')}>Cẩm nang IT</Link>
          </>
        );
      case 'employer':
        return (
          <>
            <Link to="/employer/dashboard" className={isActive('/employer/dashboard')}>Tổng quan</Link>
            <Link to="/employer/manage-jobs" className={isActive('/employer/manage-jobs')}>Tin đã đăng</Link>
            <Link to="/employer/find-cv" className={isActive('/employer/find-cv')}>Tìm hồ sơ</Link>
            {/* Nút Đăng tin nổi bật */}
            <Link to="/employer/post-job" className="text-[#3AB4E6] hover:text-blue-300 font-bold transition-colors">
              + Đăng tin mới
            </Link>
          </>
        );
      default: // Guest
        return (
          <>
            <Link to="/" className={isActive('/')}>Trang chủ</Link>
            <Link to="/jobs" className={isActive('/jobs')}>Công việc</Link>
            <Link to="/about" className={isActive('/about')}>Về chúng tôi</Link>
          </>
        );
    }
  };

  return (
    // Header Wrapper: Màu đen (bg-black), cố định top, z-index cao
    <header className="bg-black text-white h-20 sticky top-0 z-40 shadow-md">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">

        {/* ================= 1. LOGO (BÊN TRÁI) ================= */}
        <Link to="/" className="flex items-center gap-2 select-none group">
          <BsBriefcaseFill className="text-white text-2xl group-hover:text-blue-500 transition-colors" />
          <span className="text-2xl font-bold tracking-tight group-hover:text-blue-500 transition-colors">ITWork</span>
        </Link>


        {/* ================= 2. NAVIGATION (Ở GIỮA) ================= */}
        {/* Ẩn trên mobile (hidden), hiện trên Desktop (md:flex) */}
        <nav className="hidden md:flex items-center gap-8">
          {renderNavLinks()}
        </nav>


        {/* ================= 3. ACTIONS (BÊN PHẢI) ================= */}
        <div className="flex items-center gap-4">

          {/* TRƯỜNG HỢP: GUEST (CHƯA LOGIN) */}
          {role === 'guest' && (
            <>
              <Link
                to="/login"
                className="hidden md:block text-white font-medium hover:text-gray-300 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-[#3AB4E6] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                Đăng Ký
              </Link>
            </>
          )}

          {/* TRƯỜNG HỢP: ĐÃ LOGIN (CANDIDATE HOẶC EMPLOYER) */}
          {role !== 'guest' && (
            <>
              {/* Icon Message */}
              <button className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors relative">
                <BsEnvelope className="text-xl" />
                {/* Badge số lượng tin nhắn (demo) */}
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></span>
              </button>

              {/* Icon Notification */}
              <button className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors relative mr-2">
                <BsBell className="text-xl" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              </button>

              {/* Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:bg-gray-900 py-1 px-2 rounded-lg transition-colors border border-transparent focus:border-gray-700"
                >
                  {/* Nếu có ảnh thì hiện ảnh, ko thì hiện icon mặc định */}
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-gray-600" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  {/* Mũi tên nhỏ */}
                  <FaChevronDown className={`text-xs text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu Content */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white text-gray-800 rounded-xl shadow-2xl py-2 border border-gray-100 animate-fade-in-up origin-top-right">

                    {/* Header của dropdown */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-500 truncate">{role === 'candidate' ? 'Ứng viên' : 'Nhà tuyển dụng'}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm">
                        <FaUserAlt className="text-gray-400" /> Hồ sơ cá nhân
                      </Link>
                      {role === 'employer' && (
                        <Link to="/company-profile" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm">
                          <FaBuilding className="text-gray-400" /> Hồ sơ công ty
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium"
                      >
                        <FaSignOutAlt /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </header>
  );
};

export default Header;