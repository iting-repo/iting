import React, { useState } from 'react';
import { FaTimes, FaFileSignature } from 'react-icons/fa';
import { toast } from 'sonner';
import offerService from '../../services/offerService';

/**
 * Modal HR gửi offer cho 1 application.
 *
 * @param {{
 *   open: boolean,
 *   applyFormId: number,
 *   jobId: number,
 *   defaultPosition?: string,
 *   candidateName?: string,
 *   onClose: () => void,
 *   onSent?: (offer) => void,
 * }} props
 */
const SendOfferModal = ({ open, applyFormId, jobId, defaultPosition, candidateName, onClose, onSent }) => {
   const [position, setPosition] = useState(defaultPosition || '');
   const [salaryAmount, setSalaryAmount] = useState('');
   const [salaryType, setSalaryType] = useState('MONTH');
   const [startDate, setStartDate] = useState('');
   const [expiresAt, setExpiresAt] = useState(() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      d.setHours(23, 59);
      return d.toISOString().slice(0, 16);
   });
   const [notes, setNotes] = useState('');
   const [submitting, setSubmitting] = useState(false);

   if (!open) return null;

   const handleSubmit = async () => {
      if (!position.trim()) {
         toast.error('Vui lòng nhập chức danh.');
         return;
      }
      if (!expiresAt) {
         toast.error('Vui lòng chọn hạn phản hồi.');
         return;
      }
      try {
         setSubmitting(true);
         const payload = {
            applyFormId,
            jobId,
            position: position.trim(),
            salaryAmount: salaryAmount ? Number(salaryAmount) : undefined,
            salaryCurrency: 'VND',
            salaryType,
            startDate: startDate || undefined,
            expiresAt: new Date(expiresAt).toISOString(),
            notes: notes.trim() || undefined,
         };
         const offer = await offerService.create(payload);
         toast.success('Đã gửi offer cho ứng viên.');
         onSent?.(offer);
         onClose();
      } catch (err) {
         console.error('create offer failed:', err);
         toast.error(err?.response?.data?.message || err?.response?.data?.error || 'Không gửi được offer.');
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
               <div className="flex items-center gap-2">
                  <FaFileSignature className="text-[#3AB4E6]" />
                  <h3 className="font-bold text-gray-800">Gửi offer cho {candidateName || 'ứng viên'}</h3>
               </div>
               <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <FaTimes />
               </button>
            </div>

            <div className="p-5 space-y-4">
               <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                     Chức danh chính thức <span className="text-red-500">*</span>
                  </label>
                  <input
                     type="text"
                     value={position}
                     onChange={(e) => setPosition(e.target.value)}
                     placeholder="VD: Senior Java Developer"
                     className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#3AB4E6]"
                  />
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Mức lương (VND)
                     </label>
                     <input
                        type="number"
                        value={salaryAmount}
                        onChange={(e) => setSalaryAmount(e.target.value)}
                        placeholder="20000000"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#3AB4E6]"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Kỳ trả
                     </label>
                     <select
                        value={salaryType}
                        onChange={(e) => setSalaryType(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#3AB4E6]"
                     >
                        <option value="MONTH">Hàng tháng</option>
                        <option value="YEAR">Hàng năm</option>
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Ngày bắt đầu
                     </label>
                     <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#3AB4E6]"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Hạn phản hồi <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#3AB4E6]"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                     Ghi chú (tuỳ chọn)
                  </label>
                  <textarea
                     value={notes}
                     onChange={(e) => setNotes(e.target.value)}
                     rows={4}
                     placeholder="Phúc lợi, điều khoản đặc biệt, lịch onboarding…"
                     className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#3AB4E6] resize-none"
                  />
               </div>

               <p className="text-xs text-gray-500 leading-relaxed bg-amber-50 border border-amber-100 rounded-lg p-3">
                  Sau khi gửi, hệ thống sẽ tự động tạo PDF offer letter, gửi email và thông báo tới ứng viên.
                  Pipeline của application sẽ chuyển sang <strong>OFFER</strong>.
               </p>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50/50">
               <button
                  onClick={onClose}
                  disabled={submitting}
                  className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
               >
                  Huỷ
               </button>
               <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 bg-[#3AB4E6] hover:bg-[#2A9DCB] text-white text-sm font-bold rounded-lg shadow-md shadow-blue-500/20 disabled:opacity-50"
               >
                  {submitting ? 'Đang gửi…' : 'Gửi offer'}
               </button>
            </div>
         </div>
      </div>
   );
};

export default SendOfferModal;
