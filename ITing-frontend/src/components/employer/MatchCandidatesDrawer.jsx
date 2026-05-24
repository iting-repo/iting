import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaTimes, FaMagic, FaCoins, FaUser, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";
import { employerCandidateService } from "../../services/employerCandidateService";
import ReviewCandidateModal from "./ReviewCandidateModal";

/**
 * Drawer slide-in từ phải hiển thị candidates đã match với 1 job cụ thể.
 * Mỗi lần mở (jobId mới) gọi POST /hr/candidates/match-by-job/{jobId} → backend
 * trừ 5 credits + chạy AI embedding similarity.
 *
 * Props:
 *  - isOpen, onClose
 *  - jobId, jobTitle (hiển thị header)
 *  - onCreditsConsumed (optional callback để parent refresh credit badge)
 */
const PAGE_SIZE = 10;
const CREDIT_COST = 5;

const MatchCandidatesDrawer = ({ isOpen, jobId, jobTitle, onClose, onCreditsConsumed }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(0);
    const [viewCandidate, setViewCandidate] = useState(null);
    // null = chưa confirm, false = đã từ chối (đóng drawer), true = đã confirm + search
    const [confirmed, setConfirmed] = useState(null);

    const load = useCallback(async (currentPage) => {
        if (!jobId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await employerCandidateService.matchByJob(jobId, { page: currentPage, size: PAGE_SIZE });
            const body = res?.data || res;
            setCandidates(body?.content || []);
            setTotalElements(body?.totalElements ?? 0);
            // Báo parent để refresh credit balance
            if (onCreditsConsumed) onCreditsConsumed();
            // Bắn event global để Header refresh badge
            window.dispatchEvent(new Event("credit-refresh"));
        } catch (e) {
            // axiosInstance interceptor reject với plain `error.response.data` —
            // không có .response.status. Phải đọc field code/error trực tiếp.
            const code = e?.code;
            const msg = e?.error || e?.message;
            if (code === "INSUFFICIENT_CREDITS" || /credit/i.test(msg || "")) {
                setError({ kind: "insufficient", message: msg || "Không đủ credits" });
            } else if (/không có quyền|forbidden/i.test(msg || "")) {
                setError({ kind: "forbidden", message: msg });
            } else if (/không tồn tại|not found/i.test(msg || "")) {
                setError({ kind: "notfound", message: msg });
            } else {
                setError({ kind: "unknown", message: msg || "Có lỗi xảy ra" });
            }
        } finally {
            setLoading(false);
        }
    }, [jobId, onCreditsConsumed]);

    // Mỗi lần mở drawer với jobId mới → reset về confirm state, KHÔNG auto-search
    useEffect(() => {
        if (isOpen && jobId) {
            setPage(0);
            setConfirmed(null);
            setCandidates([]);
            setError(null);
            setTotalElements(0);
        }
        if (!isOpen) {
            // Clear state khi đóng để lần mở sau không nhấp nháy data cũ
            setCandidates([]);
            setError(null);
            setTotalElements(0);
            setConfirmed(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, jobId]);

    // Sau khi user confirm → mới gọi API trừ credits + search
    useEffect(() => {
        if (isOpen && confirmed === true && jobId) {
            load(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, confirmed, jobId]);

    // Body scroll lock khi drawer mở
    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [isOpen]);

    const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

    const goToPage = (next) => {
        const clamped = Math.max(0, Math.min(next, totalPages - 1));
        setPage(clamped);
        load(clamped);
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm transition-opacity ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <aside
                className={`fixed right-0 top-0 z-[111] h-full w-full max-w-2xl bg-[#F5F7FA] shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between shadow-sm">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FaMagic className="text-[#3AB4E6]" /> Ứng viên phù hợp
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{jobTitle || "Job"}</p>
                    </div>
                    <button onClick={onClose} className="ml-3 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600">
                        <FaTimes />
                    </button>
                </div>

                {confirmed === true && (
                    <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-700">
                        <FaCoins /> Đã trừ <strong>{CREDIT_COST} credits</strong> cho lần tìm kiếm này. Chỉ hiện ứng viên đang tìm việc.
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {/* Confirm screen — hiển thị trước khi search */}
                    {confirmed === null && (
                        <div className="max-w-md mx-auto py-8 text-center">
                            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                <FaMagic className="text-3xl text-indigo-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận tìm ứng viên AI</h3>
                            <p className="text-sm text-gray-600 mb-1">Job:</p>
                            <p className="text-base font-semibold text-gray-800 mb-6 line-clamp-2">{jobTitle || `Job #${jobId}`}</p>

                            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6 text-left">
                                <div className="flex items-center gap-2 text-amber-700 font-bold mb-2">
                                    <FaCoins /> Phí: {CREDIT_COST} credits
                                </div>
                                <ul className="text-xs text-amber-700/80 space-y-1 list-disc list-inside">
                                    <li>AI sẽ dùng embedding của job để match với CV của các ứng viên <strong>đang tìm việc</strong></li>
                                    <li>Kết quả sắp xếp theo độ phù hợp, kèm lý do match</li>
                                    <li>Credit được trừ ngay khi bấm xác nhận, không hoàn lại</li>
                                </ul>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm"
                                >Hủy</button>
                                <button
                                    onClick={() => setConfirmed(true)}
                                    className="flex-[1.4] py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                                >
                                    <FaMagic /> Xác nhận, trừ {CREDIT_COST} credits
                                </button>
                            </div>
                        </div>
                    )}

                    {confirmed === true && loading && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <FaSpinner className="text-3xl animate-spin text-[#3AB4E6] mb-3" />
                            <p>AI đang phân tích {jobTitle ? `"${jobTitle}"` : "job"}...</p>
                        </div>
                    )}

                    {confirmed === true && !loading && error && (
                        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
                            {error.kind === "insufficient" ? (
                                <>
                                    <FaCoins className="mx-auto text-3xl text-amber-500 mb-3" />
                                    <h3 className="font-bold text-gray-900 mb-1">Không đủ credits</h3>
                                    <p className="text-sm text-gray-600 mb-4">{error.message}</p>
                                    <Link
                                        to="/employer/subscriptions"
                                        onClick={onClose}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3AB4E6] hover:bg-[#2A9DCB] text-white rounded-lg font-semibold text-sm"
                                    >
                                        Nâng cấp gói / Nạp credits
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <p className="text-red-700 font-semibold mb-2">{error.message}</p>
                                    <button
                                        onClick={() => load(page)}
                                        className="text-sm text-blue-600 hover:underline"
                                    >Thử lại</button>
                                </>
                            )}
                        </div>
                    )}

                    {confirmed === true && !loading && !error && candidates.length === 0 && (
                        <div className="text-center py-16 text-gray-500">
                            <FaUser className="mx-auto text-4xl text-gray-300 mb-3" />
                            <p className="font-semibold mb-1">Chưa tìm thấy ứng viên phù hợp</p>
                            <p className="text-sm">Thử chỉnh skill / level / địa điểm trong job rồi match lại.</p>
                        </div>
                    )}

                    {confirmed === true && !loading && !error && candidates.length > 0 && (
                        <>
                            <p className="text-sm text-gray-500 mb-4">
                                Tìm thấy <strong className="text-gray-900">{totalElements}</strong> ứng viên đang tìm việc, ranked theo độ match.
                            </p>
                            <div className="space-y-3">
                                {candidates.map((c, idx) => (
                                    <CandidateCard
                                        key={c.id}
                                        candidate={c}
                                        rank={page * PAGE_SIZE + idx + 1}
                                        onView={() => setViewCandidate(c)}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    <button
                                        onClick={() => goToPage(page - 1)}
                                        disabled={page <= 0}
                                        className="w-9 h-9 rounded-lg bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50 flex items-center justify-center"
                                    ><FaChevronLeft size={12} /></button>
                                    <span className="text-sm text-gray-600 px-3">
                                        Trang {page + 1} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => goToPage(page + 1)}
                                        disabled={page >= totalPages - 1}
                                        className="w-9 h-9 rounded-lg bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50 flex items-center justify-center"
                                    ><FaChevronRight size={12} /></button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </aside>

            {/* Candidate detail modal — same pattern as FindCandidate */}
            <ReviewCandidateModal
                candidate={viewCandidate}
                onClose={() => setViewCandidate(null)}
            />

        </>
    );
};

const matchPercent = (score) => {
    if (!score && score !== 0) return null;
    // score có thể > 1 (do bonus). Cap về 100%.
    const pct = Math.min(Math.max(score, 0), 1) * 100;
    return Math.round(pct);
};

const CandidateCard = ({ candidate, rank, onView }) => {
    const pct = matchPercent(candidate.score);
    return (
        <button
            type="button"
            onClick={onView}
            className="w-full text-left bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-md transition-all"
        >
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#3AB4E6] flex-shrink-0">
                    <FaUser size={20} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-gray-900 truncate">
                            <span className="text-gray-400 mr-1">#{rank}</span> {candidate.name || "Ẩn danh"}
                        </h4>
                        {pct !== null && (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${pct >= 70 ? "bg-emerald-100 text-emerald-700" : pct >= 40 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                                {pct}% match
                            </span>
                        )}
                    </div>
                    {candidate.title && (
                        <p className="text-sm text-gray-600 truncate mt-0.5 flex items-center gap-1.5">
                            <FaBriefcase className="text-gray-400" size={12} /> {candidate.title}
                        </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
                        {candidate.location && (
                            <span className="flex items-center gap-1"><FaMapMarkerAlt size={10} /> {candidate.location}</span>
                        )}
                        {candidate.experience >= 0 && (
                            <span>{candidate.experience} năm KN</span>
                        )}
                        {candidate.degree && (
                            <span className="flex items-center gap-1"><FaGraduationCap size={10} /> {candidate.degree}</span>
                        )}
                    </div>
                    {candidate.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {candidate.skills.slice(0, 5).map((s) => (
                                <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] rounded-md font-medium">{s}</span>
                            ))}
                            {candidate.skills.length > 5 && (
                                <span className="text-[11px] text-gray-400">+{candidate.skills.length - 5}</span>
                            )}
                        </div>
                    )}
                    {candidate.matchReasons?.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-50">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Lý do match</p>
                            <div className="flex flex-wrap gap-1">
                                {candidate.matchReasons.map((r, i) => (
                                    <span key={i} className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded">{r}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
};

export default MatchCandidatesDrawer;
