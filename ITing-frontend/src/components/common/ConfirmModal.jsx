import React from "react";
import { FaExclamationTriangle, FaTrash, FaCheck } from "react-icons/fa";

/**
 * Reusable confirmation modal to replace window.confirm().
 *
 * @param {boolean}  isOpen        - Whether the modal is visible
 * @param {function} onClose       - Called when the user cancels
 * @param {function} onConfirm     - Called when the user confirms
 * @param {string}   title         - Modal title
 * @param {string|React.ReactNode} message - Main message body
 * @param {string}   [warning]     - Optional warning text (displayed in red box)
 * @param {string}   [confirmText] - Text for the confirm button (default: "Xác nhận")
 * @param {string}   [cancelText]  - Text for the cancel button  (default: "Hủy bỏ")
 * @param {"danger"|"warning"|"info"} [variant] - Color scheme (default: "danger")
 * @param {boolean}  [loading]     - Show loading state on confirm button
 * @param {React.ReactNode} [icon] - Custom icon override
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  warning,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "danger",
  loading = false,
  icon,
}) => {
  if (!isOpen) return null;

  const variants = {
    danger: {
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      btnBg: "bg-red-500 hover:bg-red-600",
      warningBg: "bg-red-50 border-red-100 text-red-600",
      defaultIcon: <FaExclamationTriangle className="text-2xl" />,
    },
    warning: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
      btnBg: "bg-amber-500 hover:bg-amber-600",
      warningBg: "bg-amber-50 border-amber-100 text-amber-700",
      defaultIcon: <FaExclamationTriangle className="text-2xl" />,
    },
    info: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      btnBg: "bg-[#3AB4E6] hover:bg-[#2da0cf]",
      warningBg: "bg-blue-50 border-blue-100 text-blue-600",
      defaultIcon: <FaCheck className="text-2xl" />,
    },
  };

  const v = variants[variant] || variants.danger;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Body */}
        <div className="p-6 text-center">
          <div
            className={`w-14 h-14 ${v.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            <span className={v.iconColor}>{icon || v.defaultIcon}</span>
          </div>
          <h3 className="text-lg font-black text-gray-800 mb-2">{title}</h3>
          <div className="text-sm text-gray-500 leading-relaxed">{message}</div>
          {warning && (
            <div
              className={`mt-3 border rounded-lg p-3 text-xs font-medium ${v.warningBg}`}
            >
              ⚠️ {warning}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-60 inline-flex items-center justify-center gap-2 ${v.btnBg}`}
          >
            {loading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
