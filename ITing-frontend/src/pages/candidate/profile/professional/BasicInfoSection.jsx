import React from "react";
import { useForm } from "react-hook-form";
import { Save, Globe } from "lucide-react";
import { Button, Input, Card } from "../../../../components/common";
import { toast } from "sonner";

export default function BasicInfoSection() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            jobTitle: "Senior Developer",
            experience: "5-7",
            education: "university",
            location: "TP. Hồ Chí Minh",
            website: "https://example.com",
        },
    });

    const onSubmit = (data) => {
        console.log("Basic Info:", data);
        toast.success("Thông tin cơ bản đã được cập nhật!");
    };

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
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="jobTitle">Chức danh *</label>
                        <Input
                            id="jobTitle"
                            {...register("jobTitle", { required: "Vui lòng nhập chức danh" })}
                            placeholder="VD: Senior Developer"
                        />
                        {errors.jobTitle && (
                            <p className="text-red-600 text-sm mt-1">{errors.jobTitle.message}</p>
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
                            <option value="highschool">Trung học phổ thông</option>
                            <option value="college">Cao đẳng</option>
                            <option value="university">Đại học</option>
                            <option value="master">Thạc sĩ</option>
                            <option value="phd">Tiến sĩ</option>
                        </select>
                        {errors.education && (
                            <p className="text-red-600 text-sm mt-1">{errors.education.message}</p>
                        )}
                    </div>

                    {/* Kinh nghiệm */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="experience">Kinh nghiệm *</label>
                        <select
                            id="experience"
                            {...register("experience", { required: "Vui lòng chọn kinh nghiệm" })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-[#9D5CE9] transition-all"
                        >
                            <option value="">Chọn...</option>
                            <option value="0-1">Dưới 1 năm</option>
                            <option value="1-3">1-3 năm</option>
                            <option value="3-5">3-5 năm</option>
                            <option value="5-7">5-7 năm</option>
                            <option value="7-10">7-10 năm</option>
                            <option value="10+">Trên 10 năm</option>
                        </select>
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

                {/* Website */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="website">Website</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            id="website"
                            className="pl-10"
                            {...register("website", {
                                pattern: {
                                    value: /^https?:\/\/.+/,
                                    message: "URL phải bắt đầu với http:// hoặc https://"
                                }
                            })}
                            placeholder="https://example.com"
                        />
                    </div>
                    {errors.website && (
                        <p className="text-red-600 text-sm mt-1">{errors.website.message}</p>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button type="submit" variant="primary">
                        <Save className="w-4 h-4 mr-2" />
                        Lưu thông tin
                    </Button>
                </div>
            </form>
        </Card>
    );
}

