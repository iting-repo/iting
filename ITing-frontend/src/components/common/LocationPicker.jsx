import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FaSearch, FaChevronRight, FaTimes, FaCheck, FaMapMarkerAlt } from 'react-icons/fa';

const LocationPicker = ({ value, onChange, provinces }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTermProvince, setSearchTermProvince] = useState('');
    const [searchTermDistrict, setSearchTermDistrict] = useState('');
    const [districts, setDistricts] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistricts, setSelectedDistricts] = useState([]);
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const [searchMode, setSearchMode] = useState('old');
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    const filteredProvinces = useMemo(() => {
        return provinces.filter(p => 
            p.name.toLowerCase().includes(searchTermProvince.toLowerCase())
        );
    }, [provinces, searchTermProvince]);

    const filteredDistricts = useMemo(() => {
        return districts.filter(d => 
            d.name.toLowerCase().includes(searchTermDistrict.toLowerCase())
        );
    }, [districts, searchTermDistrict]);

    // Update position when opening or window changes
    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: 650 // Fixed width for TopCV style
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

    useEffect(() => {
        if (selectedProvince) {
            setIsLoadingDistricts(true);
            fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
                .then(res => res.json())
                .then(data => {
                    setDistricts(data.districts || []);
                })
                .finally(() => setIsLoadingDistricts(false));
        } else {
            setDistricts([]);
        }
    }, [selectedProvince]);

    const handleProvinceSelect = (province) => {
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

    const handleApply = () => {
        if (!selectedProvince) {
            onChange('');
        } else if (selectedDistricts.length === 0) {
            onChange(selectedProvince.name);
        } else {
            onChange(`${selectedDistricts.join(', ')}, ${selectedProvince.name}`);
        }
        setIsOpen(false);
    };

    const handleClear = () => {
        setSelectedProvince(null);
        setSelectedDistricts([]);
        onChange('');
        setIsOpen(false);
    };

    return (
        <div className="w-full">
            {/* Trigger Button */}
            <div 
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center cursor-pointer w-full group py-1"
            >
                <span className={`flex-1 truncate ${value ? 'text-gray-700 font-semibold' : 'text-gray-400'}`}>
                    {value || 'Tất cả địa điểm'}
                </span>
                <FaChevronRight size={10} className={`text-gray-300 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </div>

            {/* Dropdown Menu (Fixed Positioning to avoid clipping) */}
            {isOpen && (
                <div 
                    ref={dropdownRef}
                    style={{ 
                        position: 'fixed', 
                        top: coords.top - window.scrollY + 12, 
                        left: Math.min(coords.left, window.innerWidth - coords.width - 20),
                        width: coords.width,
                        zIndex: 9999 
                    }}
                    className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    {/* Header: Radio Options */}
                    <div className="p-4 border-b border-gray-50 flex items-center gap-6 bg-white">
                        <span className="text-sm font-bold text-gray-800">Tìm theo:</span>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div 
                                    onClick={() => setSearchMode('old')}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${searchMode === 'old' ? 'border-[#3AB4E6] bg-white' : 'border-gray-200 group-hover:border-gray-300'}`}
                                >
                                    {searchMode === 'old' && <div className="w-2.5 h-2.5 rounded-full bg-[#3AB4E6]"></div>}
                                </div>
                                <span className={`text-sm font-medium ${searchMode === 'old' ? 'text-[#3AB4E6]' : 'text-gray-500'}`}>Tỉnh, Quận/huyện cũ</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div 
                                    onClick={() => setSearchMode('new')}
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
                        {/* Left Column */}
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
                                {filteredProvinces.map((p) => (
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
                                ))}
                            </div>
                        </div>

                        {/* Right Column */}
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
                                        <img src="https://cdn-icons-png.flaticon.com/512/2776/2776067.png" className="w-16 h-16 mb-4 grayscale" alt="Select" />
                                        <p className="text-xs font-medium text-gray-400">Vui lòng chọn Tỉnh/Thành phố</p>
                                    </div>
                                ) : isLoadingDistricts ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-gray-100 border-t-[#3AB4E6] rounded-full animate-spin"></div>
                                    </div>
                                ) : searchMode === 'new' ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-blue-50/30 m-2 rounded-xl border border-blue-100/50">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                            <FaMapMarkerAlt className="text-[#3AB4E6]" />
                                        </div>
                                        <p className="text-[11px] font-bold text-gray-800 mb-1">Dữ liệu sau 1/7/2025</p>
                                        <p className="text-[10px] text-gray-500 leading-relaxed px-4">
                                            Hệ thống đang cập nhật ranh giới hành chính mới (Phường/Xã sáp nhập). 
                                            <span className="text-[#3AB4E6] block mt-1 font-bold italic">Sẽ khả dụng sau khi có văn bản chính thức</span>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-0.5">
                                        <div 
                                            onClick={() => setSelectedDistricts([])}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${selectedDistricts.length === 0 ? 'text-[#3AB4E6]' : 'hover:bg-gray-50 text-gray-600'}`}
                                        >
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedDistricts.length === 0 ? 'bg-[#3AB4E6] border-[#3AB4E6]' : 'border-gray-200 bg-white'}`}>
                                                {selectedDistricts.length === 0 && <FaCheck className="text-white text-[10px]" />}
                                            </div>
                                            <span className="text-sm font-medium">Tất cả</span>
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
                                                <span className="text-sm font-medium">{d.name}</span>
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
            )}
        </div>
    );
};

export default LocationPicker;
