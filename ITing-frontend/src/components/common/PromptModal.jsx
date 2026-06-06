import React, { useEffect, useState } from "react";
import { FaPen } from "react-icons/fa";

/**
 * Modal thay thế window.prompt(). Cho phép user nhập 1 chuỗi text + xác nhận.
 *
 * @param {boolean}  isOpen
 * @param {function} onClose       - đóng modal (cancel)
 * @param {function} onSubmit      - (value) => void  khi user xác nhận
 * @param {string}   title         - tiêu đề modal
 * @param {string|React.ReactNode} message
 * @param {string}   [label]       - label trên input
 * @param {string}   [placeholder]
 * @param {string}   [defaultValue]
 * @param {string}   [confirmText] - default "Xác nhận"
 * @param {string}   [cancelText]  - default "Hủy bỏ"
 * @param {boolean}  [required]    - bắt buộc nhập (default true)
 * @param {boolean}  [multiline]   - render textarea (default false → input)
 * @param {"danger"|"warning"|"info"} [variant] - màu CTA (default "info")
 */
const PromptModal = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Nhập thông tin",
  message,
  label,
  placeholder = "",
  defaultValue = "",
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  required = true,
  multiline = false,
  variant = "info",
}) => {
  const [value, setValue] = useState(defaultValue);

  // Reset value mỗi lần mở modal mới
  useEffect(() => {
    if (isOpen) setValue(defaultValue || "");
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const variants = {
    danger: "bg-red-500 hover:bg-red-600",
    warning: "bg-amber-500 hover:bg-amber-600",
    info: "bg-[#3AB4E6] hover:bg-[#2da0cf]",
  };
  const btnCls = variants[variant] || variants.info;

  const submit = () => {
    if (required && !value.trim()) return;
    onSubmit?.(value.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center shrink-0">
              <FaPen className="text-[#3AB4E6] text-lg" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-black text-gray-800">{title}</h3>
              {message && (
                <p className="text-xs text-gray-500 mt-0.5">{message}</p>
              )}
            </div>
          </div>

          {label && (
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          )}

          {multiline ? (
            <textarea
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 resize-none"
            />
          ) : (
            <input
              autoFocus
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder={placeholder}
              className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-400"
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={submit}
            disabled={required && !value.trim()}
            className={`flex-1 py-2.5 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed ${btnCls}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
