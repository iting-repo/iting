import { useState, useCallback } from "react";

/**
 * Custom hook to replace window.confirm() with a state-based approach.
 * Returns [confirmState, requestConfirm, resetConfirm].
 *
 * Usage:
 *   const [confirm, askConfirm, resetConfirm] = useConfirm();
 *   // To ask: askConfirm({ onConfirm: () => doSomething(), title: "...", message: "..." })
 *   // In JSX: <ConfirmModal isOpen={confirm.isOpen} {...confirm} onClose={resetConfirm} />
 */
const useConfirm = () => {
  const [state, setState] = useState({
    isOpen: false,
    title: "",
    message: "",
    warning: "",
    confirmText: "Xác nhận",
    variant: "danger",
    onConfirm: null,
  });

  const ask = useCallback((opts) => {
    setState({
      isOpen: true,
      title: opts.title || "Xác nhận",
      message: opts.message || "Bạn có chắc chắn muốn thực hiện hành động này?",
      warning: opts.warning || "",
      confirmText: opts.confirmText || "Xác nhận",
      variant: opts.variant || "danger",
      onConfirm: opts.onConfirm || null,
    });
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return [state, ask, reset];
};

export default useConfirm;
