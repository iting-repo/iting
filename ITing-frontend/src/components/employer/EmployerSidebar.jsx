import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBuilding,
  FaPlusCircle,
  FaList,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { logout } from "../../store/auth/authSlice";

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
      path: "/employer/find-cv",
      name: "Tìm kiếm ứng viên",
      icon: <FaSearch />,
    },
  ];

  return (
    <div className="w-64 bg-white min-h-screen border-r border-gray-100 hidden lg:block sticky top-20 h-[calc(100vh-80px)]">
      <ScrollToTop />
      <div className="p-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">
          Employers
        </h3>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
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
