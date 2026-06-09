import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FaSearch, FaMapMarkerAlt, FaMagic } from 'react-icons/fa';
import { LocationPicker } from './common';

const jobTypeOptions = [
    { label: 'Toàn thời gian', value: 'FULL_TIME' },
    { label: 'Bán thời gian', value: 'PART_TIME' },
    { label: 'Hợp đồng', value: 'CONTRACT' },
    { label: 'Thực tập', value: 'INTERNSHIP' },
    { label: 'Làm việc từ xa', value: 'REMOTE' },
    { label: 'Tự do', value: 'FREELANCE' },
];

const experienceOptions = [
    { label: 'Thực tập sinh', value: 'INTERN' },
    { label: 'Mới ra trường / Fresher', value: 'FRESHER' },
    { label: 'Junior (1-2 năm)', value: 'JUNIOR' },
    { label: 'Middle (2-4 năm)', value: 'MIDDLE' },
    { label: 'Mid-level (2-4 năm)', value: 'MID_LEVEL' },
    { label: 'Senior (4-7 năm)', value: 'SENIOR' },
    { label: 'Lead (7+ năm)', value: 'LEAD' },
    { label: 'Chuyên gia', value: 'EXPERT' },
    { label: 'Quản lý', value: 'MANAGER' },
];

const postedTimeOptions = [
    { label: 'Tất cả', value: '' },
    { label: '1 giờ qua', value: '1' },
    { label: '24 giờ qua', value: '24' },
    { label: '7 ngày qua', value: '168' },
    { label: '30 ngày qua', value: '720' },
];

const SALARY_MIN = 0;
const SALARY_MAX = 100000000; // 100 triệu
const SALARY_STEP = 1000000;  // 1 triệu

const formatVND = (value) => {
    const num = Number(value);
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)} tr`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toLocaleString('vi-VN');
};

const DualRangeSlider = ({ min, max, minVal, maxVal, step, onChange }) => {
    const trackRef = useRef(null);
    const minPercent = ((minVal - min) / (max - min)) * 100;
    const maxPercent = ((maxVal - min) / (max - min)) * 100;

    return (
        <div className="relative pt-2 pb-1">
            {/* Track background */}
            <div className="relative h-1.5 rounded-full bg-gray-200">
                {/* Active range */}
                <div
                    className="absolute h-full rounded-full"
                    style={{
                        left: `${minPercent}%`,
                        width: `${maxPercent - minPercent}%`,
                        background: 'linear-gradient(90deg, #3AB4E6, #2C9ACD)',
                    }}
                />
            </div>

            {/* Min thumb */}
            <input
                type="range"
                aria-label="Mức lương tối thiểu"
                min={min}
                max={max}
                step={step}
                value={minVal}
                onChange={(e) => {
                    const val = Math.min(Number(e.target.value), maxVal - step);
                    onChange(val, maxVal);
                }}
                className="salary-range-thumb"
                style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
            />

            {/* Max thumb */}
            <input
                type="range"
                aria-label="Mức lương tối đa"
                min={min}
                max={max}
                step={step}
                value={maxVal}
                onChange={(e) => {
                    const val = Math.max(Number(e.target.value), minVal + step);
                    onChange(minVal, val);
                }}
                className="salary-range-thumb"
                style={{ zIndex: 4 }}
            />

            {/* Inline styles for range thumbs */}
            <style>{`
                .salary-range-thumb {
                    position: absolute;
                    top: -2px;
                    left: 0;
                    width: 100%;
                    height: 12px;
                    -webkit-appearance: none;
                    appearance: none;
                    background: transparent;
                    pointer-events: none;
                    outline: none;
                    margin: 0;
                }
                .salary-range-thumb::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: white;
                    border: 3px solid #3AB4E6;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
                    cursor: pointer;
                    pointer-events: all;
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .salary-range-thumb::-webkit-slider-thumb:hover {
                    transform: scale(1.15);
                    box-shadow: 0 2px 8px rgba(58,180,230,0.35);
                }
                .salary-range-thumb::-webkit-slider-thumb:active {
                    transform: scale(1.2);
                    background: #E6F6FD;
                }
                .salary-range-thumb::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: white;
                    border: 3px solid #3AB4E6;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
                    cursor: pointer;
                    pointer-events: all;
                }
            `}</style>
        </div>
    );
};

const JobFilters = ({
    filters,
    provinces,
    onFieldChange,
    onApply,
    onReset,
}) => {
    const selectedJobTypeSet = new Set(filters.jobTypes || []);
    const selectedExperienceSet = new Set(filters.experienceLevels || []);

    const [salaryRange, setSalaryRange] = useState([
        Number(filters.minSalary) || SALARY_MIN,
        Number(filters.maxSalary) || SALARY_MAX,
    ]);

    // Sync when filters change externally (e.g. reset)
    useEffect(() => {
        setSalaryRange([
            Number(filters.minSalary) || SALARY_MIN,
            Number(filters.maxSalary) || SALARY_MAX,
        ]);
    }, [filters.minSalary, filters.maxSalary]);

    const handleSalaryChange = useCallback((newMin, newMax) => {
        setSalaryRange([newMin, newMax]);
        // Only push to parent on change to avoid excessive re-renders
        onFieldChange('minSalary', newMin === SALARY_MIN ? '' : String(newMin));
        onFieldChange('maxSalary', newMax === SALARY_MAX ? '' : String(newMax));
    }, [onFieldChange]);

    const toggleMulti = (field, value) => {
        const current = Array.isArray(filters[field]) ? filters[field] : [];
        const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        onFieldChange(field, next);
    };

    const FilterCheckbox = ({ label, value, checked, onToggle }) => (
        <label className="flex items-center justify-between cursor-pointer group mb-2 last:mb-0">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(value)}
                    className="w-4 h-4 text-[#3AB4E6] rounded border-gray-300 focus:ring-[#3AB4E6] cursor-pointer"
                />
                <span className="text-gray-600 group-hover:text-[#3AB4E6] text-sm transition-colors">
                    {label}
                </span>
            </div>
        </label>
    );

    const isDefaultSalary = salaryRange[0] === SALARY_MIN && salaryRange[1] === SALARY_MAX;

    return (
        <div className="space-y-6">
            <div className="bg-[#E6F6FD] p-5 rounded-xl border border-[#E6F6FD] space-y-5">
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Tìm kiếm theo Chức danh</h3>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            aria-label="Tìm kiếm theo chức danh hoặc tên công ty"
                            value={filters.keyword}
                            onChange={(e) => onFieldChange('keyword', e.target.value)}
                            placeholder="Chức danh hoặc tên Công ty"
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-transparent focus:border-[#3AB4E6] rounded-lg outline-none text-sm transition-all placeholder-gray-400 shadow-sm"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Địa điểm làm việc</h3>
                    <div className="relative bg-white border border-transparent focus-within:border-[#3AB4E6] rounded-lg shadow-sm">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs z-10" />
                        <div className="pl-9 pr-3 py-2.5">
                            <LocationPicker
                                value={filters.location}
                                onChange={(val) => onFieldChange('location', val)}
                                provinces={provinces}
                            />
                        </div>
                    </div>
                </div>


                <button
                    onClick={onApply}
                    className="w-full py-2 bg-[#3AB4E6] hover:bg-[#2C9ACD] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                    Tìm kiếm
                </button>
            </div>

            <div className="bg-[#E6F6FD] p-5 rounded-xl border border-gray-100 shadow-sm space-y-7">
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Hình thức làm việc</h3>
                    <div className="space-y-1">
                        {jobTypeOptions.map((item) => (
                            <FilterCheckbox
                                key={item.value}
                                label={item.label}
                                value={item.value}
                                checked={selectedJobTypeSet.has(item.value)}
                                onToggle={(value) => toggleMulti('jobTypes', value)}
                            />
                        ))}
                    </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Cấp bậc</h3>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                        {experienceOptions.map((item) => (
                            <FilterCheckbox
                                key={item.value}
                                label={item.label}
                                value={item.value}
                                checked={selectedExperienceSet.has(item.value)}
                                onToggle={(value) => toggleMulti('experienceLevels', value)}
                            />
                        ))}
                    </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Thời gian đăng</h3>
                    <div className="space-y-1">
                        {postedTimeOptions.map((item) => (
                            <label key={item.label} className="flex items-center gap-2 cursor-pointer group mb-2 last:mb-0">
                                <input
                                    type="radio"
                                    name="postedWithinHours"
                                    checked={String(filters.postedWithinHours || '') === item.value}
                                    onChange={() => onFieldChange('postedWithinHours', item.value)}
                                    className="w-4 h-4 text-[#3AB4E6] border-gray-300 focus:ring-[#3AB4E6] cursor-pointer"
                                />
                                <span className="text-gray-600 group-hover:text-[#3AB4E6] text-sm transition-colors">
                                    {item.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Salary Range Slider */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800 text-sm">Mức lương</h3>
                        {!isDefaultSalary && (
                            <button
                                onClick={() => handleSalaryChange(SALARY_MIN, SALARY_MAX)}
                                className="text-[10px] text-gray-400 hover:text-[#3AB4E6] transition-colors"
                            >
                                Đặt lại
                            </button>
                        )}
                    </div>

                    {/* Value display */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 min-w-[70px] text-center">
                            <span className="text-xs font-semibold text-[#3AB4E6]">
                                {salaryRange[0] === SALARY_MIN ? '0' : formatVND(salaryRange[0])}
                            </span>
                        </div>
                        <span className="text-gray-300 text-xs mx-2">—</span>
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 min-w-[70px] text-center">
                            <span className="text-xs font-semibold text-[#3AB4E6]">
                                {salaryRange[1] === SALARY_MAX ? '100 tr+' : formatVND(salaryRange[1])}
                            </span>
                        </div>
                    </div>

                    {/* Dual Range Slider */}
                    <DualRangeSlider
                        min={SALARY_MIN}
                        max={SALARY_MAX}
                        step={SALARY_STEP}
                        minVal={salaryRange[0]}
                        maxVal={salaryRange[1]}
                        onChange={handleSalaryChange}
                    />

                    {/* Scale labels */}
                    <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] text-gray-400">0</span>
                        <span className="text-[10px] text-gray-400">25 tr</span>
                        <span className="text-[10px] text-gray-400">50 tr</span>
                        <span className="text-[10px] text-gray-400">75 tr</span>
                        <span className="text-[10px] text-gray-400">100 tr</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onApply}
                        className="flex-1 py-2 bg-[#3AB4E6] hover:bg-[#2C9ACD] text-white text-xs font-bold rounded-lg transition-colors"
                    >
                        Áp dụng
                    </button>
                    <button
                        onClick={onReset}
                        className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Đặt lại
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobFilters;

