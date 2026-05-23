import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaTimes, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import announcementService from "../../services/announcementService";
import { storage } from "../../utils/storage";

/**
 * SystemAnnouncementModal — load announcement từ BE theo route hiện tại,
 * hiển thị modal (blocking/dismissible) hoặc banner.
 *
 * Mount 1 lần ở App root để theo dõi route change.
 */
const SystemAnnouncementModal = () => {
  const location = useLocation();
  const [announcement, setAnnouncement] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const token = storage.getToken();
    if (!token) return; // chưa login → không check

    (async () => {
      try {
        const list = await announcementService.getActive(location.pathname);
        if (active && Array.isArray(list) && list.length > 0) {
          setAnnouncement(list[0]);
          setAcknowledged(false);
        } else if (active) {
          setAnnouncement(null);
        }
      } catch {
        if (active) setAnnouncement(null);
      }
    })();

    return () => { active = false; };
  }, [location.pathname]);

  const handleAck = async () => {
    if (!announcement) return;
    if (announcement.requireAcknowledge && !acknowledged) return;
    setSubmitting(true);
    try {
      await announcementService.ack(announcement.id);
      setAnnouncement(null);
    } catch {
      // silent — nếu fail thì user vẫn đóng được tạm thời
      setAnnouncement(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (!announcement) return null;

  const isBlocking = announcement.displayMode === "MODAL_BLOCKING";
  const isBanner = announcement.displayMode === "BANNER";

  // ── BANNER variant ──
  if (isBanner) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-[#3AB4E6] to-[#1967D2] text-white px-4 py-2.5 shadow-lg animate-fade-in">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FaInfoCircle className="shrink-0" />
            <div className="text-sm truncate">
              <span className="font-bold">{announcement.title}</span>
              {announcement.bodyHtml && (
                <span
                  className="ml-2 opacity-90"
                  dangerouslySetInnerHTML={{ __html: stripHtml(announcement.bodyHtml).slice(0, 120) }}
                />
              )}
            </div>
          </div>
          <button
            onClick={handleAck}
            disabled={submitting}
            className="shrink-0 text-white/80 hover:text-white p-1 disabled:opacity-50"
            aria-label="Đóng thông báo"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    );
  }

  // ── MODAL variant (blocking hoặc dismissible) ──
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={isBlocking ? undefined : handleAck}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với image hoặc gradient */}
        {announcement.imageUrl ? (
          <div className="h-40 bg-gray-100 overflow-hidden">
            <img
              src={announcement.imageUrl}
              alt={announcement.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-3 bg-gradient-to-r from-[#3AB4E6] to-[#1967D2]" />
        )}

        <div className="p-6 overflow-y-auto flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {announcement.title}
          </h2>

          {announcement.bodyHtml && (
            <div
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: announcement.bodyHtml }}
            />
          )}

          {announcement.requireAcknowledge && (
            <label className="mt-6 flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#3AB4E6]"
              />
              <span className="text-sm text-gray-700">
                Tôi đã đọc và đồng ý với các nội dung trên.
              </span>
            </label>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          {!isBlocking && (
            <button
              onClick={handleAck}
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition disabled:opacity-50"
            >
              Để sau
            </button>
          )}
          <button
            onClick={handleAck}
            disabled={
              submitting ||
              (announcement.requireAcknowledge && !acknowledged)
            }
            className="px-6 py-2.5 bg-[#3AB4E6] hover:bg-[#2A9DCB] text-white font-bold rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FaCheckCircle />
            {submitting ? "Đang lưu..." : announcement.requireAcknowledge ? "Đồng ý & tiếp tục" : "Đã hiểu"}
          </button>
        </div>
      </div>
    </div>
  );
};

const stripHtml = (html) => {
  if (typeof window === "undefined") return html;
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  return doc.body.textContent || "";
};

export default SystemAnnouncementModal;
