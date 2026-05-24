import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaClock, FaTimes, FaTrashAlt, FaArrowRight, FaFire, FaBriefcase } from 'react-icons/fa';
import CompanyLogo from './CompanyLogo';
import axiosInstance from '../../utils/axiosInstance';
import { buildJobDetailPath } from '../../utils/jobUrl';

const SEARCH_HISTORY_KEY = 'iting_search_history';
const MAX_HISTORY = 10;

/**
 * Load search history from localStorage
 */
const loadSearchHistory = () => {
    try {
        const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

/**
 * Save a keyword to search history
 */
export const saveSearchKeyword = (keyword) => {
    if (!keyword || !keyword.trim()) return;
    const trimmed = keyword.trim();
    const history = loadSearchHistory();
    // Remove duplicates, add to front
    const updated = [trimmed, ...history.filter((k) => k !== trimmed)].slice(0, MAX_HISTORY);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
};

/**
 * Clear all search history
 */
const clearSearchHistory = () => {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
};

/**
 * Remove a single keyword from history
 */
const removeSearchKeyword = (keyword) => {
    const history = loadSearchHistory();
    const updated = history.filter((k) => k !== keyword);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
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

    // Load history whenever overlay opens
    useEffect(() => {
        if (isOpen) {
            setHistory(loadSearchHistory());
        }
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

    const handleKeywordClick = useCallback((keyword) => {
        saveSearchKeyword(keyword);
        onSearch?.(keyword);
        onClose?.();
    }, [onSearch, onClose]);

    const handleRemoveKeyword = useCallback((e, keyword) => {
        e.stopPropagation();
        removeSearchKeyword(keyword);
        setHistory(loadSearchHistory());
    }, []);

    const handleClearAll = useCallback(() => {
        clearSearchHistory();
        setHistory([]);
    }, []);

    const handleJobClick = useCallback((job) => {
        navigate(buildJobDetailPath(job));
        onClose?.();
    }, [navigate, onClose]);

    if (!isOpen) return null;

    const isCompact = variant === 'compact';

    return (
        <div
            ref={overlayRef}
            className={`absolute left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden
                ${isCompact ? 'top-full mt-2' : 'top-full mt-3'}
            `}
            style={{
                animation: 'searchOverlayIn 0.2s ease-out',
                maxHeight: '70vh',
                overflowY: 'auto',
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
                    <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-gray-500 text-xs font-medium mr-2">Tìm kiếm theo:</span>
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
                                {history.map((keyword, i) => (
                                    <div
                                        key={`${keyword}-${i}`}
                                        onClick={() => handleKeywordClick(keyword)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors"
                                    >
                                        <FaClock className="text-gray-300 group-hover:text-gray-400 shrink-0" size={12} />
                                        <span className="flex-1 text-sm text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                                            {keyword}
                                        </span>
                                        <button
                                            onClick={(e) => handleRemoveKeyword(e, keyword)}
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
                                        onClick={() => handleJobClick(job)}
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
