import React from 'react';
import { FaPen, FaUserClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import StatsCard from '../components/StatsCard';
import PendingJobsTable from './PendingJobsTable';
import PendingCompaniesTable from './PendingCompaniesTable';

const ApprovalManagement = () => {
    return (
        <div className="space-y-8">

            {/* 1. STATS ROW (Các chỉ số duyệt) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Pending Posts - Màu Vàng Cam */}
                <StatsCard
                    title="Pending Posts"
                    value="156"
                    icon={<FaPen />}
                    percentage="24"
                    isIncrease={true}
                />

                {/* Pending Profiles - Màu Xanh Dương */}
                <StatsCard
                    title="Pending Profiles"
                    value="89"
                    icon={<FaUserClock />}
                    percentage="12"
                    isIncrease={true}
                />

                {/* Approved Today - Màu Xanh Lá */}
                <StatsCard
                    title="Approved Today"
                    value="342"
                    icon={<FaCheckCircle />}
                    percentage="18"
                    isIncrease={true}
                />

                {/* Rejected Today - Màu Đỏ */}
                <StatsCard
                    title="Rejected Today"
                    value="23"
                    icon={<FaTimesCircle />}
                    percentage="5"
                    isIncrease={false}
                />
            </div>

            {/* 2. MAIN SECTIONS */}
            {/* Bảng duyệt Job */}
            <PendingJobsTable />

            {/* Bảng duyệt Công ty */}
            <PendingCompaniesTable />

        </div>
    );
};

export default ApprovalManagement;