import React from 'react';

export const Table = ({ headers, children }) => (
  <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
    <table className="w-full text-left border-collapse">
      <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider font-semibold">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className={`p-5 ${h.className || ''}`}>
              {h.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {children}
      </tbody>
    </table>
  </div>
);

export const Td = ({ children, className = "" }) => (
  <td className={`p-5 text-sm text-gray-700 ${className}`}>{children}</td>
);
