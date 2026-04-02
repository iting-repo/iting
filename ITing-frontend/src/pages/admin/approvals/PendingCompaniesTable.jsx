import React from 'react';
import { FaEye, FaCheck, FaTimes, FaFilter, FaUserFriends } from 'react-icons/fa';
import { Button, Card, CardHeader, Table, Td } from '../../../components';

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
        <Card className="!p-0 overflow-hidden border-gray-100">
            {/* HEADER */}
            <CardHeader
                className="px-6 pt-6 mb-4"
                title={<span className="text-gray-800">Company Profile Reviews</span>}
                icon={<FaUserFriends className="text-blue-500" />}
                action={
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex items-center gap-2">
                            <FaFilter size={12} /> Filter
                        </Button>
                        <Button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white border-0">
                            <FaCheck size={12} /> Approve All
                        </Button>
                    </div>
                }
            />

            {/* TABLE */}
            <Table
                headers={[
                    { label: "Profile ID" },
                    { label: "Name" },
                    { label: "Type" },
                    { label: "Registration Date" },
                    { label: "Actions", className: "text-right" }
                ]}
            >
                        {profiles.map((profile) => (
                            <tr key={profile.id} className="hover:bg-gray-50/80 transition-colors">
                                <Td className="font-medium text-gray-500">{profile.id}</Td>
                                <Td>
                                    <div className="flex items-center gap-2">
                                        <img src={profile.avatar} alt={profile.name} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                                        <span className="text-sm font-bold text-gray-700">{profile.name}</span>
                                    </div>
                                </Td>
                                <Td className="text-gray-600">{profile.type}</Td>
                                <Td className="text-gray-500">{profile.date}</Td>
                                <Td className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors">
                                            <FaEye size={12} />
                                        </button>
                                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
                                            <FaCheck size={12} />
                                        </button>
                                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
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

export default PendingCompaniesTable;