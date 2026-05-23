import React, { useEffect, useState } from 'react';
import { FaFileSignature, FaCheck, FaTimes, FaFilePdf, FaBuilding, FaBriefcase, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import { toast } from 'sonner';
import offerService from '../../services/offerService';

const STATUS_LABEL = {
   SENT:     { label: 'Đang chờ phản hồi', color: 'bg-amber-50 text-amber-700 border-amber-200' },
   ACCEPTED: { label: 'Đã chấp nhận',      color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
   DECLINED: { label: 'Đã từ chối',        color: 'bg-red-50 text-red-700 border-red-200' },
   REVOKED:  { label: 'Đã thu hồi',        color: 'bg-gray-100 text-gray-600 border-gray-200' },
   EXPIRED:  { label: 'Quá hạn',           color: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const formatSalary = (amount, currency, type) => {
   if (!amount) return null;
   const num = new Intl.NumberFormat('vi-VN').format(amount);
   return `${num} ${currency || 'VND'} / ${type === 'YEAR' ? 'năm' : 'tháng'}`;
};

const CandidateOffers = () => {
   const [offers, setOffers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [actingId, setActingId] = useState(null);
   const [declineTarget, setDeclineTarget] = useState(null);
   const [declineReason, setDeclineReason] = useState('');

   const fetchOffers = async () => {
      try {
         setLoading(true);
         const data = await offerService.listMyOffers();
         setOffers(Array.isArray(data) ? data : []);
      } catch (err) {
         console.error('Failed to load offers:', err);
         toast.error('Không tải được danh sách offer.');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchOffers();
   }, []);

   const handleAccept = async (offerId) => {
      try {
         setActingId(offerId);
         await offerService.accept(offerId);
         toast.success('Đã chấp nhận offer. Chúc bạn thành công với công việc mới!');
         fetchOffers();
      } catch (err) {
         toast.error(err?.response?.data?.message || err?.response?.data?.error || 'Không xử lý được.');
      } finally {
         setActingId(null);
      }
   };

   const handleDecline = async () => {
      if (!declineTarget) return;
      try {
         setActingId(declineTarget);
         await offerService.decline(declineTarget, declineReason.trim() || undefined);
         toast.success('Đã từ chối offer.');
         setDeclineTarget(null);
         setDeclineReason('');
         fetchOffers();
      } catch (err) {
         toast.error(err?.response?.data?.message || err?.response?.data?.error || 'Không xử lý được.');
      } finally {
         setActingId(null);
      }
   };

   const handleViewPdf = async (offerId) => {
      try {
         const res = await offerService.viewPdfAsCandidate(offerId);
         if (res?.url) window.open(res.url, '_blank', 'noopener');
         else toast.error('Offer chưa có file PDF.');
      } catch (err) {
         toast.error(err?.response?.data?.message || 'Không mở được file PDF.');
      }
   };

   return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 min-h-screen">
         <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#3AB4E6]/10 flex items-center justify-center text-[#3AB4E6]">
               <FaFileSignature className="text-lg" />
            </div>
            <div>
               <h1 className="text-xl font-bold text-gray-800">Thư mời nhận việc (Offer Letter)</h1>
               <p className="text-xs text-gray-500">Danh sách offer bạn đã nhận từ các nhà tuyển dụng.</p>
            </div>
         </div>

         {loading ? (
            <div className="space-y-4">
               {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-44 bg-gray-50 border border-gray-100 rounded-xl animate-pulse" />
               ))}
            </div>
         ) : offers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
               <div className="w-14 h-14 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-3">
                  <FaFileSignature className="text-xl" />
               </div>
               <p className="text-gray-500 text-sm">Bạn chưa nhận được offer nào.</p>
            </div>
         ) : (
            <div className="space-y-4">
               {offers.map((o) => {
                  const meta = STATUS_LABEL[o.status] || STATUS_LABEL.SENT;
                  const isActive = o.status === 'SENT';
                  const expired = new Date(o.expiresAt) < new Date();

                  return (
                     <div key={o.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                           <div className="flex items-center gap-3">
                              {o.companyLogo ? (
                                 <img src={o.companyLogo} alt="" className="w-12 h-12 rounded-lg object-contain bg-gray-50 border border-gray-100 p-1" />
                              ) : (
                                 <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                    <FaBuilding />
                                 </div>
                              )}
                              <div>
                                 <h3 className="font-bold text-gray-800">{o.position}</h3>
                                 <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                    <FaBriefcase className="text-gray-400" size={10} />
                                    {o.jobTitle || '—'} · {o.companyName || 'Nhà tuyển dụng'}
                                 </p>
                              </div>
                           </div>
                           <span className={`px-3 py-1 rounded-full text-xs font-bold border ${meta.color}`}>
                              {meta.label}
                           </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600 my-4">
                           {o.salaryAmount && (
                              <div className="flex items-center gap-2">
                                 <FaMoneyBillWave className="text-emerald-500" />
                                 <span className="font-semibold text-gray-800">{formatSalary(o.salaryAmount, o.salaryCurrency, o.salaryType)}</span>
                              </div>
                           )}
                           {o.startDate && (
                              <div className="flex items-center gap-2">
                                 <FaCalendarAlt className="text-sky-500" />
                                 <span>Bắt đầu: <strong>{new Date(o.startDate).toLocaleDateString('vi-VN')}</strong></span>
                              </div>
                           )}
                           <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-amber-500" />
                              <span>Hạn phản hồi: <strong>{new Date(o.expiresAt).toLocaleString('vi-VN')}</strong></span>
                           </div>
                        </div>

                        {o.notes && (
                           <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                              {o.notes}
                           </div>
                        )}

                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                           <button
                              onClick={() => handleViewPdf(o.id)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                           >
                              <FaFilePdf className="text-red-500" /> Xem PDF
                           </button>

                           {isActive && !expired ? (
                              <div className="flex gap-2">
                                 <button
                                    onClick={() => setDeclineTarget(o.id)}
                                    disabled={actingId === o.id}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 disabled:opacity-50"
                                 >
                                    <FaTimes /> Từ chối
                                 </button>
                                 <button
                                    onClick={() => handleAccept(o.id)}
                                    disabled={actingId === o.id}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                                 >
                                    <FaCheck /> {actingId === o.id ? 'Đang xử lý…' : 'Chấp nhận'}
                                 </button>
                              </div>
                           ) : (
                              <span className="text-xs text-gray-400 italic">Không thể phản hồi</span>
                           )}
                        </div>

                        {o.candidateResponseNote && (
                           <p className="text-xs text-gray-500 italic mt-3">
                              Lý do bạn đã ghi: <span className="text-gray-700">{o.candidateResponseNote}</span>
                           </p>
                        )}
                     </div>
                  );
               })}
            </div>
         )}

         {/* Decline modal */}
         {declineTarget && (
            <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                  <div className="p-5 border-b border-gray-100">
                     <h3 className="font-bold text-gray-800">Từ chối offer</h3>
                     <p className="text-xs text-gray-500 mt-1">Hành động này không thể hoàn tác.</p>
                  </div>
                  <div className="p-5">
                     <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Lý do (tuỳ chọn)
                     </label>
                     <textarea
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        rows={3}
                        placeholder="Cảm ơn công ty, nhưng tôi đã nhận một offer khác…"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#3AB4E6] resize-none"
                     />
                  </div>
                  <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50/50">
                     <button
                        onClick={() => { setDeclineTarget(null); setDeclineReason(''); }}
                        disabled={actingId === declineTarget}
                        className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                     >
                        Huỷ
                     </button>
                     <button
                        onClick={handleDecline}
                        disabled={actingId === declineTarget}
                        className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg disabled:opacity-50"
                     >
                        {actingId === declineTarget ? 'Đang gửi…' : 'Xác nhận từ chối'}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default CandidateOffers;
