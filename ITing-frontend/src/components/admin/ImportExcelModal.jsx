import React, { useState } from "react";
import { FaDownload, FaFileExcel, FaTimes } from "react-icons/fa";
import { Dialog, Button } from "../index";
import { toast } from "sonner";

const ImportExcelModal = ({ 
  isOpen, 
  onClose, 
  title = "Nhập dữ liệu từ Excel", 
  onDownloadTemplate, 
  onImport,
  resourceName = "dữ liệu"
}) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        toast.error("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Vui lòng chọn file trước khi nhập");
      return;
    }

    try {
      setLoading(true);
      await onImport(file);
      toast.success(`Nhập ${resourceName} thành công!`);
      setFile(null);
      onClose();
    } catch (error) {
      console.error("Lỗi khi nhập Excel:", error);
      toast.error("Có lỗi xảy ra khi nhập file. Vui lòng kiểm tra lại định dạng file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-6 py-2">
        {/* Bước 1 */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <div className="mb-3 flex items-center gap-2 font-bold text-blue-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">1</span>
            Tải file mẫu
          </div>
          <p className="mb-4 text-sm text-blue-600/80 leading-relaxed">
            Hãy tải file mẫu về, điền đầy đủ các thông tin cần thiết theo đúng định dạng để đảm bảo dữ liệu được nhập chính xác nhất vào hệ thống.
          </p>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"
            onClick={onDownloadTemplate}
          >
            <FaDownload className="mr-2" /> Tải file mẫu ngay (.xlsx)
          </Button>
        </div>

        {/* Bước 2 */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
          <div className="mb-3 flex items-center gap-2 font-bold text-slate-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 text-[10px] text-white">2</span>
            Tải lên file dữ liệu
          </div>
          
          <div className="relative">
            {!file ? (
              <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white transition-all hover:bg-slate-50 hover:border-sky-400">
                <FaFileExcel className="mb-2 text-3xl text-slate-300" />
                <span className="text-sm font-medium text-slate-500">Kéo thả hoặc nhấn để chọn file Excel</span>
                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-600 p-2 text-white">
                    <FaFileExcel />
                  </div>
                  <div>
                    <p className="max-w-[200px] truncate text-sm font-bold text-green-800">{file.name}</p>
                    <p className="text-xs text-green-600 font-medium">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="rounded-full p-1.5 text-green-600 hover:bg-green-100 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button 
            className="bg-[#3AB4E6] hover:bg-[#2C9ACD] px-8 font-bold"
            onClick={handleImport}
            disabled={!file || loading}
          >
            {loading ? "Đang xử lý..." : "Nhập dữ liệu"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ImportExcelModal;
