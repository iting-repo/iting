import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaSearch, FaChevronRight, FaCheck, FaMapMarkerAlt } from 'react-icons/fa';

/**
 * Danh sách 63 tỉnh/thành tĩnh (fallback khi API không khả dụng).
 * Bao gồm cả tên cũ/mới/viết tắt để search match chính xác với DB.
 */
const STATIC_PROVINCES = [
    { code: 1, name: 'Thành phố Hà Nội', shortName: 'Hà Nội' },
    { code: 79, name: 'Thành phố Hồ Chí Minh', shortName: 'TP. Hồ Chí Minh' },
    { code: 48, name: 'Thành phố Đà Nẵng', shortName: 'Đà Nẵng' },
    { code: 31, name: 'Thành phố Hải Phòng', shortName: 'Hải Phòng' },
    { code: 92, name: 'Thành phố Cần Thơ', shortName: 'Cần Thơ' },
    { code: 2, name: 'Tỉnh Hà Giang', shortName: 'Hà Giang' },
    { code: 4, name: 'Tỉnh Cao Bằng', shortName: 'Cao Bằng' },
    { code: 6, name: 'Tỉnh Bắc Kạn', shortName: 'Bắc Kạn' },
    { code: 8, name: 'Tỉnh Tuyên Quang', shortName: 'Tuyên Quang' },
    { code: 10, name: 'Tỉnh Lào Cai', shortName: 'Lào Cai' },
    { code: 11, name: 'Tỉnh Điện Biên', shortName: 'Điện Biên' },
    { code: 12, name: 'Tỉnh Lai Châu', shortName: 'Lai Châu' },
    { code: 14, name: 'Tỉnh Sơn La', shortName: 'Sơn La' },
    { code: 15, name: 'Tỉnh Yên Bái', shortName: 'Yên Bái' },
    { code: 17, name: 'Tỉnh Hoà Bình', shortName: 'Hoà Bình' },
    { code: 19, name: 'Tỉnh Thái Nguyên', shortName: 'Thái Nguyên' },
    { code: 20, name: 'Tỉnh Lạng Sơn', shortName: 'Lạng Sơn' },
    { code: 22, name: 'Tỉnh Quảng Ninh', shortName: 'Quảng Ninh' },
    { code: 24, name: 'Tỉnh Bắc Giang', shortName: 'Bắc Giang' },
    { code: 25, name: 'Tỉnh Phú Thọ', shortName: 'Phú Thọ' },
    { code: 26, name: 'Tỉnh Vĩnh Phúc', shortName: 'Vĩnh Phúc' },
    { code: 27, name: 'Tỉnh Bắc Ninh', shortName: 'Bắc Ninh' },
    { code: 30, name: 'Tỉnh Hải Dương', shortName: 'Hải Dương' },
    { code: 33, name: 'Tỉnh Hưng Yên', shortName: 'Hưng Yên' },
    { code: 34, name: 'Tỉnh Thái Bình', shortName: 'Thái Bình' },
    { code: 35, name: 'Tỉnh Hà Nam', shortName: 'Hà Nam' },
    { code: 36, name: 'Tỉnh Nam Định', shortName: 'Nam Định' },
    { code: 37, name: 'Tỉnh Ninh Bình', shortName: 'Ninh Bình' },
    { code: 38, name: 'Tỉnh Thanh Hoá', shortName: 'Thanh Hoá' },
    { code: 40, name: 'Tỉnh Nghệ An', shortName: 'Nghệ An' },
    { code: 42, name: 'Tỉnh Hà Tĩnh', shortName: 'Hà Tĩnh' },
    { code: 44, name: 'Tỉnh Quảng Bình', shortName: 'Quảng Bình' },
    { code: 45, name: 'Tỉnh Quảng Trị', shortName: 'Quảng Trị' },
    { code: 46, name: 'Tỉnh Thừa Thiên Huế', shortName: 'Thừa Thiên Huế' },
    { code: 49, name: 'Tỉnh Quảng Nam', shortName: 'Quảng Nam' },
    { code: 51, name: 'Tỉnh Quảng Ngãi', shortName: 'Quảng Ngãi' },
    { code: 52, name: 'Tỉnh Bình Định', shortName: 'Bình Định' },
    { code: 54, name: 'Tỉnh Phú Yên', shortName: 'Phú Yên' },
    { code: 56, name: 'Tỉnh Khánh Hoà', shortName: 'Khánh Hoà' },
    { code: 58, name: 'Tỉnh Ninh Thuận', shortName: 'Ninh Thuận' },
    { code: 60, name: 'Tỉnh Bình Thuận', shortName: 'Bình Thuận' },
    { code: 62, name: 'Tỉnh Kon Tum', shortName: 'Kon Tum' },
    { code: 64, name: 'Tỉnh Gia Lai', shortName: 'Gia Lai' },
    { code: 66, name: 'Tỉnh Đắk Lắk', shortName: 'Đắk Lắk' },
    { code: 67, name: 'Tỉnh Đắk Nông', shortName: 'Đắk Nông' },
    { code: 68, name: 'Tỉnh Lâm Đồng', shortName: 'Lâm Đồng' },
    { code: 70, name: 'Tỉnh Bình Phước', shortName: 'Bình Phước' },
    { code: 72, name: 'Tỉnh Tây Ninh', shortName: 'Tây Ninh' },
    { code: 74, name: 'Tỉnh Bình Dương', shortName: 'Bình Dương' },
    { code: 75, name: 'Tỉnh Đồng Nai', shortName: 'Đồng Nai' },
    { code: 77, name: 'Tỉnh Bà Rịa - Vũng Tàu', shortName: 'Bà Rịa - Vũng Tàu' },
    { code: 80, name: 'Tỉnh Long An', shortName: 'Long An' },
    { code: 82, name: 'Tỉnh Tiền Giang', shortName: 'Tiền Giang' },
    { code: 83, name: 'Tỉnh Bến Tre', shortName: 'Bến Tre' },
    { code: 84, name: 'Tỉnh Trà Vinh', shortName: 'Trà Vinh' },
    { code: 86, name: 'Tỉnh Vĩnh Long', shortName: 'Vĩnh Long' },
    { code: 87, name: 'Tỉnh Đồng Tháp', shortName: 'Đồng Tháp' },
    { code: 89, name: 'Tỉnh An Giang', shortName: 'An Giang' },
    { code: 91, name: 'Tỉnh Kiên Giang', shortName: 'Kiên Giang' },
    { code: 93, name: 'Tỉnh Hậu Giang', shortName: 'Hậu Giang' },
    { code: 94, name: 'Tỉnh Sóc Trăng', shortName: 'Sóc Trăng' },
    { code: 95, name: 'Tỉnh Bạc Liêu', shortName: 'Bạc Liêu' },
    { code: 96, name: 'Tỉnh Cà Mau', shortName: 'Cà Mau' },
];

const LocationPicker = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTermProvince, setSearchTermProvince] = useState('');
    const [searchTermDistrict, setSearchTermDistrict] = useState('');
    const [provinces, setProvinces] = useState(STATIC_PROVINCES);
    const [districts, setDistricts] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistricts, setSelectedDistricts] = useState([]);
    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const [searchMode, setSearchMode] = useState('old'); // 'old' = quận/huyện cũ, 'new' = sau 1/7/2025
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    // Fetch danh sách tỉnh theo mode
    // - Mode cũ: /api/p/ (v1, 63 tỉnh, cấu trúc cũ)
    // - Mode mới: /api/v2/p/ (v2, ~34 tỉnh sau sáp nhập)
    useEffect(() => {
        setIsLoadingProvinces(true);
        const url = searchMode === 'new'
            ? 'https://provinces.open-api.vn/api/v2/p/'
            : 'https://provinces.open-api.vn/api/p/';
        
        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setProvinces(data);
                } else {
                    setProvinces(STATIC_PROVINCES);
                }
            })
            .catch(() => {
                setProvinces(STATIC_PROVINCES);
            })
            .finally(() => setIsLoadingProvinces(false));
    }, [searchMode]);

    // Khôi phục selectedProvince/selectedDistricts từ value prop khi provinces đã load
    // value có thể là: "Hồ Chí Minh", "Quận 1, Hồ Chí Minh", "Quận 1, Quận 3, Hồ Chí Minh"
    useEffect(() => {
        if (!value || provinces.length === 0 || isLoadingProvinces) return;
        // Nếu đã có province chọn rồi và value chưa thay đổi → bỏ qua
        if (selectedProvince) return;

        // Tách parts: "Quận 1, Quận 3, Hồ Chí Minh" → ["Quận 1", "Quận 3", "Hồ Chí Minh"]
        const parts = value.split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length === 0) return;

        // Tên tỉnh luôn nằm cuối cùng
        const provinceName = parts[parts.length - 1];
        const districtNames = parts.slice(0, -1);

        // Tìm tỉnh match: so sánh tên ngắn hoặc tên đầy đủ
        const matchedProvince = provinces.find(p => {
            const fullName = (p.name || '').toLowerCase();
            const shortName = (p.shortName || p.name || '')
                .replace(/^Tỉnh\s+/i, '')
                .replace(/^Thành phố\s+/i, '')
                .toLowerCase();
            const search = provinceName.toLowerCase();
            return fullName === search || shortName === search
                || fullName.includes(search) || search.includes(shortName);
        });

        if (matchedProvince) {
            setSelectedProvince(matchedProvince);
            if (districtNames.length > 0) {
                setSelectedDistricts(districtNames);
            }
        } else if (parts.length === 1) {
            // Có thể value chỉ là tên tỉnh duy nhất, thử match
            const singleMatch = provinces.find(p => {
                const shortName = (p.shortName || p.name || '')
                    .replace(/^Tỉnh\s+/i, '')
                    .replace(/^Thành phố\s+/i, '')
                    .toLowerCase();
                return shortName === parts[0].toLowerCase();
            });
            if (singleMatch) {
                setSelectedProvince(singleMatch);
            }
        }
    }, [value, provinces, isLoadingProvinces]);

    const filteredProvinces = useMemo(() => {
        const term = searchTermProvince.toLowerCase().trim();
        if (!term) return provinces;
        return provinces.filter(p => {
            const name = (p.name || '').toLowerCase();
            const shortName = (p.shortName || '').toLowerCase();
            return name.includes(term) || shortName.includes(term);
        });
    }, [provinces, searchTermProvince]);

    const filteredDistricts = useMemo(() => {
        const term = searchTermDistrict.toLowerCase().trim();
        if (!term) return districts;
        return districts.filter(d =>
            (d.name || '').toLowerCase().includes(term)
        );
    }, [districts, searchTermDistrict]);

    // Update position when opening or window changes
    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: 650
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('scroll', updatePosition);
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
                triggerRef.current && !triggerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Fetch quận/huyện hoặc phường/xã khi chọn tỉnh
    // - Mode cũ: /api/p/{code}?depth=2 → data.districts (Quận/Huyện cũ)
    // - Mode mới: /api/v2/p/{code}?depth=2 → data.wards (Phường/Xã sau sáp nhập 1/7/2025)
    useEffect(() => {
        if (selectedProvince) {
            setIsLoadingDistricts(true);
            setDistricts([]);
            setSearchTermDistrict('');

            const url = searchMode === 'new'
                ? `https://provinces.open-api.vn/api/v2/p/${selectedProvince.code}?depth=2`
                : `https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`;

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    if (searchMode === 'new') {
                        // API v2: phường/xã nằm trực tiếp trong data.wards (không qua tầng quận)
                        const wards = (data.wards || []).map(w => ({
                            code: w.code,
                            name: w.name,
                            type: w.division_type || 'phường',
                        }));
                        setDistricts(wards);
                    } else {
                        // API v1: quận/huyện nằm trong data.districts
                        setDistricts(data.districts || []);
                    }
                })
                .catch(() => setDistricts([]))
                .finally(() => setIsLoadingDistricts(false));
        } else {
            setDistricts([]);
        }
    }, [selectedProvince, searchMode]);

    const handleProvinceSelect = (province) => {
        if (selectedProvince?.code === province.code) return;
        setSelectedProvince(province);
        setSelectedDistricts([]);
    };

    const toggleDistrict = (districtName) => {
        setSelectedDistricts(prev => {
            if (prev.includes(districtName)) {
                return prev.filter(d => d !== districtName);
            } else {
                return [...prev, districtName];
            }
        });
    };

    // Lấy tên ngắn gọn của tỉnh (bỏ "Tỉnh ", "Thành phố ")
    const getShortName = (province) => {
        if (!province) return '';
        if (province.shortName) return province.shortName;
        return province.name
            .replace(/^Tỉnh\s+/i, '')
            .replace(/^Thành phố\s+/i, '');
    };

    const handleApply = () => {
        if (!selectedProvince) {
            onChange('');
        } else {
            const provinceName = getShortName(selectedProvince);
            if (selectedDistricts.length === 0) {
                // Chỉ chọn tỉnh → gửi tên ngắn
                onChange(provinceName);
            } else {
                // Chọn tỉnh + quận → gửi "Quận, Tỉnh"
                onChange(`${selectedDistricts.join(', ')}, ${provinceName}`);
            }
        }
        setIsOpen(false);
    };

    const handleClear = () => {
        setSelectedProvince(null);
        setSelectedDistricts([]);
        onChange('');
        setIsOpen(false);
    };

    // Khi switch mode, reset tất cả vì v1 & v2 có mã tỉnh khác nhau
    const handleModeChange = (mode) => {
        if (mode === searchMode) return;
        setSearchMode(mode);
        setSelectedProvince(null);
        setSelectedDistricts([]);
        setDistricts([]);
        setSearchTermProvince('');
        setSearchTermDistrict('');
        // Province list sẽ tự refetch nhờ useEffect dependency [searchMode]
    };

    return (
        <div className="w-full">
            {/* Trigger Button */}
            <div 
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center cursor-pointer w-full group py-1"
            >
                <span className={`flex-1 truncate text-sm ${value ? 'text-gray-700 font-semibold' : 'text-gray-400'}`}>
                    {value || 'Tất cả địa điểm'}
                </span>
                <FaChevronRight size={10} className={`text-gray-300 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </div>

            {/* Dropdown Menu (Fixed Positioning to avoid clipping) */}
            {isOpen && createPortal(
              <>
                {/* Transparent backdrop — closes on click, no blur/dim */}
                <div 
                    className="fixed inset-0"
                    style={{ zIndex: 9999 }}
                    onClick={() => setIsOpen(false)}
                />
                <div 
                    ref={dropdownRef}
                    style={{ 
                        position: 'fixed', 
                        top: coords.top - window.scrollY + 12, 
                        left: Math.min(coords.left, window.innerWidth - coords.width - 20),
                        width: coords.width,
                        zIndex: 10050
                    }}
                    className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    {/* Header: Radio Options */}
                    <div className="p-4 border-b border-gray-50 flex items-center gap-6 bg-white">
                        <span className="text-sm font-bold text-gray-800">Tìm theo:</span>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div 
                                    onClick={() => handleModeChange('old')}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${searchMode === 'old' ? 'border-[#3AB4E6] bg-white' : 'border-gray-200 group-hover:border-gray-300'}`}
                                >
                                    {searchMode === 'old' && <div className="w-2.5 h-2.5 rounded-full bg-[#3AB4E6]"></div>}
                                </div>
                                <span className={`text-sm font-medium ${searchMode === 'old' ? 'text-[#3AB4E6]' : 'text-gray-500'}`}>Tỉnh, Quận/huyện cũ</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div 
                                    onClick={() => handleModeChange('new')}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${searchMode === 'new' ? 'border-[#3AB4E6] bg-white' : 'border-gray-200 group-hover:border-gray-300'}`}
                                >
                                    {searchMode === 'new' && <div className="w-2.5 h-2.5 rounded-full bg-[#3AB4E6]"></div>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${searchMode === 'new' ? 'text-[#3AB4E6]' : 'text-gray-500'}`}>Tỉnh, Phường/xã sau 1/7/2025</span>
                                    <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded uppercase">Mới</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex h-[400px]">
                        {/* Left Column: Provinces */}
                        <div className="w-1/2 border-r border-gray-50 flex flex-col">
                            <div className="p-3 relative">
                                <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 size-3" />
                                <input 
                                    type="text"
                                    placeholder="Nhập Tỉnh/Thành phố"
                                    value={searchTermProvince}
                                    onChange={(e) => setSearchTermProvince(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-100 rounded-lg text-sm focus:border-[#3AB4E6] outline-none"
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-2">
                                {isLoadingProvinces ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-gray-100 border-t-[#3AB4E6] rounded-full animate-spin"></div>
                                    </div>
                                ) : filteredProvinces.length === 0 ? (
                                    <div className="py-8 text-center text-gray-400 text-xs">Không tìm thấy tỉnh/thành phố</div>
                                ) : (
                                    filteredProvinces.map((p) => (
                                        <div 
                                            key={p.code}
                                            onClick={() => handleProvinceSelect(p)}
                                            className={`flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${selectedProvince?.code === p.code ? 'bg-[#EBF8FF] text-[#3AB4E6]' : 'hover:bg-gray-50 text-gray-600'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedProvince?.code === p.code ? 'bg-[#3AB4E6] border-[#3AB4E6]' : 'border-gray-200 bg-white'}`}>
                                                    {selectedProvince?.code === p.code && <FaCheck className="text-white text-[10px]" />}
                                                </div>
                                                <span className="text-sm font-medium">{p.name}</span>
                                            </div>
                                            <FaChevronRight size={10} className={selectedProvince?.code === p.code ? 'text-[#3AB4E6]' : 'text-gray-200'} />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right Column: Districts / Wards */}
                        <div className="w-1/2 flex flex-col bg-white">
                            <div className="p-3 relative">
                                <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 size-3" />
                                <input 
                                    type="text"
                                    placeholder={searchMode === 'old' ? "Nhập Quận/Huyện" : "Nhập Phường/Xã/Quận/Huyện mới"}
                                    value={searchTermDistrict}
                                    onChange={(e) => setSearchTermDistrict(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-100 rounded-lg text-sm focus:border-[#3AB4E6] outline-none"
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-2">
                                {!selectedProvince ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                                        <FaMapMarkerAlt className="text-gray-300 text-3xl mb-4" />
                                        <p className="text-xs font-medium text-gray-400">Vui lòng chọn Tỉnh/Thành phố</p>
                                    </div>
                                ) : isLoadingDistricts ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-gray-100 border-t-[#3AB4E6] rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-0.5">
                                        {/* Option: Tất cả (chọn toàn tỉnh, không chọn quận cụ thể) */}
                                        <div 
                                            onClick={() => setSelectedDistricts([])}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${selectedDistricts.length === 0 ? 'text-[#3AB4E6]' : 'hover:bg-gray-50 text-gray-600'}`}
                                        >
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedDistricts.length === 0 ? 'bg-[#3AB4E6] border-[#3AB4E6]' : 'border-gray-200 bg-white'}`}>
                                                {selectedDistricts.length === 0 && <FaCheck className="text-white text-[10px]" />}
                                            </div>
                                            <span className="text-sm font-medium">Tất cả {getShortName(selectedProvince)}</span>
                                        </div>

                                        {filteredDistricts.map((d) => (
                                            <div 
                                                key={d.code}
                                                onClick={() => toggleDistrict(d.name)}
                                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${selectedDistricts.includes(d.name) ? 'text-[#3AB4E6]' : 'hover:bg-gray-50 text-gray-600'}`}
                                            >
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedDistricts.includes(d.name) ? 'bg-[#3AB4E6] border-[#3AB4E6]' : 'border-gray-200 bg-white'}`}>
                                                    {selectedDistricts.includes(d.name) && <FaCheck className="text-white text-[10px]" />}
                                                </div>
                                                <span className={`text-sm font-medium ${d.type === 'ward' ? 'pl-2 text-gray-500' : ''}`}>
                                                    {d.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-50 flex items-center justify-between bg-white">
                        <button 
                            onClick={handleClear}
                            className="text-[#3AB4E6] hover:underline text-sm font-medium"
                        >
                            Bỏ chọn tất cả
                        </button>
                        <button 
                            onClick={handleApply}
                            className="px-10 py-2 bg-[#3AB4E6] hover:bg-[#2A9DCB] text-white font-bold rounded shadow-lg shadow-blue-100 transition-all text-sm"
                        >
                            Áp dụng
                        </button>
                    </div>
                </div>
              </>
            , document.body)}
        </div>
    );
};

export default LocationPicker;
