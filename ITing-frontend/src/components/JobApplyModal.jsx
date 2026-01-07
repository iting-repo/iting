import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaCloudUploadAlt, FaPen, FaFilePdf, FaInfoCircle, FaSpinner } from 'react-icons/fa';
import applicationService from '../services/applicationService';
import { toast } from 'react-toastify';

const JobApplyModal = ({ isOpen, onClose, jobTitle, jobId }) => {
    const navigate = useNavigate();
    const [cvMethod, setCvMethod] = useState('recent'); // 'recent', 'library', 'upload'
    const [coverLetter, setCoverLetter] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            toast.error("Vui lòng đăng nhập để ứng tuyển!");
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            // Mock Upload Logic or CV Selection
            let cvUrl = "https://example.com/cv.pdf"; // Fallback/Mock
            let cvId = 3;

            if (cvMethod === 'upload' && file) {
                // TODO: Call Upload API here to get real URL and ID
                // const uploadRes = await uploadService.upload(file);
                // cvUrl = uploadRes.url;
                // cvId = uploadRes.id;

                // Simulating URL for now based on file name
                cvUrl = `https://mock-storage.com/${file.name}`;
            }

            const payload = {
                jobId: jobId || 21, // Fallback if prop missing
                cvUrl: cvUrl,
                cvId: cvId,
                coverLetter: coverLetter || "No cover letter"
            };

            console.log("[DEBUG] Applying with Payload:", payload);
            console.log("[DEBUG] Token present:", !!localStorage.getItem('access_token'));

            await applicationService.applyJob(payload);
            toast.success("Ứng tuyển thành công!");
            onClose();

        } catch (error) {
            console.error("Apply error:", error);
            const msg = error.response?.data || "Đã có lỗi xảy ra khi ứng tuyển.";
            toast.error(typeof msg === 'string' ? msg : "Đã có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            {/* Modal Container */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">

                {/* Header */}
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Ứng tuyển <span className="text-[#00B4D8]">{jobTitle}</span>
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    <h3 className="font-bold text-gray-800 text-sm">Chọn CV để ứng tuyển</h3>

                    {/* OPTION 1: CV Gần nhất */}
                    <div
                        onClick={() => setCvMethod('recent')}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${cvMethod === 'recent' ? 'border-[#00B4D8] bg-[#E6F6FD]/30' : 'border-gray-200 hover:border-[#00B4D8]'
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${cvMethod === 'recent' ? 'border-[#00B4D8]' : 'border-gray-300'
                                }`}>
                                {cvMethod === 'recent' && <div className="w-3 h-3 bg-[#00B4D8] rounded-full"></div>}
                            </div>
                            <span className="font-bold text-[#00B4D8] text-sm flex items-center gap-2">
                                CV ứng tuyển gần nhất: CV.pdf
                            </span>
                            <span className="ml-auto text-xs text-[#00B4D8] hover:underline">Xem</span>
                        </div>

                        <div className="pl-8 text-sm text-gray-600 space-y-1">
                            <p><span className="text-gray-400">Họ và tên:</span> <span className="font-medium text-gray-800">Võ Lê Anh Nghĩa</span></p>
                            <p><span className="text-gray-400">Email:</span> <span className="font-medium text-gray-800">meaningful@gmail.com</span></p>
                            <p><span className="text-gray-400">Số điện thoại:</span> <span className="font-medium text-gray-800">0123456789</span></p>
                        </div>
                    </div>

                    {/* OPTION 2: Chọn từ thư viện */}
                    <div
                        onClick={() => setCvMethod('library')}
                        className={`border rounded-lg p-4 cursor-pointer flex items-center gap-3 transition-all ${cvMethod === 'library' ? 'border-[#00B4D8]' : 'border-gray-200 hover:border-[#00B4D8]'
                            }`}
                    >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${cvMethod === 'library' ? 'border-[#00B4D8]' : 'border-gray-300'
                            }`}>
                            {cvMethod === 'library' && <div className="w-3 h-3 bg-[#00B4D8] rounded-full"></div>}
                        </div>
                        <span className="font-medium text-gray-700 text-sm">Chọn CV khác trong thư viện CV của tôi</span>
                    </div>

                    {/* OPTION 3: Upload */}
                    <div
                        onClick={() => setCvMethod('upload')}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${cvMethod === 'upload' ? 'border-[#00B4D8]' : 'border-gray-200 hover:border-[#00B4D8]'
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${cvMethod === 'upload' ? 'border-[#00B4D8]' : 'border-gray-300'
                                }`}>
                                {cvMethod === 'upload' && <div className="w-3 h-3 bg-[#00B4D8] rounded-full"></div>}
                            </div>
                            <span className="font-medium text-gray-700 text-sm">Tải lên CV từ máy tính, chọn hoặc kéo thả</span>
                        </div>

                        {cvMethod === 'upload' && (
                            <div className="ml-8 mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 text-gray-500 relative">
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx"
                                />
                                <FaCloudUploadAlt size={32} className="text-gray-400 mb-2" />
                                <p className="text-sm">
                                    {file ? `Đã chọn: ${file.name}` : "Hỗ trợ định dạng .doc, .docx, pdf có kích thước dưới 5MB"}
                                </p>
                                <button className="mt-3 px-4 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-100">
                                    {file ? "Chọn lại CV" : "Chọn CV"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Thư giới thiệu */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-800 text-sm">Thư giới thiệu:</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                            Một thư giới thiệu ngắn gọn, chỉnh chu sẽ giúp bạn trở nên chuyên nghiệp và gây ấn tượng hơn với nhà tuyển dụng.
                        </p>
                        <div className="relative">
                            <textarea
                                rows="3"
                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#00B4D8] outline-none resize-none bg-gray-50"
                                placeholder="Viết giới thiệu ngắn gọn về bản thân (Điểm mạnh, kinh nghiệm liên quan)..."
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                            ></textarea>
                            <div className="absolute bottom-3 right-3 text-[#00B4D8] cursor-pointer bg-white p-1 rounded-full shadow-sm border border-gray-100">
                                <FaPen size={12} />
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-2.5 bg-[#00B4D8] text-white font-bold rounded-lg hover:bg-[#0096B4] transition-colors text-sm shadow-md flex justify-center items-center gap-2">
                            {loading && <FaSpinner className="animate-spin" />}
                            {loading ? "Đang xử lý..." : "Nộp hồ sơ ứng tuyển"}
                        </button>
                    </div>

                    {/* Warning Section */}
                    <div className="bg-[#FFF5F5] border border-red-100 rounded-lg p-4 text-xs text-gray-600 space-y-2">
                        <p className="font-bold text-red-500 flex items-center gap-1">
                            Lưu ý:
                        </p>
                        <p>
                            ITWork khuyên tất cả các bạn hãy luôn cẩn trọng trong quá trình tìm việc và chủ động nghiên cứu về thông tin công ty, vị trí việc làm trước khi ứng tuyển.
                        </p>
                        <p>
                            Ứng viên cần có trách nhiệm với hành vi ứng tuyển của mình. Nếu bạn gặp phải tin tuyển dụng hoặc nhận được liên lạc đáng ngờ, hãy báo cáo ngay cho ITWork qua email <span className="text-[#00B4D8] cursor-pointer">hotro@itwork.vn</span> để được hỗ trợ kịp thời.
                        </p>
                        <p>
                            Tìm hiểu thêm kinh nghiệm phòng tránh lừa đảo <span className="text-[#00B4D8] cursor-pointer hover:underline">tại đây</span>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default JobApplyModal;