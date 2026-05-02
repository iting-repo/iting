import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";

const SIZE_MAP = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-5xl",
    "2xl": "max-w-6xl",
};

const AppModal = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    size = "lg",
    closeOnOverlay = true,
    closeOnEsc = true,
    topOffsetClass = "pt-16 md:pt-24",
    bodyClassName = "",
    panelClassName = "",
    hideCloseButton = false,
}) => {
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (e) => {
            if (closeOnEsc && e.key === "Escape") {
                onClose?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, closeOnEsc, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="flex min-h-full items-center justify-center p-4 md:p-6">
                <div
                    role="dialog"
                    aria-modal="true"
                    className={`w-full ${SIZE_MAP[size] || SIZE_MAP.lg} max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${panelClassName}`}
                >
                    <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                {title ? (
                                    <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                                        {title}
                                    </h3>
                                ) : null}
                                {subtitle ? (
                                    <p className="mt-1 text-sm text-gray-500">
                                        {subtitle}
                                    </p>
                                ) : null}
                            </div>

                            {!hideCloseButton && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={`min-h-0 flex-1 overflow-y-auto px-6 py-6 ${bodyClassName}`}>
                        {children}
                    </div>

                    {footer ? (
                        <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
                            {footer}
                        </div>
                    ) : null}
                </div>
            </div>

            {closeOnOverlay && (
                <button
                    type="button"
                    aria-label="Close modal overlay"
                    className="absolute inset-0 -z-10 cursor-default"
                    onClick={onClose}
                />
            )}
        </div>,
        document.body
    );
};

export default AppModal;