import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Save, User } from "lucide-react";
import { Button, Input, Card } from "../../../../components/common";
import axiosInstance from "../../../../utils/axiosInstance";
import { toast } from "sonner";

export default function BasicInfoSection() {
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            headline: "",
            experience: 0,
            education: "",
            location: "",
            shortBio: "",
        },
    });

    useEffect(() => {
        const fetchBasicInfo = async () => {
            try {
                setIsLoading(true);
                const data = await axiosInstance.get('/user/professional-profile');

                if (data) {
                    reset({
                        headline: data.headline || "",
                        experience: data.totalExperienceYears || 0,
                        education: data.educationSummary || "",
                        location: data.location || "",
                        shortBio: data.shortBio || "",
                    });
                }
            } catch (error) {
                console.error("❌ Failed to fetch professional profile", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBasicInfo();
    }, [reset]);

    const onSubmit = async (data) => {
        setIsSaving(true);
        try {
            await axiosInstance.put('/user/professional-profile', {
                headline: data.headline,
                location: data.location,
                totalExperienceYears: parseInt(data.experience, 10),
                educationSummary: data.education,
                shortBio: data.shortBio,
                employmentStatus: "ACTIVELY_LOOKING",
                openToWork: true
            });
            toast.success("Thông tin cơ bản đã được cập nhật!");
        } catch (error) {
            console.error("Failed to update professional profile", error);
            toast.error("Có lỗi xảy ra khi cập nhật!");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500">Đang tải thông tin...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="mb-6">
                <h3 className="font-semibold text-lg text-gray-900">Thông tin cơ bản</h3>
                <p className="text-sm text-gray-600 mt-1">
                    Thông tin hiển thị trên hồ sơ công khai của bạn
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Chức danh */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="headline">Chức danh *</label>
                        <Input
                            id="headline"
                            {...register("headline", { required: "Vui lòng nhập chức danh" })}
                            placeholder="VD: Senior Developer"
                        />
                        {errors.headline && (
                            <p className="text-red-600 text-sm mt-1">{errors.headline.message}</p>
                        )}
                    </div>

                    {/* Học vấn */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="education">Học vấn *</label>
                        <select
                            id="education"
                            {...register("education", { required: "Vui lòng chọn học vấn" })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-[#9D5CE9] transition-all"
                        >
                            <option value="">Chọn...</option>
                            <option value="HIGH_SCHOOL">Trung học phổ thông</option>
                            <option value="ASSOCIATE">Cao đẳng</option>
                            <option value="BACHELOR">Đại học</option>
                            <option value="MASTER">Thạc sĩ</option>
                            <option value="DOCTORATE">Tiến sĩ</option>
                            <option value="OTHER">Khác</option>
                        </select>
                        {errors.education && (
                            <p className="text-red-600 text-sm mt-1">{errors.education.message}</p>
                        )}
                    </div>

                    {/* Kinh nghiệm */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="experience">Kinh nghiệm (Số năm) *</label>
                        <Input
                            id="experience"
                            type="number"
                            min="0"
                            {...register("experience", {
                                required: "Vui lòng nhập số năm kinh nghiệm",
                                min: { value: 0, message: "Kinh nghiệm không thể số âm" }
                            })}
                            placeholder="VD: 5"
                        />
                        {errors.experience && (
                            <p className="text-red-600 text-sm mt-1">{errors.experience.message}</p>
                        )}
                    </div>

                    {/* Địa điểm */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">Địa điểm *</label>
                        <Input
                            id="location"
                            {...register("location", { required: "Vui lòng nhập địa điểm" })}
                            placeholder="VD: TP. Hồ Chí Minh"
                        />
                        {errors.location && (
                            <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
                        )}
                    </div>
                </div>

                {/* Giới thiệu ngắn */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="shortBio">Giới thiệu ngắn</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <textarea
                            id="shortBio"
                            className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-10 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-[#9D5CE9] transition-all"
                            rows="4"
                            {...register("shortBio")}
                            placeholder="Giới thiệu bản thân, mục tiêu nghề nghiệp..."
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button type="submit" variant="primary" disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Đang lưu..." : "Lưu thông tin"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}

