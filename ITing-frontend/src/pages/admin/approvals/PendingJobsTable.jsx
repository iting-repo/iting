import React from 'react';
import { FaEye, FaCheck, FaTimes, FaFilter, FaBriefcase } from 'react-icons/fa';
import { Button, Card, CardHeader, Table, Td } from '../../../components';

const PendingJobsTable = () => {
    // Mock Data: Danh sách tin tuyển dụng chờ duyệt
    const jobs = [
        {
            id: "#P-1001",
            title: "Kỹ sư phần mềm cấp cao",
            company: "TechCorp Inc.",
            postedBy: "Sarah Johnson",
            avatar: "https://i.pravatar.cc/150?img=1",
            date: "2024-01-20",
        },
        {
            id: "#P-1002",
            title: "Trưởng phòng tiếp thị",
            company: "Digital Solutions",
            postedBy: "Mike Davis",
            avatar: "https://i.pravatar.cc/150?img=2",
            date: "2024-01-19",
        },
        {
            id: "#P-1003",
            title: "Nhà thiết kế trải nghiệm người dùng",
            company: "Creative Studio",
            postedBy: "Emma Wilson",
            avatar: "https://i.pravatar.cc/150?img=3",
            date: "2024-01-18",
        },
    ];

    return (
        <Card className="!p-0 overflow-hidden border-gray-100 mb-8">
            {/* HEADER */}
            <CardHeader
                className="px-6 pt-6 mb-4"
                title={<span className="text-gray-800">Duyệt bài đăng tuyển dụng</span>}
                icon={<FaBriefcase className="text-orange-500" />}
                action={
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex items-center gap-2">
                            <FaFilter size={12} /> Lọc
                        </Button>
                        <Button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white border-0">
                            <FaCheck size={12} /> Duyệt tất cả
                        </Button>
                    </div>
                }
            />

            {/* TABLE */}
            <Table
                headers={[
                    { label: "Mã bài đăng" },
                    { label: "Tiêu đề công việc" },
                    { label: "Công ty" },
                    { label: "Người đăng" },
                    { label: "Thao tác", className: "text-right" }
                ]}
            >
                        {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50/80 transition-colors">
                                <Td className="font-medium text-gray-500">{job.id}</Td>
                                <Td className="font-bold text-gray-800">{job.title}</Td>
                                <Td className="text-gray-600">{job.company}</Td>
                                <Td>
                                    <div className="flex items-center gap-2">
                                        <img src={job.avatar} alt={job.postedBy} className="w-6 h-6 rounded-full object-cover" />
                                        <span className="text-sm font-medium text-gray-700">{job.postedBy}</span>
                                    </div>
                                </Td>
                                <Td className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors" title="Xem chi tiết">
                                            <FaEye size={12} />
                                        </button>
                                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 text-green-600 hover:bg-green-200 transition-colors" title="Duyệt">
                                            <FaCheck size={12} />
                                        </button>
                                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 transition-colors" title="Từ chối">
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                </Td>
                            </tr>
                        ))}
            </Table>
        </Card>
    );
};

export default PendingJobsTable;
