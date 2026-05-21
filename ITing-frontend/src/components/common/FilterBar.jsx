import React from 'react';

/**
 * Shared filter bar for list/table pages.
 *
 * Props:
 *   filters: Array of { key, label, options: [{value, label}] }
 *   values:  { [key]: value }
 *   onChange: (key, value) => void
 *   onReset: optional () => void — shows reset button when any filter has non-empty value
 *   rightSlot: optional ReactNode rendered on the right side (e.g. search box)
 *
 * Example:
 *   <FilterBar
 *     filters={[
 *       { key: 'status', label: 'Trạng thái', options: [
 *         { value: '', label: 'Tất cả' },
 *         { value: 'PENDING', label: 'Chờ xử lý' },
 *       ]},
 *     ]}
 *     values={{ status: 'PENDING' }}
 *     onChange={(k, v) => setFilter(k, v)}
 *   />
 */
const FilterBar = ({ filters = [], values = {}, onChange, onReset, rightSlot }) => {
    const hasAnyValue = filters.some((f) => values[f.key] && values[f.key] !== '');

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="flex flex-wrap gap-3 flex-1">
                {filters.map((f) => (
                    <div key={f.key} className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {f.label}
                        </label>
                        <select
                            value={values[f.key] ?? ''}
                            onChange={(e) => onChange?.(f.key, e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 hover:border-[#3AB4E6] focus:outline-none focus:ring-2 focus:ring-[#3AB4E6]/30 focus:border-[#3AB4E6] transition-colors min-w-[140px]"
                        >
                            {f.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}

                {hasAnyValue && onReset && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="text-xs font-semibold text-gray-500 hover:text-[#3AB4E6] underline underline-offset-2 px-2"
                    >
                        Xóa lọc
                    </button>
                )}
            </div>

            {rightSlot && <div className="flex items-center">{rightSlot}</div>}
        </div>
    );
};

export default FilterBar;
