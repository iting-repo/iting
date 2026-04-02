import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const user = currentUser ? currentUser : { name: "Super Admin", email: "admin@itwork.vn" };

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      dispatch(logout());
    }, 100);
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-[#3AB4E6] flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <span className="text-[#3AB4E6] font-bold text-sm">IT</span>
          </div>
          <span className="text-white font-bold text-lg font-display">ITWork Admin</span>
        </div>
        <div className="relative ml-4">
          <input
            className="w-64 h-9 rounded-lg bg-white/20 text-white text-sm pl-9 pr-3 placeholder:text-white/70 focus:outline-none focus:bg-white/30"
            placeholder="Tìm kiếm user, company, job..."
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-white/90 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center border border-[#3AB4E6]">1</span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-white/20">
          <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white text-xs font-bold border-2 border-white/50">
            {user.name ? user.name.charAt(0).toUpperCase() : 'SA'}
          </div>
          <div className="text-right mr-2 hidden sm:block">
            <p className="text-white text-sm font-medium">{user.name || "Super Admin"}</p>
            <p className="text-white/80 text-xs">{user.email || "admin@itwork.vn"}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors ml-1"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;