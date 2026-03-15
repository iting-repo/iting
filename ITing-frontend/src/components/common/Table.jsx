import React from 'react';

export const Table = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead className="bg-gray-50/50">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className={`p-4 text-xs font-bold text-gray-500 uppercase tracking-wider ${h.className || ''}`}>
              {h.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {children}
      </tbody>
    </table>
  </div>
);

export const Td = ({ children, className = "" }) => (
  <td className={`p-4 text-sm text-gray-700 ${className}`}>{children}</td>
);
