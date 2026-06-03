import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Lazy-load Facebook SDK và expose hàm login.
 *
 * Lý do không dùng react-facebook-login: lib unmaintained 3 năm, browser
 * compat kém. Cách này dùng FB SDK chính thức, ~6KB và chỉ load khi user
 * focus vào login flow.
 *
 * Usage:
 *   const { login, ready, loading } = useFacebookLogin({ onSuccess, onError });
 *   <button onClick={login} disabled={!ready || loading}>FB</button>
 *
 * SDK load sự kiện:
 *   1. Initial render → SDK chưa load (ready = false)
 *   2. User click button lần đầu → load FB SDK script + FB.init
 *   3. SDK ready (ready = true)
 *   4. Mở popup FB.login → user authorize → callback với accessToken
 */
export function useFacebookLogin({ onSuccess, onError } = {}) {
  const [ready, setReady] = useState(typeof window !== 'undefined' && !!window.FB);
  const [loading, setLoading] = useState(false);
  const sdkPromiseRef = useRef(null);

  const appId = process.env.REACT_APP_FACEBOOK_APP_ID || '';

  // Inject FB SDK script lazily.
  const loadSdk = useCallback(() => {
    if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
    if (window.FB) {
      setReady(true);
      return Promise.resolve(window.FB);
    }
    if (sdkPromiseRef.current) return sdkPromiseRef.current;

    sdkPromiseRef.current = new Promise((resolve, reject) => {
      if (!appId) {
        reject(new Error('REACT_APP_FACEBOOK_APP_ID chưa được cấu hình'));
        return;
      }

      window.fbAsyncInit = function () {
        window.FB.init({
          appId,
          cookie: false,
          xfbml: false,
          version: 'v18.0',
        });
        setReady(true);
        resolve(window.FB);
      };

      const existing = document.getElementById('facebook-jssdk');
      if (existing) {
        // SDK script tồn tại nhưng FB chưa init — đợi fbAsyncInit fire.
        return;
      }

      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.onerror = () => reject(new Error('Không thể load Facebook SDK'));
      document.body.appendChild(script);
    });

    return sdkPromiseRef.current;
  }, [appId]);

  // Pre-warm SDK script khi component mount, không block render.
  useEffect(() => {
    if (typeof window === 'undefined' || window.FB || !appId) return;
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(() => loadSdk().catch(() => {}), { timeout: 3000 })
      : setTimeout(() => loadSdk().catch(() => {}), 500);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, [appId, loadSdk]);

  const login = useCallback(async () => {
    setLoading(true);
    try {
      const FB = await loadSdk();
      FB.login(
        (response) => {
          setLoading(false);
          if (response.status === 'connected' && response.authResponse?.accessToken) {
            onSuccess?.({
              accessToken: response.authResponse.accessToken,
              userID: response.authResponse.userID,
            });
          } else if (response.status !== 'unknown') {
            // 'not_authorized' hoặc user cancel.
            onError?.(new Error('Đăng nhập Facebook bị huỷ hoặc chưa cấp quyền email'));
          }
        },
        { scope: 'email,public_profile', return_scopes: true }
      );
    } catch (err) {
      setLoading(false);
      onError?.(err);
    }
  }, [loadSdk, onSuccess, onError]);

  return { login, ready, loading, configured: !!appId };
}

export default useFacebookLogin;
