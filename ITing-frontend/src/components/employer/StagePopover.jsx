import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'sonner';
import pipelineService from '../../services/pipelineService';

export const STAGES = [
   { value: 'SCREENING',    label: 'Đơn mới',     color: 'bg-gray-100 text-gray-700 border-gray-200' },
   { value: 'PHONE_SCREEN', label: 'Đã liên hệ',  color: 'bg-sky-50 text-sky-700 border-sky-200' },
   { value: 'INTERVIEW',    label: 'Phỏng vấn',   color: 'bg-purple-50 text-purple-700 border-purple-200' },
   { value: 'OFFER',        label: 'Gửi offer',   color: 'bg-amber-50 text-amber-700 border-amber-200' },
   { value: 'HIRED',        label: 'Đã nhận',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
   { value: 'REJECTED',     label: 'Từ chối',     color: 'bg-red-50 text-red-700 border-red-200' },
];

export const stageMeta = (value) =>
   STAGES.find(s => s.value === value) || { value, label: value, color: 'bg-gray-100 text-gray-700 border-gray-200' };

/**
 * Inline stage selector — badge bấm vào → popover dropdown + textarea note + toggle email.
 *
 * @param {{
 *   applyFormId: number,
 *   jobId: number,
 *   currentStage: string,
 *   onMoved: (newStage: string) => void,
 * }} props
 */
const StagePopover = ({ applyFormId, jobId, currentStage, onMoved }) => {
   const [open, setOpen] = useState(false);
   const [selectedStage, setSelectedStage] = useState(currentStage || 'SCREENING');
   const [note, setNote] = useState('');
   const [sendEmail, setSendEmail] = useState(false);
   const [saving, setSaving] = useState(false);
   const wrapRef = useRef(null);

   useEffect(() => {
      setSelectedStage(currentStage || 'SCREENING');
   }, [currentStage]);

   // Close on outside click
   useEffect(() => {
      if (!open) return;
      const handler = (e) => {
         if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
   }, [open]);

   const meta = stageMeta(currentStage);

   const handleSave = async () => {
      if (selectedStage === currentStage && !note.trim() && !sendEmail) {
         setOpen(false);
         return;
      }
      try {
         setSaving(true);
         await pipelineService.moveStage(applyFormId, jobId, {
            toStage: selectedStage,
            note: note.trim() || undefined,
            sendEmail,
         });
         toast.success(`Đã chuyển sang "${stageMeta(selectedStage).label}".`);
         onMoved?.(selectedStage);
         setOpen(false);
         setNote('');
         setSendEmail(false);
      } catch (err) {
         console.error('moveStage failed:', err);
         toast.error(err?.response?.data?.message || err?.response?.data?.error || 'Không chuyển được giai đoạn.');
      } finally {
         setSaving(false);
      }
   };

   return (
      <div ref={wrapRef} className="relative inline-block">
         <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${meta.color} hover:ring-2 hover:ring-offset-1 hover:ring-[#3AB4E6]/40 transition-all`}
         >
            {meta.label}
            <FaChevronDown size={9} className="opacity-70" />
         </button>

         {open && (
            <div className="absolute z-50 mt-2 right-0 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 animate-fade-in">
               <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-800">Chuyển giai đoạn</p>
                  <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                     <FaTimes size={12} />
                  </button>
               </div>

               <div className="space-y-1 mb-3 max-h-56 overflow-y-auto">
                  {STAGES.map(s => (
                     <button
                        key={s.value}
                        type="button"
                        onClick={() => setSelectedStage(s.value)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                           selectedStage === s.value
                              ? `${s.color} ring-2 ring-[#3AB4E6]/40`
                              : 'border-transparent text-gray-600 hover:bg-gray-50'
                        }`}
                     >
                        <span>{s.label}</span>
                        {selectedStage === s.value && <FaCheck size={10} />}
                     </button>
                  ))}
               </div>

               <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú (tuỳ chọn)…"
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] resize-none mb-3"
               />

               <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                     type="checkbox"
                     checked={sendEmail}
                     onChange={(e) => setSendEmail(e.target.checked)}
                     className="w-4 h-4 rounded border-gray-300 text-[#3AB4E6] focus:ring-[#3AB4E6]"
                  />
                  <span className="text-xs text-gray-600 font-medium">Gửi email cho ứng viên</span>
               </label>

               <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-2 bg-[#3AB4E6] hover:bg-[#2A9DCB] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
               >
                  {saving ? 'Đang lưu…' : 'Lưu'}
               </button>
            </div>
         )}
      </div>
   );
};

export default StagePopover;
