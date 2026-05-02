import React from "react";
import { useModalEscape } from "../../hooks/useModalEscape";
import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy bỏ",
  type = "danger",
}) => {
  useModalEscape(onClose);

  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      btnColor: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50",
      btnColor: "bg-amber-600 hover:bg-amber-700",
    },
    info: {
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      btnColor: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const config = typeConfig[type] || typeConfig.danger;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${config.bgColor} ${config.iconColor} flex-shrink-0`}>
              <FaExclamationTriangle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-white transition-all active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl ${config.btnColor} text-white text-sm font-bold shadow-lg transition-all active:scale-95`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
