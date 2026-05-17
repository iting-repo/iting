import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FaFileInvoice, FaDownload, FaPen, FaCheckCircle, FaTimes } from 'react-icons/fa';
import SEO from '../../components/common/SEO';
import invoiceService from '../../services/invoiceService';

/**
 * Invoices list for HR / candidate — view + download VAT-compliant PDF.
 * Also lets user edit billing info (company name + tax code) before re-rendering.
 */
const InvoicesListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    invoiceService.list()
      .then(setInvoices)
      .catch(() => toast.error('Không tải được danh sách hóa đơn'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDownload = async (inv) => {
    try {
      const { downloadUrl } = await invoiceService.getDownloadUrl(inv.id);
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Không tải được hóa đơn');
    }
  };

  return (
    <>
      <SEO title="Hóa đơn của tôi" noIndex />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <FaFileInvoice className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Hóa đơn của tôi</h1>
            <p className="text-sm text-slate-500">Lịch sử thanh toán + tải hóa đơn VAT</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Đang tải...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl">
            <FaFileInvoice className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Bạn chưa có hóa đơn nào.</p>
            <p className="text-sm text-slate-400 mt-1">
              Hóa đơn sẽ tự động được tạo sau mỗi giao dịch thành công.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="text-left p-4 font-medium">Mã hóa đơn</th>
                  <th className="text-left p-4 font-medium">Ngày phát hành</th>
                  <th className="text-left p-4 font-medium">Mô tả</th>
                  <th className="text-right p-4 font-medium">Tổng tiền</th>
                  <th className="text-right p-4 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-mono font-semibold text-slate-800">{inv.invoiceNumber}</div>
                      {inv.billToTaxCode && (
                        <div className="text-xs text-slate-400">MST: {inv.billToTaxCode}</div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(inv.issuedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-sm text-slate-700">{inv.itemDescription}</td>
                    <td className="p-4 text-right">
                      <div className="font-bold text-slate-900">
                        {Number(inv.totalAmount).toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-xs text-slate-400">
                        Excl: {Number(inv.amountExclVat).toLocaleString('vi-VN')} +
                        VAT {inv.vatRate}%
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditing(inv)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Sửa thông tin xuất hóa đơn"
                        ><FaPen className="w-3.5 h-3.5" /></button>
                        <button
                          onClick={() => handleDownload(inv)}
                          disabled={!inv.hasPdf}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaDownload className="w-3.5 h-3.5" /> Tải PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-slate-700">
          💡 <strong>Lưu ý:</strong> Hóa đơn VAT 10% được tự động tạo sau mỗi thanh toán SEPAY thành công.
          Để xuất hóa đơn cho doanh nghiệp, click ✏️ để cập nhật tên công ty + mã số thuế trước khi tải PDF.
        </div>
      </div>

      {editing && (
        <EditBillToDialog
          invoice={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </>
  );
};

const EditBillToDialog = ({ invoice, onClose, onSaved }) => {
  const [form, setForm] = useState({
    billToName: invoice.billToName || '',
    billToTaxCode: invoice.billToTaxCode || '',
    billToAddress: invoice.billToAddress || '',
    billToEmail: invoice.billToEmail || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await invoiceService.updateBillTo(invoice.id, form);
      toast.success('Đã cập nhật thông tin hóa đơn');
      onSaved?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 p-2"><FaTimes /></button>
        <h3 className="text-xl font-bold mb-1">Sửa thông tin xuất hóa đơn</h3>
        <p className="text-sm text-slate-500 mb-4">
          Hóa đơn: <strong>{invoice.invoiceNumber}</strong>
        </p>

        <div className="space-y-3">
          <Field label="Tên (cá nhân hoặc công ty)" required>
            <input
              value={form.billToName}
              onChange={(e) => setForm({ ...form, billToName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </Field>
          <Field label="Mã số thuế (nếu là công ty)">
            <input
              value={form.billToTaxCode}
              onChange={(e) => setForm({ ...form, billToTaxCode: e.target.value })}
              placeholder="VD: 0301234567"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono" />
          </Field>
          <Field label="Địa chỉ">
            <input
              value={form.billToAddress}
              onChange={(e) => setForm({ ...form, billToAddress: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </Field>
          <Field label="Email nhận hóa đơn">
            <input type="email"
              value={form.billToEmail}
              onChange={(e) => setForm({ ...form, billToEmail: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </Field>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">Hủy</button>
          <button onClick={save} disabled={saving}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
            <FaCheckCircle /> {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children, required }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export default InvoicesListPage;
