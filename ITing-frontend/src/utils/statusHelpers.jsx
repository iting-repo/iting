import React from 'react';
import { FaCheck, FaTimes, FaEye, FaClock } from 'react-icons/fa';

/**
 * Application status helpers — shared across Candidate & Employer pages.
 * Single source of truth for status styling, icons, and labels.
 */

export const getStatusStyle = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
    case 'ACCEPTED': return 'bg-green-50 text-green-600 border-green-100';
    case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
    case 'VIEWED': return 'bg-blue-50 text-blue-600 border-blue-100';
    default: return 'bg-gray-50 text-gray-600 border-gray-100';
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case 'ACCEPTED': return <FaCheck size={10} />;
    case 'REJECTED': return <FaTimes size={10} />;
    case 'VIEWED': return <FaEye size={10} />;
    default: return <FaClock size={10} />;
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case 'PENDING': return 'Chờ xử lý';
    case 'ACCEPTED': return 'Đã duyệt';
    case 'REJECTED': return 'Từ chối';
    case 'VIEWED': return 'Đã xem';
    default: return status || 'Không rõ';
  }
};
