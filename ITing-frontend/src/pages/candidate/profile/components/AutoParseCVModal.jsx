import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaMagic, FaFileAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useModalEscape } from '../../../../hooks/useModalEscape';
import cvService from '../../../../services/cvService';
import { toast } from 'sonner';

const AutoParseCVModal = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(0); // 0: Select, 1: Parsing, 2: Success
    const [progress, setProgress] = useState(0);
    const [parseLog, setParseLog] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);

    useModalEscape(isOpen ? onClose : null);

    useEffect(() => {
        if (!isOpen) {
            setStep(0);
            setProgress(0);
            setParseLog('');
            setSelectedFile(null);
            setParsedData(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (step === 1) {
            let currentProgress = 0;
            const interval = setInterval(() => {
                currentProgress += Math.random() * 15;
                if (currentProgress > 100) currentProgress = 100;
                setProgress(Math.floor(currentProgress));

                if (currentProgress > 20 && currentProgress < 40) setParseLog('Đang trích xuất Thông tin cơ bản...');
                if (currentProgress > 40 && currentProgress < 60) setParseLog('Đang phân tích Kinh nghiệm làm việc...');
                if (currentProgress > 60 && currentProgress < 80) setParseLog('Đang nhận diện Kỹ năng chuyên môn...');
                if (currentProgress > 80 && currentProgress < 95) setParseLog('Đang trích xuất Học vấn & Chứng chỉ...');
                if (currentProgress >= 100) {
                    clearInterval(interval);
                    setParseLog('Phân tích hoàn tất!');
                    setTimeout(() => setStep(2), 500);
                }
            }, 300);
            return () => clearInterval(interval);
        }
    }, [step]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleStartParse = async () => {
        if (!selectedFile) {
            toast.error('Vui lòng chọn một file CV (PDF hoặc Ảnh) trước');
            return;
        }

        setStep(1);
        setParseLog('Đang tải file lên hệ thống AI...');
        setProgress(10);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Gửi API call tới Spring Boot.
            // axiosInstance interceptor đã unwrap response.data → response chính là body Gemini trả về.
            const response = await cvService.parseCV(formData);
            let finalJson = typeof response === 'string' ? JSON.parse(response) : response;
            
            setParsedData(finalJson);
            setProgress(100);
            setParseLog('Phân tích hoàn tất!');
            setTimeout(() => setStep(2), 600);
            
        } catch (error) {
            console.error('Lỗi khi phân tích CV:', error);
            toast.error('Có lỗi xảy ra khi phân tích CV. Vui lòng thử lại sau.');
            setStep(0);
            setProgress(0);
        }
    };

    const handleFinish = () => {
        onClose();
        if (onComplete) onComplete();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center gap-2 text-indigo-700">
                        <FaMagic />
                        <h3 className="font-bold">Auto-Fill bằng AI</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-indigo-100 text-indigo-400 transition-colors">
                        <FaTimes />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 0 && (
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-500 mb-4">
                                <FaFileAlt size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800">Tự động điền hồ sơ</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Chọn CV của bạn (PDF/Image). AI của ITing sẽ đọc và tự động điền các thông tin như Kỹ năng, Kinh nghiệm, và Học vấn vào hồ sơ chuyên nghiệp.
                            </p>
                            
                            <div className="mt-4">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-indigo-300 border-dashed rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FaFileAlt className="w-8 h-8 mb-2 text-indigo-500" />
                                        <p className="mb-2 text-sm text-indigo-600 font-medium">
                                            {selectedFile ? selectedFile.name : 'Click để chọn file CV'}
                                        </p>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept=".pdf,image/*" 
                                        onChange={handleFileChange} 
                                    />
                                </label>
                            </div>

                            <button
                                onClick={handleStartParse}
                                disabled={!selectedFile}
                                className={`w-full mt-4 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                                    selectedFile ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <FaMagic /> Bắt đầu phân tích
                            </button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="text-center space-y-6 py-4">
                            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                                <div
                                    className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"
                                ></div>
                                <FaMagic className="text-indigo-600 animate-pulse" size={28} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-1">AI đang xử lý...</h4>
                                <p className="text-sm text-indigo-600 font-medium">{progress}%</p>
                            </div>
                            
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 animate-pulse">{parseLog}</p>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center space-y-4 py-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-500 mb-4">
                                <FaCheckCircle size={40} />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800">Hoàn tất!</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Các thông tin từ CV đã được trích xuất thành công. Vui lòng kiểm tra lại và chỉnh sửa nếu cần.
                            </p>
                            <button
                                onClick={handleFinish}
                                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all"
                            >
                                Xem hồ sơ của tôi
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AutoParseCVModal;
