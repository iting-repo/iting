import React, { useState } from 'react';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

const JobFilters = () => {
    const [salaryRange, setSalaryRange] = useState(5000);

    // Component con hiển thị checkbox
    const FilterCheckbox = ({ label, count }) => (
        <label className="flex items-center justify-between cursor-pointer group mb-2 last:mb-0">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    className="w-4 h-4 text-[#00B4D8] rounded border-gray-300 focus:ring-[#00B4D8] cursor-pointer"
                />
                <span className="text-gray-600 group-hover:text-[#00B4D8] text-sm transition-colors">
                    {label}
                </span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full min-w-[24px] text-center font-medium">
                {count}
            </span>
        </label>
    );

    return (
        <div className="space-y-6">

            {/* KHỐI 1: TÌM KIẾM & ĐỊA ĐIỂM (Nền xanh nhạt giống ảnh) */}
            <div className="bg-[#E6F6FD] p-5 rounded-xl border border-[#E6F6FD] space-y-5">
                {/* Tìm kiếm theo Chức danh */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Tìm kiếm theo Chức danh</h3>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Chức danh hoặc tên Công ty"
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-transparent focus:border-[#00B4D8] rounded-lg outline-none text-sm transition-all placeholder-gray-400 shadow-sm"
                        />
                    </div>
                </div>

                {/* Địa điểm làm việc */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Địa điểm làm việc</h3>
                    <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <select className="w-full pl-9 pr-3 py-2.5 bg-white border border-transparent focus:border-[#00B4D8] rounded-lg outline-none text-sm appearance-none cursor-pointer text-gray-600 shadow-sm">
                            <option>Chọn thành phố</option>
                            <option>Hồ Chí Minh</option>
                            <option>Hà Nội</option>
                            <option>Đà Nẵng</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* KHỐI 2: CÁC BỘ LỌC CHI TIẾT (Nền trắng) */}
            <div className="bg-[#E6F6FD] p-5 rounded-xl border border-gray-100 shadow-sm space-y-7">

                {/* LĨNH VỰC */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Lĩnh vực</h3>
                    <div className="space-y-1">
                        <FilterCheckbox label="Software Development" count={10} />
                        <FilterCheckbox label="DevOps & Cloud" count={10} />
                        <FilterCheckbox label="Cybersecurity" count={10} />
                        <FilterCheckbox label="Data & AI" count={10} />
                        <FilterCheckbox label="Web Development" count={10} />
                    </div>
                    <button className="w-full mt-3 py-2 bg-[#00B4D8] hover:bg-[#0096B4] text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                        Xem Thêm
                    </button>
                </div>

                <hr className="border-gray-100" />

                {/* HÌNH THỨC LÀM VIỆC */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Hình thức làm việc</h3>
                    <div className="space-y-1">
                        <FilterCheckbox label="Toàn thời gian" count={10} />
                        <FilterCheckbox label="Bán thời gian" count={10} />
                        <FilterCheckbox label="Freelance" count={10} />
                        <FilterCheckbox label="Thực tập" count={10} />
                        <FilterCheckbox label="Khác" count={10} />
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* CẤP BẬC */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Cấp bậc</h3>
                    <div className="space-y-1">
                        <FilterCheckbox label="Thực tập" count={10} />
                        <FilterCheckbox label="Nhân viên mới" count={10} />
                        <FilterCheckbox label="Chuyên viên" count={10} />
                        <FilterCheckbox label="Trưởng phòng" count={10} />
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* THỜI GIAN ĐĂNG */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Thời gian đăng</h3>
                    <div className="space-y-1">
                        <FilterCheckbox label="Tất cả" count={10} />
                        <FilterCheckbox label="Giờ trước" count={10} />
                        <FilterCheckbox label="24 Giờ trước" count={10} />
                        <FilterCheckbox label="7 Ngày trước" count={10} />
                        <FilterCheckbox label="30 Ngày trước" count={10} />
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* MỨC LƯƠNG */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Mức lương</h3>
                    <div className="px-1 mb-4">
                        <input
                            type="range"
                            min="0" max="10000"
                            value={salaryRange}
                            onChange={(e) => setSalaryRange(e.target.value)}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00B4D8]"
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="text-xs font-bold text-gray-600">
                            <p>Lương: <span className="text-gray-900">0đ - {salaryRange}đ</span></p>
                        </div>
                        <button className="px-3 py-1.5 text-[10px] font-bold text-white bg-[#00B4D8] rounded hover:bg-[#0096B4] transition-colors">
                            Áp dụng
                        </button>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* TAGS */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {['engineering', 'design', 'ui/ux', 'marketing', 'management', 'soft', 'construction'].map((tag, idx) => (
                            <span key={idx} className="px-3 py-1 bg-[#E6F6FD] text-[#00B4D8] text-xs font-medium rounded-md cursor-pointer hover:bg-[#d0f0fd] transition-colors">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobFilters;