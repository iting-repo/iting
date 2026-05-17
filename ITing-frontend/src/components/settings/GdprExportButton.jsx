import React, { useState } from 'react';
import { toast } from 'sonner';
import { FaDownload, FaShieldAlt } from 'react-icons/fa';
import meService from '../../services/meService';

/**
 * GDPR / Nghị định 13 — 1-click download of all personal data as JSON.
 * Renders as a settings-row card with explanation.
 */
const GdprExportButton = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await meService.downloadDataExport();
      toast.success('Đã tải xuống dữ liệu của bạn');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Lỗi tải dữ liệu');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 ring-1 ring-slate-200 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <FaShieldAlt className="w-6 h-6 text-blue-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 mb-1">Tải dữ liệu cá nhân của bạn</h3>
          <p className="text-sm text-slate-600 mb-3">
            Theo Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân, bạn có quyền
            truy cập và sao chép toàn bộ dữ liệu cá nhân ITing đang lưu trữ.
            File JSON sẽ bao gồm: thông tin tài khoản, danh sách job đã lưu, follow,
            lịch sử tìm kiếm, tương tác, HR affiliations.
          </p>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium disabled:opacity-60"
          >
            <FaDownload /> {downloading ? 'Đang tải...' : 'Tải dữ liệu (JSON)'}
          </button>
          <p className="text-xs text-slate-400 mt-2">
            Để yêu cầu <strong>xóa toàn bộ</strong> tài khoản, vui lòng gửi email đến{' '}
            <a href="mailto:support@iting.vn" className="text-blue-600 underline">support@iting.vn</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GdprExportButton;
