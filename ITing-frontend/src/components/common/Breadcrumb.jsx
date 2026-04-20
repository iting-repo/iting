import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

/**
 * Breadcrumb component for page navigation
 * @param {Array} items - List of objects { label: string, link: string }
 */
const Breadcrumb = ({ items = [] }) => {
    return (
        <nav className="flex py-4 mb-2 text-sm overflow-x-auto whitespace-nowrap no-scrollbar font-medium">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
                <li className="inline-flex items-center">
                    <Link to="/" className="text-gray-500 hover:text-[#3AB4E6] transition-colors flex items-center">
                        Trang chủ
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        <FaChevronRight className="w-2.5 h-2.5 text-gray-400 mx-2 flex-shrink-0" />
                        {item.link ? (
                            <Link to={item.link} className="text-gray-500 hover:text-[#3AB4E6] transition-colors">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-gray-800 font-bold truncate max-w-[200px] md:max-w-md">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
