import React from 'react';

export const Table = ({ headers, children, className = "", tableClassName = "" }) => (
  <div className={`overflow-x-auto rounded-xl border border-gray-100 bg-white ${className}`}>
    <table className={`w-full text-left border-collapse ${tableClassName}`}>
      <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-bold">
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
