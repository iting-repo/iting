import React from 'react';
import { FaEye, FaCheck, FaTimes, FaFilter, FaBriefcase } from 'react-icons/fa';

const PendingJobsTable = () => {
    // Mock Data: Danh sách tin tuyển dụng chờ duyệt
    const jobs = [
        {
            id: "#P-1001",
            title: "Senior Software Engineer",
            company: "TechCorp Inc.",
            postedBy: "Sarah Johnson",
            avatar: "https://i.pravatar.cc/150?img=1",
            date: "2024-01-20",
        },
        {
            id: "#P-1002",
            title: "Marketing Manager",
            company: "Digital Solutions",
            postedBy: "Mike Davis",
            avatar: "https://i.pravatar.cc/150?img=2",
            date: "2024-01-19",
        },
        {
            id: "#P-1003",
            title: "UX Designer",
            company: "Creative Studio",
            postedBy: "Emma Wilson",
            avatar: "https://i.pravatar.cc/150?img=3",
            date: "2024-01-18",
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            {/* HEADER */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FaBriefcase className="text-orange-500" /> Recruitment Posts Review
                </h3>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-lg transition-colors">
                        <FaFilter size={12} /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                        <FaCheck size={12} /> Approve All
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Post ID</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Job Title</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Company</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Posted By</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="p-4 text-sm font-medium text-gray-500">{job.id}</td>
                                <td className="p-4 text-sm font-bold text-gray-800">{job.title}</td>
                                <td className="p-4 text-sm text-gray-600">{job.company}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <img src={job.avatar} alt={job.postedBy} className="w-6 h-6 rounded-full object-cover" />
                                        <span className="text-sm font-medium text-gray-700">{job.postedBy}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors" title="View Details">
                                            <FaEye size={12} />
                                        </button>
                                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 text-green-600 hover:bg-green-200 transition-colors" title="Approve">
                                            <FaCheck size={12} />
                                        </button>
                                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 transition-colors" title="Reject">
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PendingJobsTable;