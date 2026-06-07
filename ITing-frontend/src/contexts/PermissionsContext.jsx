import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import rbacService from '../services/rbacService';

/**
 * Cung cấp quyền hiệu lực của user hiện tại cho khu vực admin.
 * - has(code): true nếu super admin, hoặc có quyền, hoặc khi đang tải (tránh nháy ẩn menu).
 * - superAdmin: cờ toàn quyền.
 */
const PermissionsContext = createContext({
  ready: false,
  superAdmin: false,
  permissions: new Set(),
  has: () => true,
  reload: () => {},
});

export const PermissionsProvider = ({ children }) => {
  const [state, setState] = useState({
    ready: false,
    superAdmin: false,
    permissions: new Set(),
  });

  const load = useCallback(() => {
    rbacService
      .getMyPermissions()
      .then((d) =>
        setState({
          ready: true,
          superAdmin: !!d?.superAdmin,
          permissions: new Set(d?.permissions || []),
        })
      )
      .catch(() =>
        // Lỗi (vd 403) → coi như không có quyền chi tiết, vẫn đánh dấu ready
        setState({ ready: true, superAdmin: false, permissions: new Set() })
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Trước khi tải xong → trả true để không ẩn nhầm menu (tránh nháy).
  const has = useCallback(
    (code) => !code || !state.ready || state.superAdmin || state.permissions.has(code),
    [state]
  );

  return (
    <PermissionsContext.Provider value={{ ...state, has, reload: load }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionsContext);

export default PermissionsContext;
