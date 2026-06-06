import { useState, useCallback } from "react";

/**
 * Hook thay thế window.prompt(). Trả về [state, askPrompt, resetPrompt].
 *
 * Usage:
 *   const [prompt, askPrompt, resetPrompt] = usePrompt();
 *   askPrompt({ title, message, label, placeholder, onSubmit: (val) => {...} });
 *   // JSX: <PromptModal isOpen={prompt.isOpen} {...prompt} onClose={resetPrompt} />
 */
const usePrompt = () => {
  const [state, setState] = useState({
    isOpen: false,
    title: "",
    message: "",
    label: "",
    placeholder: "",
    defaultValue: "",
    confirmText: "Xác nhận",
    cancelText: "Hủy bỏ",
    required: true,
    multiline: false,
    variant: "info",
    onSubmit: null,
  });

  const ask = useCallback((opts) => {
    setState({
      isOpen: true,
      title: opts.title || "Nhập thông tin",
      message: opts.message || "",
      label: opts.label || "",
      placeholder: opts.placeholder || "",
      defaultValue: opts.defaultValue || "",
      confirmText: opts.confirmText || "Xác nhận",
      cancelText: opts.cancelText || "Hủy bỏ",
      required: opts.required !== false,
      multiline: !!opts.multiline,
      variant: opts.variant || "info",
      onSubmit: opts.onSubmit || null,
    });
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return [state, ask, reset];
};

export default usePrompt;
