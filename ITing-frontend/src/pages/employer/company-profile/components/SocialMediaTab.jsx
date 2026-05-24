import React, { useEffect, useMemo, useState } from 'react';
import {
   FaPlusCircle,
   FaTimes,
   FaFacebook,
   FaTwitter,
   FaLinkedin,
   FaYoutube,
   FaInstagram,
   FaTiktok,
   FaGlobe,
   FaSpinner,
   FaExternalLinkAlt,
} from 'react-icons/fa';
import { toast } from 'sonner';
import companyService from '../../../../services/companyService';

const PLATFORMS = [
   { value: 'FACEBOOK', label: 'Facebook' },
   { value: 'INSTAGRAM', label: 'Instagram' },
   { value: 'YOUTUBE', label: 'Youtube' },
   { value: 'TWITTER', label: 'Twitter / X' },
   { value: 'LINKEDIN', label: 'LinkedIn' },
   { value: 'TIKTOK', label: 'TikTok' },
   { value: 'OTHER', label: 'Khác' },
];

const MAX_LINKS = 10;
const URL_REGEX = /^(https?:\/\/).+/i;

let nextLocalId = 0;
const newLinkRow = (platform = 'FACEBOOK') => ({
   _localId: ++nextLocalId,
   platform,
   url: '',
});

const getIcon = (platform) => {
   switch (platform) {
      case 'FACEBOOK':
         return <FaFacebook className="text-blue-600" />;
      case 'INSTAGRAM':
         return <FaInstagram className="text-pink-600" />;
      case 'YOUTUBE':
         return <FaYoutube className="text-red-600" />;
      case 'TWITTER':
         return <FaTwitter className="text-sky-400" />;
      case 'LINKEDIN':
         return <FaLinkedin className="text-blue-700" />;
      case 'TIKTOK':
         return <FaTiktok className="text-gray-900" />;
      default:
         return <FaGlobe className="text-gray-400" />;
   }
};

const SocialMediaTab = () => {
   const [socials, setSocials] = useState([]);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [errors, setErrors] = useState({}); // { _localId: string }
   const [initialSnapshot, setInitialSnapshot] = useState('');

   // Load từ API
   useEffect(() => {
      let cancelled = false;
      const load = async () => {
         try {
            setLoading(true);
            const res = await companyService.getMySocialLinks();
            const list = Array.isArray(res) ? res : (res?.data || []);
            const rows = list.map((l) => ({
               _localId: ++nextLocalId,
               platform: (l.platform || 'OTHER').toUpperCase(),
               url: l.url || '',
            }));
            // Nếu chưa có gì → gợi ý 3 platform phổ biến (chưa save)
            const initial = rows.length > 0
               ? rows
               : [
                    newLinkRow('FACEBOOK'),
                    newLinkRow('INSTAGRAM'),
                    newLinkRow('YOUTUBE'),
                 ];
            if (!cancelled) {
               setSocials(initial);
               setInitialSnapshot(JSON.stringify(rows));
            }
         } catch (err) {
            console.error('Load social links error:', err);
            if (!cancelled) {
               toast.error('Không tải được mạng xã hội. Vui lòng thử lại.');
               setSocials([
                  newLinkRow('FACEBOOK'),
                  newLinkRow('INSTAGRAM'),
                  newLinkRow('YOUTUBE'),
               ]);
            }
         } finally {
            if (!cancelled) setLoading(false);
         }
      };
      load();
      return () => { cancelled = true; };
   }, []);

   const updateRow = (localId, patch) => {
      setSocials((prev) => prev.map((r) => r._localId === localId ? { ...r, ...patch } : r));
      // Clear lỗi của row đó khi user sửa
      setErrors((prev) => {
         if (!prev[localId]) return prev;
         const next = { ...prev };
         delete next[localId];
         return next;
      });
   };

   const addSocial = () => {
      if (socials.length >= MAX_LINKS) {
         toast.error(`Tối đa ${MAX_LINKS} liên kết.`);
         return;
      }
      setSocials((prev) => [...prev, newLinkRow('FACEBOOK')]);
   };

   const removeSocial = (localId) => {
      setSocials((prev) => prev.filter((r) => r._localId !== localId));
      setErrors((prev) => {
         const next = { ...prev };
         delete next[localId];
         return next;
      });
   };

   // Validation: bỏ qua row hoàn toàn rỗng (cho phép user xoá), bắt lỗi row có URL
   // không hợp lệ hoặc duplicate platform với non-empty URL.
   const validate = () => {
      const errs = {};
      const seenPlatforms = new Map(); // platform → localId của row đầu tiên

      socials.forEach((row) => {
         const url = (row.url || '').trim();
         if (!url) return; // row rỗng → sẽ bị server bỏ qua, không lỗi

         if (!URL_REGEX.test(url)) {
            errs[row._localId] = 'URL phải bắt đầu bằng http:// hoặc https://';
            return;
         }
         if (url.length > 500) {
            errs[row._localId] = 'URL không được vượt quá 500 ký tự';
            return;
         }
         if (seenPlatforms.has(row.platform)) {
            errs[row._localId] = `Đã có link ${row.platform.toLowerCase()} ở trên — gộp về 1 link hoặc đổi platform`;
            return;
         }
         seenPlatforms.set(row.platform, row._localId);
      });

      return errs;
   };

   const handleSave = async () => {
      const errs = validate();
      if (Object.keys(errs).length > 0) {
         setErrors(errs);
         toast.error('Vui lòng kiểm tra lại các liên kết.');
         return;
      }
      setErrors({});

      // Gửi cả row có URL không rỗng — server cũng tự lọc nhưng ta gửi gọn cho cleaner
      const payload = socials
         .filter((r) => (r.url || '').trim().length > 0)
         .map((r) => ({ platform: r.platform, url: r.url.trim() }));

      try {
         setSaving(true);
         const saved = await companyService.updateMySocialLinks(payload);
         const savedList = Array.isArray(saved) ? saved : (saved?.data || []);
         // Cập nhật lại state với data từ server (có thể đã được sanitize)
         const rows = savedList.map((l) => ({
            _localId: ++nextLocalId,
            platform: (l.platform || 'OTHER').toUpperCase(),
            url: l.url || '',
         }));
         setSocials(rows.length > 0
            ? rows
            : [newLinkRow('FACEBOOK'), newLinkRow('INSTAGRAM'), newLinkRow('YOUTUBE')]);
         setInitialSnapshot(JSON.stringify(rows));
         toast.success('Đã lưu mạng xã hội.');
      } catch (err) {
         console.error('Save social links error:', err);
         toast.error(err?.response?.data?.message || 'Lưu thất bại. Vui lòng thử lại.');
      } finally {
         setSaving(false);
      }
   };

   const isDirty = useMemo(() => {
      const current = JSON.stringify(
         socials.filter((r) => (r.url || '').trim().length > 0)
            .map((r) => ({ platform: r.platform, url: r.url.trim() })),
      );
      return current !== initialSnapshot;
   }, [socials, initialSnapshot]);

   if (loading) {
      return (
         <div className="max-w-4xl flex items-center gap-3 text-gray-400 py-8">
            <FaSpinner className="animate-spin" /> Đang tải mạng xã hội...
         </div>
      );
   }

   return (
      <div className="max-w-4xl">
         <div className="space-y-6 mb-8">
            {socials.map((item, index) => {
               const err = errors[item._localId];
               const url = (item.url || '').trim();
               const previewable = URL_REGEX.test(url);
               return (
                  <div key={item._localId}>
                     <label className="block text-gray-700 text-sm font-medium mb-1">
                        Link {index + 1}
                     </label>
                     <div className="flex flex-col sm:flex-row gap-3 items-start">
                        {/* Dropdown Platform */}
                        <div className="relative w-full sm:w-44 shrink-0">
                           <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-base">
                              {getIcon(item.platform)}
                           </div>
                           <select
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6]"
                              value={item.platform}
                              onChange={(e) => updateRow(item._localId, { platform: e.target.value })}
                           >
                              {PLATFORMS.map((p) => (
                                 <option key={p.value} value={p.value}>{p.label}</option>
                              ))}
                           </select>
                        </div>

                        {/* Input URL & Actions */}
                        <div className="flex flex-row w-full gap-3">
                           <div className="flex-1">
                              <input
                                 type="url"
                                 placeholder="Dán liên kết hồ sơ tại đây..."
                                 value={item.url}
                                 onChange={(e) => updateRow(item._localId, { url: e.target.value })}
                                 className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                                    err
                                       ? 'border-red-300 focus:border-red-400 bg-red-50/30'
                                       : 'border-gray-200 focus:border-[#3AB4E6]'
                                 }`}
                              />
                              {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
                           </div>

                           {/* Preview link */}
                           {previewable && !err && (
                              <a
                                 href={url}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 title="Mở liên kết trong tab mới"
                                 className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-[#3AB4E6] transition-colors shrink-0"
                              >
                                 <FaExternalLinkAlt size={12} />
                              </a>
                           )}

                           {/* Delete */}
                           <button
                              type="button"
                              onClick={() => removeSocial(item._localId)}
                              className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-red-100 hover:text-red-500 transition-colors shrink-0"
                              title="Xóa liên kết"
                           >
                              <FaTimes />
                           </button>
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>

         {/* Add Button */}
         <button
            type="button"
            onClick={addSocial}
            disabled={socials.length >= MAX_LINKS}
            className="w-full bg-gray-50 border border-dashed border-gray-300 text-gray-600 font-medium py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
         >
            <FaPlusCircle /> Thêm trang mạng xã hội
         </button>
         <p className="text-xs text-gray-400 mb-8">
            {socials.length}/{MAX_LINKS} liên kết. Để trống URL hoặc bấm <FaTimes className="inline align-text-bottom" /> để xoá.
         </p>

         {/* Save Button */}
         <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="bg-[#1967D2] text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
         >
            {saving ? (
               <>
                  <FaSpinner className="animate-spin" /> Đang lưu...
               </>
            ) : (
               'Lưu Thay Đổi'
            )}
         </button>
      </div>
   );
};

export default SocialMediaTab;
