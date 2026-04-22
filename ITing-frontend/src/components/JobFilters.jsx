import React from 'react';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

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
    { label: 'Tat ca', value: '' },
    { label: '1 gio qua', value: '1' },
    { label: '24 gio qua', value: '24' },
    { label: '7 ngay qua', value: '168' },
    { label: '30 ngay qua', value: '720' },
];

const JobFilters = ({
    filters,
    provinces,
    onFieldChange,
    onApply,
    onReset,
}) => {
    const selectedJobTypeSet = new Set(filters.jobTypes || []);
    const selectedExperienceSet = new Set(filters.experienceLevels || []);

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
                    className="w-4 h-4 text-[#00B4D8] rounded border-gray-300 focus:ring-[#00B4D8] cursor-pointer"
                />
                <span className="text-gray-600 group-hover:text-[#00B4D8] text-sm transition-colors">
                    {label}
                </span>
            </div>
        </label>
    );

    return (
        <div className="space-y-6">
            <div className="bg-[#E6F6FD] p-5 rounded-xl border border-[#E6F6FD] space-y-5">
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Tim kiem theo Chuc danh</h3>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            value={filters.keyword}
                            onChange={(e) => onFieldChange('keyword', e.target.value)}
                            placeholder="Chuc danh hoac ten Cong ty"
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-transparent focus:border-[#00B4D8] rounded-lg outline-none text-sm transition-all placeholder-gray-400 shadow-sm"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Dia diem lam viec</h3>
                    <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <select
                            value={filters.location}
                            onChange={(e) => onFieldChange('location', e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-transparent focus:border-[#00B4D8] rounded-lg outline-none text-sm appearance-none cursor-pointer text-gray-600 shadow-sm"
                        >
                            <option value="">Chon thanh pho</option>
                            {provinces.map((province) => (
                                <option key={province.code} value={province.name}>{province.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={onApply}
                    className="w-full py-2 bg-[#00B4D8] hover:bg-[#0096B4] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                    Tim kiem
                </button>
            </div>

            <div className="bg-[#E6F6FD] p-5 rounded-xl border border-gray-100 shadow-sm space-y-7">
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Hinh thuc lam viec</h3>
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
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Cap bac</h3>
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
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Thoi gian dang</h3>
                    <div className="space-y-1">
                        {postedTimeOptions.map((item) => (
                            <label key={item.label} className="flex items-center gap-2 cursor-pointer group mb-2 last:mb-0">
                                <input
                                    type="radio"
                                    name="postedWithinHours"
                                    checked={String(filters.postedWithinHours || '') === item.value}
                                    onChange={() => onFieldChange('postedWithinHours', item.value)}
                                    className="w-4 h-4 text-[#00B4D8] border-gray-300 focus:ring-[#00B4D8] cursor-pointer"
                                />
                                <span className="text-gray-600 group-hover:text-[#00B4D8] text-sm transition-colors">
                                    {item.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Muc luong</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            min="0"
                            value={filters.minSalary}
                            onChange={(e) => onFieldChange('minSalary', e.target.value)}
                            placeholder="Tu"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm"
                        />
                        <input
                            type="number"
                            min="0"
                            value={filters.maxSalary}
                            onChange={(e) => onFieldChange('maxSalary', e.target.value)}
                            placeholder="Den"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onApply}
                        className="flex-1 py-2 bg-[#00B4D8] hover:bg-[#0096B4] text-white text-xs font-bold rounded-lg transition-colors"
                    >
                        Ap dung
                    </button>
                    <button
                        onClick={onReset}
                        className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Dat lai
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobFilters;
