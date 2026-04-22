import React, { useEffect, useMemo, useState } from "react";
import {
  FaTimes,
  FaCloudUploadAlt,
  FaPen,
  FaFilePdf,
} from "react-icons/fa";
import { toast } from "sonner";
import applicationService from "../services/applicationService";
import cvService from "../services/cvService";
import authService from "../services/authService";
import axiosInstance from "../utils/axiosInstance";
import { storage } from "../utils/storage";

const JobApplyModal = ({ isOpen, onClose, onSuccess, jobTitle, jobId }) => {
  const [cvMethod, setCvMethod] = useState("recent");
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [recentCVs, setRecentCVs] = useState([]);
  const [allCVs, setAllCVs] = useState([]);
  const [selectedCVId, setSelectedCVId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [isLoadingCVs, setIsLoadingCVs] = useState(false);
  const [user, setUser] = useState(null);

  const selectedCV = useMemo(
    () => allCVs.find((cv) => cv.id === selectedCVId) || recentCVs.find((cv) => cv.id === selectedCVId) || null,
    [allCVs, recentCVs, selectedCVId],
  );

  useEffect(() => {
    if (!isOpen) return;

    const loadCVs = async () => {
      if (!storage.getToken()) return;
      setIsLoadingCVs(true);
      try {
        const [recent, all, userInfo] = await Promise.all([
          cvService.getRecentCVs(),
          axiosInstance.get("/user/professional-profile/cv"),
          authService.getCurrentUser(),
        ]);
        const recentList = Array.isArray(recent) ? recent : [];
        const allList = Array.isArray(all) ? all : [];

        setRecentCVs(recentList);
        setAllCVs(allList);
        setUser(userInfo || null);

        const defaultCv =
          allList.find((cv) => cv.isDefault) || recentList[0] || allList[0] || null;
        setSelectedCVId(defaultCv?.id || null);
        setCvMethod(defaultCv ? "recent" : "upload");
      } catch {
        setRecentCVs([]);
        setAllCVs([]);
        setSelectedCVId(null);
      } finally {
        setIsLoadingCVs(false);
      }
    };

    loadCVs();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("Kich thuoc CV toi da la 5MB");
      return;
    }
    setUploadFile(file);
  };

  const handleSubmit = async () => {
    if (!storage.getToken()) {
      toast.error("Vui long dang nhap de ung tuyen");
      return;
    }

    if (!jobId) {
      toast.error("Khong tim thay thong tin cong viec");
      return;
    }

    try {
      setIsSubmitting(true);
      let finalCvId = selectedCVId;
      let finalCvUrl = selectedCV?.fileUrl || "";

      if (cvMethod === "upload") {
        if (!uploadFile) {
          toast.error("Vui long chon file CV de tai len");
          return;
        }

        const form = new FormData();
        form.append("file", uploadFile);
        form.append("title", uploadTitle.trim() || uploadFile.name.replace(/\.pdf$/i, ""));
        const uploaded = await cvService.uploadCV(form);
        finalCvId = uploaded?.id;
        finalCvUrl = uploaded?.fileUrl || "";
      }

      if (!finalCvId) {
        toast.error("Vui long chon CV de ung tuyen");
        return;
      }

      await applicationService.applyJob({
        jobId,
        cvId: finalCvId,
        cvUrl: finalCvUrl,
        coverLetter: coverLetter.trim() || undefined,
      });

      toast.success("Ung tuyen thanh cong!");
      if (onSuccess) onSuccess();
      else onClose();
    } catch (error) {
      toast.error(error?.message || "Co loi xay ra khi nop ho so.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewCV = (url) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Ung tuyen <span className="text-[#00B4D8]">{jobTitle}</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <h3 className="font-bold text-gray-800 text-sm">Chon CV de ung tuyen</h3>

          <div
            onClick={() => recentCVs.length > 0 && setCvMethod("recent")}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${cvMethod === "recent" ? "border-[#00B4D8] bg-[#E6F6FD]/30" : "border-gray-200 hover:border-[#00B4D8]"} ${recentCVs.length === 0 ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${cvMethod === "recent" ? "border-[#00B4D8]" : "border-gray-300"}`}>
                {cvMethod === "recent" && <div className="w-3 h-3 bg-[#00B4D8] rounded-full" />}
              </div>
              <span className="font-bold text-[#00B4D8] text-sm flex items-center gap-2">
                CV ung tuyen gan nhat: {recentCVs[0]?.title || recentCVs[0]?.fileName || "Chua co"}
              </span>
              {recentCVs[0]?.fileUrl ? (
                <button
                  type="button"
                  className="ml-auto text-xs text-[#00B4D8] hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    previewCV(recentCVs[0].fileUrl);
                  }}
                >
                  Xem
                </button>
              ) : null}
            </div>

            <div className="pl-8 text-sm text-gray-600 space-y-1">
              {isLoadingCVs ? (
                <p>Dang tai CV...</p>
              ) : (
                <>
                  <p><span className="text-gray-400">Ho va ten:</span> <span className="font-medium text-gray-800">{user?.fullName || user?.name || "..."}</span></p>
                  <p><span className="text-gray-400">Email:</span> <span className="font-medium text-gray-800">{user?.email || "..."}</span></p>
                </>
              )}
            </div>
          </div>

          <div onClick={() => setCvMethod("library")} className={`border rounded-lg p-4 cursor-pointer transition-all ${cvMethod === "library" ? "border-[#00B4D8]" : "border-gray-200 hover:border-[#00B4D8]"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${cvMethod === "library" ? "border-[#00B4D8]" : "border-gray-300"}`}>
                {cvMethod === "library" && <div className="w-3 h-3 bg-[#00B4D8] rounded-full" />}
              </div>
              <span className="font-medium text-gray-700 text-sm">Chon CV khac trong thu vien CV cua toi</span>
            </div>

            {cvMethod === "library" && (
              <div className="ml-8 mt-3 grid grid-cols-1 gap-2">
                {allCVs.length === 0 ? (
                  <p className="text-sm text-gray-500">Ban chua co CV trong thu vien.</p>
                ) : (
                  allCVs.map((cv) => (
                    <label key={cv.id} className={`flex items-center justify-between p-2 rounded-lg border text-sm ${selectedCVId === cv.id ? "border-[#00B4D8] bg-[#E6F6FD]/20" : "border-gray-100"}`}>
                      <div className="flex items-center gap-2 truncate">
                        <input type="radio" name="selectedCv" checked={selectedCVId === cv.id} onChange={() => setSelectedCVId(cv.id)} />
                        <span className="truncate">{cv.title || cv.fileName || `CV #${cv.id}`}</span>
                      </div>
                      {cv.fileUrl ? (
                        <button type="button" className="text-[#00B4D8] text-xs font-bold hover:underline" onClick={(e) => { e.preventDefault(); previewCV(cv.fileUrl); }}>
                          Xem
                        </button>
                      ) : null}
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          <div onClick={() => setCvMethod("upload")} className={`border rounded-lg p-4 cursor-pointer transition-all ${cvMethod === "upload" ? "border-[#00B4D8]" : "border-gray-200 hover:border-[#00B4D8]"}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${cvMethod === "upload" ? "border-[#00B4D8]" : "border-gray-300"}`}>
                {cvMethod === "upload" && <div className="w-3 h-3 bg-[#00B4D8] rounded-full" />}
              </div>
              <span className="font-medium text-gray-700 text-sm">Tai len CV tu may tinh, chon hoac keo tha</span>
            </div>

            {cvMethod === "upload" && (
              <div className="ml-8 mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <FaCloudUploadAlt size={32} className="text-gray-400 mb-2" />
                <p className="text-sm">Ho tro dinh dang .doc, .docx, .pdf co kich thuoc duoi 5MB</p>
                <input type="file" accept=".pdf,.doc,.docx" className="mt-3 text-sm" onChange={handleFileChange} />
                <input type="text" placeholder="Ten CV (tuy chon)" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="mt-3 w-full max-w-sm px-3 py-2 border border-gray-200 rounded text-sm" />
                {uploadFile ? (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                    <FaFilePdf className="text-red-500" /> {uploadFile.name}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-gray-800 text-sm">Thu gioi thieu:</h3>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Mot thu gioi thieu ngan gon, chinh chu se giup ban tro nen chuyen nghiep va gay an tuong hon voi nha tuyen dung.
            </p>
            <div className="relative">
              <textarea
                rows="3"
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#00B4D8] outline-none resize-none bg-gray-50"
                placeholder="Viet gioi thieu ngan gon ve ban than..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
              <div className="absolute bottom-3 right-3 text-[#00B4D8] cursor-pointer bg-white p-1 rounded-full shadow-sm border border-gray-100">
                <FaPen size={12} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Huy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 py-2.5 bg-[#00B4D8] text-white font-bold rounded-lg hover:bg-[#0096B4] transition-colors text-sm shadow-md ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? "Dang nop ho so..." : "Nop ho so ung tuyen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplyModal;
