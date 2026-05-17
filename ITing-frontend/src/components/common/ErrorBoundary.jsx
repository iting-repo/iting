import React from 'react';
import { FaExclamationTriangle, FaRedo, FaHome, FaChevronDown, FaChevronUp } from 'react-icons/fa';

/**
 * ErrorBoundary — bắt lỗi runtime React và hiển thị retry UI.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyComponent />
 *   </ErrorBoundary>
 *
 *   // Với fallback tuỳ chỉnh
 *   <ErrorBoundary fallback={<MyErrorUI />}>
 *     <MyComponent />
 *   </ErrorBoundary>
 *
 *   // Với onError callback
 *   <ErrorBoundary onError={(error, info) => logToService(error, info)}>
 *     <MyComponent />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Gọi callback nếu có (ví dụ: gửi log lên server)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log ra console cho dev
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      // Nếu có custom fallback prop
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({
              error: this.state.error,
              retry: this.handleRetry,
            })
          : this.props.fallback;
      }

      // Default error UI
      return <ErrorFallbackUI
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        showDetails={this.state.showDetails}
        onRetry={this.handleRetry}
        onToggleDetails={this.toggleDetails}
        level={this.props.level}
      />;
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback UI — responsive, accessible, supports inline & full-page.
 */
const ErrorFallbackUI = ({ error, errorInfo, showDetails, onRetry, onToggleDetails, level = 'page' }) => {
  const isInline = level === 'section';

  if (isInline) {
    // ── Inline / Section-level error ──
    return (
      <div className="bg-danger-50 border border-danger-100 rounded-xl p-6 text-center" role="alert">
        <FaExclamationTriangle className="text-danger-500 text-2xl mx-auto mb-3" />
        <p className="text-gray-700 font-semibold mb-1">Không thể tải nội dung</p>
        <p className="text-gray-500 text-sm mb-4">
          {error?.message || 'Đã xảy ra lỗi không mong muốn.'}
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <FaRedo size={12} /> Thử lại
        </button>
      </div>
    );
  }

  // ── Full-page error ──
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6" role="alert">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-danger-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FaExclamationTriangle className="text-danger-500 text-3xl" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Rất tiếc, đã xảy ra lỗi!
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Trang bạn đang xem đã gặp sự cố. Hãy thử tải lại hoặc quay về trang chủ.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-600 transition-colors shadow-lg shadow-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <FaRedo size={12} /> Thử lại
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-600 rounded-xl font-bold text-sm border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
          >
            <FaHome size={12} /> Về trang chủ
          </a>
        </div>

        {/* Collapsible Error Details (dev-friendly) */}
        {(error?.message || errorInfo) && (
          <div className="mt-4">
            <button
              onClick={onToggleDetails}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 rounded"
            >
              Chi tiết lỗi {showDetails ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
            </button>

            {showDetails && (
              <div className="mt-3 bg-gray-50 border border-gray-100 rounded-lg p-4 text-left overflow-auto max-h-48">
                <p className="text-xs text-red-600 font-mono break-all">
                  {error?.message || 'Unknown error'}
                </p>
                {errorInfo?.componentStack && (
                  <pre className="text-[10px] text-gray-400 mt-2 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;
