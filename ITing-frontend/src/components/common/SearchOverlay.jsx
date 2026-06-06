import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaClock, FaTimes, FaArrowRight, FaFire, FaBriefcase } from 'react-icons/fa';
import CompanyLogo from './CompanyLogo';
import axiosInstance from '../../utils/axiosInstance';
import { buildJobDetailPath } from '../../utils/jobUrl';
import searchHistoryService from '../../services/searchHistoryService';

/**
 * Save a keyword to local fallback (server-side tự lưu qua /api/jobs/search).
 * Giữ export để code khác đang dùng vẫn compile.
 */
export const saveSearchKeyword = (keyword) => {
    searchHistoryService.saveLocal(keyword);
};

const formatSalary = (min, max) => {
    if (!min && !max) return 'Thỏa thuận';
    const fmt = (n) => {
        const mil = n / 1000000;
        return mil % 1 === 0 ? `${mil} triệu` : `${mil.toFixed(1)} triệu`;
    };
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `Từ ${fmt(min)}`;
    return `Đến ${fmt(max)}`;
};

/**
 * SearchOverlay component
 * @param {boolean} isOpen - Whether the overlay is visible
 * @param {function} onClose - Callback to close the overlay
 * @param {string} searchType - 'job' | 'company' | 'both'
 * @param {function} onSearchTypeChange - (type: string) => void
 * @param {function} onSearch - (keyword: string) => void — trigger search with a keyword
 * @param {string} variant - 'homepage' | 'compact' — styling variant
 */
const SearchOverlay = ({
    isOpen,
    onClose,
    searchType = 'job',
    onSearchTypeChange,
    onSearch,
    variant = 'homepage',
}) => {
    const navigate = useNavigate();
    const overlayRef = useRef(null);
    const [history, setHistory] = useState([]);
    const [suggestedJobs, setSuggestedJobs] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    // Load history whenever overlay opens (server if logged in, localStorage otherwise)
    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        (async () => {
            const items = await searchHistoryService.list({ limit: 10 });
            // normalize: items can be array of strings (local) or { id, keyword } (server)
            const normalized = items.map((it) =>
                typeof it === 'string' ? { id: null, keyword: it } : it
            );
            if (!cancelled) setHistory(normalized);
        })();
        return () => { cancelled = true; };
    }, [isOpen]);

    // Fetch suggested jobs
    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;

        const fetchSuggestions = async () => {
            setLoadingSuggestions(true);
            try {
                const res = await axiosInstance.get('/jobs/search', {
                    params: {
                        page: 0,
                        size: 5,
                        sortBy: 'lastUpdate',
                        sortOrder: 'desc',
                    },
                });
                if (!cancelled) {
                    const jobs = Array.isArray(res?.content) ? res.content : [];
                    setSuggestedJobs(jobs);
                }
            } catch {
                if (!cancelled) setSuggestedJobs([]);
            } finally {
                if (!cancelled) setLoadingSuggestions(false);
            }
        };

        fetchSuggestions();
        return () => { cancelled = true; };
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (overlayRef.current && !overlayRef.current.contains(e.target)) {
                // Check if the click target is the search input itself
                const searchInput = e.target.closest('[data-search-trigger]');
                if (!searchInput) {
                    onClose?.();
                }
            }
        };

        // Delay adding listener so the same click that opened doesn't close
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const [styleCoords, setStyleCoords] = useState({});

    // Calculate dynamic position to break out of parent container on desktop/tablet
    useEffect(() => {
        if (!isOpen) {
            setStyleCoords({});
            return;
        }

        const updatePosition = () => {
            if (!overlayRef.current) return;
            const parent = overlayRef.current.parentElement;
            if (!parent) return;

            const outerContainer = parent.closest('.max-w-5xl') || parent;
            const parentRect = parent.getBoundingClientRect();
            const outerRect = outerContainer.getBoundingClientRect();
            
            const isMobile = window.innerWidth < 768;

            if (isMobile) {
                setStyleCoords({});
            } else {
                const leftOffset = parentRect.left - outerRect.left;
                const computed = window.getComputedStyle(outerContainer);
                const pl = parseFloat(computed.paddingLeft) || 0;
                const pr = parseFloat(computed.paddingRight) || 0;
                
                setStyleCoords({
                    left: -(leftOffset - pl),
                    width: outerRect.width - pl - pr
                });
            }
        };

        updatePosition();
        const timer = setTimeout(updatePosition, 50);
        window.addEventListener('resize', updatePosition);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    const handleKeywordClick = useCallback((e, keyword) => {
        e.preventDefault();
        e.stopPropagation();
        searchHistoryService.saveLocal(keyword); // optimistic local; server tracks on actual /jobs/search call
        onSearch?.(keyword);
        onClose?.();
    }, [onSearch, onClose]);

    const handleRemoveKeyword = useCallback(async (e, item) => {
        e.stopPropagation();
        e.preventDefault();
        await searchHistoryService.removeOne({ id: item.id, keyword: item.keyword });
        setHistory((prev) => prev.filter((h) => h.keyword !== item.keyword));
    }, []);

    const handleClearAll = useCallback(async () => {
        await searchHistoryService.clear();
        setHistory([]);
    }, []);

    const handleJobClick = useCallback((e, job) => {
        e.preventDefault();
        e.stopPropagation();
        const path = buildJobDetailPath(job);
        onClose?.();
        // Use setTimeout to ensure overlay closes before navigation
        setTimeout(() => navigate(path), 0);
    }, [navigate, onClose]);

    if (!isOpen) return null;

    const isCompact = variant === 'compact';

    return (
        <div
            ref={overlayRef}
            className={`absolute bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden
                ${isCompact ? 'top-full mt-2' : 'top-full mt-3'}
                ${Object.keys(styleCoords).length === 0 ? 'left-0 right-0' : ''}
            `}
            style={{
                animation: 'searchOverlayIn 0.2s ease-out',
                maxHeight: '70vh',
                overflowY: 'auto',
                ...styleCoords
            }}
        >
            {/* Global animation keyframes */}
            <style>{`
                @keyframes searchOverlayIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .search-overlay-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .search-overlay-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 999px;
                }
            `}</style>

            <div className="search-overlay-scrollbar" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Search Type Radio Section */}
                <div className="px-5 pt-4 pb-3 border-b border-gray-100 bg-gray-50/60">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-1 flex-wrap">
                        <span className="text-gray-500 text-xs font-medium mr-0 sm:mr-2">Tìm kiếm theo:</span>
                        <div className="flex items-center gap-0.5">
                        {[
                            { key: 'job', label: 'Tên việc làm' },
                            { key: 'company', label: 'Tên công ty' },
                            { key: 'both', label: 'Cả hai' },
                        ].map(({ key, label }) => (
                            <label
                                key={key}
                                className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-full transition-all text-xs font-medium
                                    hover:bg-blue-50"
                                onClick={() => onSearchTypeChange?.(key)}
                            >
                                <span
                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                                        ${searchType === key
                                            ? 'border-[#3AB4E6] bg-[#3AB4E6]'
                                            : 'border-gray-300 bg-white'
                                        }`}
                                >
                                    {searchType === key && (
                                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                    )}
                                </span>
                                <span className={searchType === key ? 'text-[#3AB4E6] font-bold' : 'text-gray-600'}>
                                    {label}
                                </span>
                            </label>
                        ))}
                        </div>
                    </div>
                </div>

                <div className={`grid ${isCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} divide-x divide-gray-100`}>
                    {/* Left: Recent Search History */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                                <FaClock className="text-gray-400" size={11} />
                                Từ khóa tìm kiếm gần đây
                            </h4>
                            {history.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="text-[#3AB4E6] text-xs font-medium hover:text-blue-700 transition-colors flex items-center gap-1"
                                >
                                    Xóa tất cả
                                </button>
                            )}
                        </div>

                        {history.length === 0 ? (
                            <div className="py-6 text-center">
                                <FaSearch className="text-gray-200 mx-auto mb-2" size={20} />
                                <p className="text-gray-400 text-xs">Chưa có lịch sử tìm kiếm</p>
                            </div>
                        ) : (
                            <div className="space-y-0.5">
                                {history.map((item, i) => (
                                    <div
                                        key={`${item.keyword}-${item.id ?? i}`}
                                        onMouseDown={(e) => handleKeywordClick(e, item.keyword)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors"
                                    >
                                        <FaClock className="text-gray-300 group-hover:text-gray-400 shrink-0" size={12} />
                                        <span className="flex-1 text-sm text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                                            {item.keyword}
                                        </span>
                                        <button
                                            onMouseDown={(e) => handleRemoveKeyword(e, item)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all p-1"
                                            title="Xóa"
                                        >
                                            <FaTimes size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Suggested Jobs */}
                    <div className={`p-4 ${isCompact ? 'border-t border-gray-100' : ''}`}>
                        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <FaFire className="text-orange-400" size={11} />
                            Việc làm có thể bạn quan tâm
                        </h4>

                        {loadingSuggestions ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3 animate-pulse">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0" />
                                        <div className="flex-1">
                                            <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-1.5" />
                                            <div className="h-3 bg-gray-50 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : suggestedJobs.length === 0 ? (
                            <div className="py-6 text-center">
                                <FaBriefcase className="text-gray-200 mx-auto mb-2" size={20} />
                                <p className="text-gray-400 text-xs">Chưa có gợi ý</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {suggestedJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        onMouseDown={(e) => handleJobClick(e, job)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50/60 cursor-pointer group transition-colors"
                                    >
                                        <CompanyLogo
                                            logoUrl={job.companyLogo || job.logo || job.logoUrl}
                                            companyId={job.companyId}
                                            companyName={job.companyName}
                                            className="w-10 h-10 rounded-lg object-contain bg-gray-50 p-0.5 shrink-0 border border-gray-100"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h5 className="text-sm font-semibold text-gray-800 group-hover:text-[#3AB4E6] truncate transition-colors">
                                                {job.title || job.position}
                                            </h5>
                                            <p className="text-xs text-gray-400 truncate mt-0.5">
                                                {job.companyName}
                                            </p>
                                            <span className="text-xs font-bold text-[#3AB4E6] mt-0.5 inline-block">
                                                {formatSalary(job.minSalary, job.maxSalary)}
                                            </span>
                                        </div>
                                        <FaArrowRight className="text-gray-200 group-hover:text-[#3AB4E6] shrink-0 transition-colors" size={10} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchOverlay;
