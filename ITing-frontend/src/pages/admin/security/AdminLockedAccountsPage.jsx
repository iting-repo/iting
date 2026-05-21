import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FaLock, FaUnlock, FaUserShield, FaClock } from 'react-icons/fa';
import SEO from '../../../components/common/SEO';
import { ConfirmModal } from '../../../components/common';
import useConfirm from '../../../hooks/useConfirm';
import adminLockService from '../../../services/adminLockService';

const AdminLockedAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, askConfirm, resetConfirm] = useConfirm();

  const load = () => {
    setLoading(true);
    adminLockService.listLocked()
      .then(setAccounts)
      .catch(() => toast.error('Không tải được'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUnlock = (acc) => {
    askConfirm({
      title: "Mở khóa tài khoản",
      message: <p>Bạn có chắc chắn muốn mở khóa tài khoản <span className="font-bold">{acc.email}</span>?</p>,
      confirmText: "Mở khóa",
      variant: "info",
      onConfirm: async () => {
        resetConfirm();
        try {
          await adminLockService.unlock(acc.id);
          toast.success('Đã mở khóa');
          load();
        } catch { toast.error('Lỗi mở khóa'); }
      }
    });
  };

  return (
    <>
      <SEO title="Account bị khóa" noIndex />

      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <FaUserShield className="text-red-500" /> Account đang bị khóa
        </h1>
        <p className="text-sm text-slate-500 mb-5">
          Account bị tự động khóa 15 phút sau 5 lần nhập sai mật khẩu liên tiếp (chống brute-force).
        </p>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Đang tải...</div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-16 bg-green-50 rounded-xl">
            <FaLock className="w-12 h-12 text-green-300 mx-auto mb-3" />
            <p className="text-green-700 font-medium">Không có account nào đang bị khóa</p>
            <p className="text-sm text-slate-500 mt-1">Hệ thống ổn định 👌</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl ring-1 ring-slate-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="text-left p-4">Account</th>
                  <th className="text-left p-4">Failed attempts</th>
                  <th className="text-left p-4">Khóa đến</th>
                  <th className="text-right p-4">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{acc.fullName || '(no name)'}</div>
                      <div className="text-xs text-slate-500">{acc.email} · {acc.role}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-red-600 font-bold">
                        {acc.failedLoginAttempts || 0}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      <FaClock className="inline w-3 h-3 mr-1" />
                      {acc.lockedUntil ? new Date(acc.lockedUntil).toLocaleString('vi-VN') : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleUnlock(acc)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium flex items-center gap-1 ml-auto">
                        <FaUnlock /> Unlock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal isOpen={confirm.isOpen} onClose={resetConfirm} onConfirm={confirm.onConfirm} title={confirm.title} message={confirm.message} warning={confirm.warning} confirmText={confirm.confirmText} variant={confirm.variant} />
    </>
  );
};

export default AdminLockedAccountsPage;
