import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FaBars, FaSearch, FaChevronRight, FaTimes, FaCheck, FaQuestionCircle } from 'react-icons/fa';

const categoriesData = [
    { id: 1, name: 'Công nghệ Thông tin', sub: ['Phát triển phần mềm', 'Dữ liệu/AI', 'Bảo mật', 'Mạng/Hệ thống'] },
    { id: 2, name: 'Kinh doanh/Bán hàng', sub: ['Sale Admin', 'Bán lẻ', 'Bất động sản', 'Tài chính/Ngân hàng'] },
    { id: 3, name: 'Marketing/PR/Quảng cáo', sub: ['Digital Marketing', 'Content Creator', 'Event', 'SEO'] },
    { id: 4, name: 'Chăm sóc khách hàng', sub: ['Call Center', 'Support', 'Tư vấn'] },
    { id: 5, name: 'Nhân sự/Hành chính', sub: ['Tuyển dụng', 'C&B', 'Pháp chế'] },
    { id: 6, name: 'Thiết kế/Sáng tạo', sub: ['UI/UX', 'Graphic Design', 'Video Editor'] },
];

const CategoryPicker = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedSubs, setSelectedSubs] = useState([]);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    
    const triggerRef = useRef(null);
    const modalRef = useRef(null);

    const filteredGroups = useMemo(() => {
        return categoriesData.filter(g => 
            g.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: 750
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target) && 
                triggerRef.current && !triggerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
        setSelectedSubs([]);
    };

    const toggleSub = (sub) => {
        setSelectedSubs(prev => {
            if (prev.includes(sub)) return prev.filter(s => s !== sub);
            return [...prev, sub];
        });
    };

    const handleApply = () => {
        if (selectedSubs.length > 0) {
            onChange(selectedSubs.join(', '));
        } else if (selectedGroup) {
            onChange(selectedGroup.name);
        } else {
            onChange('');
        }
        setIsOpen(false);
    };

    const handleClear = () => {
        setSelectedGroup(null);
        setSelectedSubs([]);
        onChange('');
        setIsOpen(false);
    };

    return (
        <div className="w-full h-full flex items-center">
            {/* Trigger Button */}
            <div 
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 cursor-pointer w-full group py-1 h-full border-r border-gray-100 pr-4"
            >
                <FaBars className="text-gray-500 group-hover:text-[#3AB4E6] transition-colors" />
                <span className={`flex-1 truncate text-sm ${value ? 'text-gray-700 font-bold' : 'text-gray-500'}`}>
                    {value || 'Danh mục nghề nghiệp'}
                </span>
            </div>

            {/* Dropdown Modal */}
            {isOpen && (
                <div 
                    ref={modalRef}
                    style={{ 
                        position: 'fixed', 
                        top: coords.top - window.scrollY + 12, 
                        left: coords.left,
                        width: coords.width,
                        zIndex: 10000 
                    }}
                    className="bg-white rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.25)] border border-gray-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-300"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 bg-white">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-base font-bold text-gray-800">Chọn Nhóm nghề, Nghề hoặc Chuyên môn</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <div className="relative mx-2">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Nhập từ khóa tìm kiếm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 bg-white border border-[#3AB4E6]/50 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#3AB4E6]/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex h-[450px]">
                        {/* Left Column: Group */}
                        <div className="w-[40%] border-r border-gray-100 flex flex-col">
                            <div className="p-3 bg-gray-50/50">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">NHÓM NGHỀ</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                                {filteredGroups.map(g => (
                                    <div 
                                        key={g.id}
                                        onClick={() => handleGroupSelect(g)}
                                        className={`flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer mb-1 transition-all ${selectedGroup?.id === g.id ? 'bg-[#EBF8FF] text-[#3AB4E6]' : 'hover:bg-gray-50 text-gray-600'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedGroup?.id === g.id ? 'bg-[#3AB4E6] border-[#3AB4E6]' : 'border-gray-200 bg-white'}`}>
                                                {selectedGroup?.id === g.id && <FaCheck className="text-white text-[10px]" />}
                                            </div>
                                            <span className="text-sm font-semibold">{g.name}</span>
                                        </div>
                                        <FaChevronRight size={10} className={selectedGroup?.id === g.id ? 'text-[#3AB4E6]' : 'text-gray-200'} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Subs */}
                        <div className="w-[60%] flex flex-col bg-white">
                            <div className="p-3 bg-gray-50/50 flex gap-12">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">NGHỀ</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">VỊ TRÍ CHUYÊN MÔN</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                {!selectedGroup ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                        <img src="https://cdn-icons-png.flaticon.com/512/747/747376.png" className="w-24 h-24 mb-6 grayscale" alt="Select" />
                                        <p className="text-sm font-bold text-gray-700">Vui lòng chọn Nhóm nghề</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                        {selectedGroup.sub.map(sub => (
                                            <div 
                                                key={sub}
                                                onClick={() => toggleSub(sub)}
                                                className="flex items-start gap-3 cursor-pointer group"
                                            >
                                                <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedSubs.includes(sub) ? 'bg-[#3AB4E6] border-[#3AB4E6]' : 'border-gray-200 bg-white group-hover:border-[#3AB4E6]'}`}>
                                                    {selectedSubs.includes(sub) && <FaCheck className="text-white text-[10px]" />}
                                                </div>
                                                <span className={`text-sm font-medium ${selectedSubs.includes(sub) ? 'text-[#3AB4E6]' : 'text-gray-600 group-hover:text-gray-800'}`}>{sub}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                            <span>Bạn gặp vấn đề với Danh mục Nghề?</span>
                            <button className="text-[#3AB4E6] font-bold hover:underline">Gửi góp ý</button>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 text-sm font-medium">Bỏ chọn tất cả</button>
                            <button onClick={() => setIsOpen(false)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-full text-sm transition-all">Hủy</button>
                            <button onClick={handleApply} className="px-10 py-2 bg-[#3AB4E6] hover:bg-[#2A9DCB] text-white font-bold rounded-full shadow-lg shadow-blue-100 transition-all text-sm">Chọn</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryPicker;
