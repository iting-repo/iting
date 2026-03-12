import React from 'react';
import { FaSearch, FaBell } from 'react-icons/fa';

const AdminHeader = () => {
  return (
    <header className="bg-white h-20 px-8 flex items-center justify-between shadow-sm rounded-xl mb-8">
      
      {/* Search Bar */}
      <div className="relative w-96">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search users, posts, categories..." 
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-[#9D5CE9] transition-all text-sm text-gray-600 placeholder-gray-400"
        />
      </div>

      {/* Profile & Notifications */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button className="relative w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-[#9D5CE9] transition-colors">
          <FaBell />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
           <img 
             src="https://i.pravatar.cc/150?img=5" 
             alt="Admin Avatar" 
             className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
           />
           <div className="hidden md:block">
              <h4 className="text-sm font-bold text-gray-800">Moni Roy</h4>
              <p className="text-xs text-gray-500">Admin</p>
           </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;