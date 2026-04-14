import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  FaHome,
  FaBuilding,
  FaPlusCircle,
  FaList,
  FaSignOutAlt,
  FaSearch,
  FaCheckCircle,
  FaFileContract,
  FaShieldAlt,
  FaAngleDoubleRight,
  FaQuestionCircle,
  FaUserCircle,
  FaArrowUp,
  FaChevronRight,
  FaRegCircle,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/auth/authSlice";
import ScrollToTop from "../common/ScrollToTop";
import companyService from "../../services/companyService";

const EmployerSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const [showVerificationPopover, setShowVerificationPopover] = useState(false);
  const [company, setCompany] = useState(null);
  const popoverRef = useRef(null);

  const user = currentUser || { name: "Nghia Vo", role: "EMPLOYER" };

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const res = await companyService.getMyCompany();
        setCompany(res);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };
    fetchCompanyData();
  }, []);

  const getVerificationLevel = () => {
    if (!company) return "Cấp 1/3";
    const level = company.verificationLevel || company.verificationStatus;
    if (level === "VERIFIED" || level === "ADVANCED") return "Cấp 3/3";
    if (company.taxCode && company.representativeName) return "Cấp 2/3";
    return "Cấp 1/3";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowVerificationPopover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    navigate("/");
    setTimeout(() => {
      dispatch(logout());
    }, 100);
  };

  const menuItems = [
    { path: "/employer/dashboard", name: "Tổng quan", icon: <FaHome /> },
    {
      path: "/employer/company-profile",
      name: "Hồ sơ công ty",
      icon: <FaBuilding />,
    },
    // { path: '/employer/post-job', name: 'Đăng tuyển dụng', icon: <FaPlusCircle /> },
    {
      path: "/employer/manage-jobs",
      name: "Quản lý tin đăng",
      icon: <FaList />,
    },
    {
      path: "/employer/verification",
      name: "Xác thực tài khoản",
      icon: <FaCheckCircle />,
    },
    {
      path: "/employer/data-processing",
      name: "Thỏa thuận dữ liệu",
      icon: <FaFileContract />,
    },
    {
      path: "/employer/find-cv",
      name: "Tìm kiếm ứng viên",
      icon: <FaSearch />,
    },
  ];

  return (
    <div className="w-64 bg-white min-h-screen border-r border-gray-100 hidden lg:block sticky top-20 h-[calc(100vh-80px)]">
      <ScrollToTop />
      <div className="p-6">
        {/* User Profile Summary */}
        <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              {company?.logoUrl || company?.logo_url ? (
                <img src={company.logoUrl || company.logo_url} alt="Logo" className="h-full w-full object-cover" />
              ) : user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <FaUserCircle className="h-full w-full text-gray-300" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 leading-tight truncate max-w-[140px]">
                {company?.name || user.name || user.fullName || "Loading..."}
              </h4>
              <p className="text-xs font-medium text-gray-500">Employer</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-gray-600">
                  Tài khoản xác thực: <span className="text-[#3AB4E6] font-bold">{getVerificationLevel()}</span>
                </span>
                <div className="relative">
                  <FaQuestionCircle
                    className="text-[10px] text-[#3AB4E6] cursor-pointer hover:text-[#2A94C6] transition-colors"
                    onClick={() => setShowVerificationPopover(!showVerificationPopover)}
                  />

                  {showVerificationPopover && (
                    <div
                      ref={popoverRef}
                      className="absolute left-0 top-6 z-[70] w-80 rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 border border-slate-100"
                    >
                      <h5 className="text-base font-bold text-gray-900 mb-4">
                        Tài khoản xác thực: <span className="text-[#3AB4E6]">{getVerificationLevel()}</span>
                      </h5>

                      <div className="flex items-start gap-3 bg-blue-50/50 p-3 rounded-xl mb-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#3AB4E6] border-2 border-white shadow-sm">
                          <FaArrowUp className="text-sm" />
                        </div>
                        {getVerificationLevel() !== "Cấp 3/3" ? (
                          <p className="text-xs leading-relaxed text-gray-700">
                            Nâng cấp tài khoản lên <span className="text-[#3AB4E6] font-bold">cấp cao hơn</span> để nhận thêm nhiều quyền lợi từ công cụ tìm kiếm CV.
                          </p>
                        ) : (
                          <p className="text-xs leading-relaxed text-gray-700">
                            Chúc mừng! Tài khoản của bạn đã đạt <span className="text-[#3AB4E6] font-bold">cấp độ xác thực cao nhất</span>.
                          </p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <p className="text-[11px] text-gray-400 font-medium">Trạng thái xác thực hiện tại:</p>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-800">Xác thực thông tin</span>
                            <span className="text-xs font-bold text-[#3AB4E6]">
                              {getVerificationLevel() === "Cấp 3/3" ? "100%" : getVerificationLevel() === "Cấp 2/3" ? "66%" : "33%"}
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-[#3AB4E6] transition-all duration-500" style={{ width: getVerificationLevel() === "Cấp 3/3" ? "100%" : getVerificationLevel() === "Cấp 2/3" ? "66%" : "33%" }} />
                          </div>
                        </div>

                        <div className="space-y-1 pt-2">
                          <Link
                            to="/employer/company-profile"
                            onClick={() => setShowVerificationPopover(false)}
                            className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              {company?.phone || company?.representativePhone ? (
                                <FaCheckCircle className="text-[#3AB4E6] text-lg" />
                              ) : (
                                <FaRegCircle className="text-gray-300 text-lg" />
                              )}
                              <span className={`text-xs font-medium ${company?.phone || company?.representativePhone ? 'text-gray-400 line-through decoration-blue-100' : 'text-gray-600'}`}>
                                Xác thực số điện thoại
                              </span>
                            </div>
                            <FaChevronRight className="text-[10px] text-gray-300 group-hover:text-[#3AB4E6] group-hover:translate-x-1 transition-all" />
                          </Link>

                          <Link
                            to="/employer/company-profile"
                            onClick={() => setShowVerificationPopover(false)}
                            className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              {(company?.name && company?.taxCode) ? (
                                <FaCheckCircle className="text-[#3AB4E6] text-lg" />
                              ) : (
                                <FaRegCircle className="text-gray-300 text-lg" />
                              )}
                              <span className={`text-xs font-medium ${(company?.name && company?.taxCode) ? 'text-gray-400 line-through decoration-blue-100' : 'text-gray-600'}`}>
                                Cập nhật thông tin công ty
                              </span>
                            </div>
                            <FaChevronRight className="text-[10px] text-gray-300 group-hover:text-[#3AB4E6] group-hover:translate-x-1 transition-all" />
                          </Link>

                          <Link
                            to="/employer/verification"
                            onClick={() => setShowVerificationPopover(false)}
                            className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              {company?.businessLicenseFileUrl ? (
                                <FaCheckCircle className="text-[#3AB4E6] text-lg" />
                              ) : (
                                <FaRegCircle className="text-gray-300 text-lg" />
                              )}
                              <span className={`text-xs font-medium ${company?.businessLicenseFileUrl ? 'text-gray-400 line-through decoration-blue-100' : 'text-gray-600'}`}>
                                Xác thực Giấy đăng ký doanh nghiệp
                              </span>
                            </div>
                            <FaChevronRight className="text-[10px] text-gray-300 group-hover:text-[#3AB4E6] group-hover:translate-x-1 transition-all" />
                          </Link>
                        </div>
                      </div>

                      <button className="mt-6 w-full rounded-xl border border-[#3AB4E6] py-2.5 text-xs font-bold text-[#3AB4E6] hover:bg-blue-50 transition-colors">
                        Tìm hiểu thêm
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <NavLink
            to="/employer/verification"
            className="flex items-center justify-between w-full bg-[#D13B35] hover:bg-[#B1312C] text-white px-3 py-2.5 rounded-full transition-all group overflow-hidden shadow-lg shadow-red-100"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                <FaShieldAlt className="text-[10px]" />
              </div>
              <span className="text-xs font-bold leading-none tracking-tight">Tài khoản chưa đủ an toàn</span>
            </div>
            <FaAngleDoubleRight className="text-xs opacity-80 group-hover:translate-x-1 transition-transform" />
          </NavLink>
        </div>

        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">
          Employers
        </h3>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                    ? "bg-blue-50 text-[#3AB4E6] border-l-4 border-[#3AB4E6]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}

          <li className="mt-8 pt-8 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
            >
              <FaSignOutAlt className="text-lg" />
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EmployerSidebar;
