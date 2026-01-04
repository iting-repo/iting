import React from 'react';
import { FaEye, FaCheck, FaTimes, FaFilter, FaUserFriends } from 'react-icons/fa';

const PendingCompaniesTable = () => {
    // Mock Data: Hồ sơ công ty chờ duyệt
    const profiles = [
        {
            id: "#PR-5001",
            name: "John Doe (Tech Startups)",
            type: "Company Rep",
            avatar: "https://i.pravatar.cc/150?img=4",
            date: "2024-01-15",
        },
        {
            id: "#PR-5002",
            name: "Jane Smith (Global HR)",
            type: "HR Manager",
            avatar: "https://i.pravatar.cc/150?img=5",
            date: "2024-01-15",
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* HEADER */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FaUserFriends className="text-blue-500" /> Company Profile Reviews
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
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Profile ID</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Registration Date</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {profiles.map((profile) => (
                            <tr key={profile.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="p-4 text-sm font-medium text-gray-500">{profile.id}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <img src={profile.avatar} alt={profile.name} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                                        <span className="text-sm font-bold text-gray-700">{profile.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-600">{profile.type}</td>
                                <td className="p-4 text-sm text-gray-500">{profile.date}</td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors">
                                            <FaEye size={12} />
                                        </button>
                                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
                                            <FaCheck size={12} />
                                        </button>
                                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
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

export default PendingCompaniesTable;