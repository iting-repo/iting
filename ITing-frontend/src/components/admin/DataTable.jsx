import React from "react";
import { Table, Td, Card, GlobalLoading, Pagination } from "../common";

/**
 * Generic admin data table với:
 *  - Cột tuỳ biến qua `columns` (label + render)
 *  - Selection optional (checkbox header + row, multi-select)
 *  - Loading / empty state built-in
 *  - Pagination tích hợp (page 0-based ở caller, UI 1-based)
 *
 * @param {object} props
 * @param {Array<{key:string,label:any,className?:string,render?:(row:any,idx:number)=>any}>} props.columns
 * @param {Array<any>} props.data
 * @param {(row:any)=>string|number} [props.rowKey]      - default: row.id
 * @param {boolean} [props.loading]
 * @param {string} [props.emptyMessage]
 * @param {string} [props.loadingMessage]
 *
 * // Selection
 * @param {boolean} [props.selectable]                    - bật cột checkbox
 * @param {Array<string|number>} [props.selectedIds]
 * @param {(ids:Array)=>void} [props.onSelectedChange]
 *
 * // Pagination
 * @param {number} [props.page]                            - 0-based
 * @param {number} [props.totalPages]
 * @param {(page:number)=>void} [props.onPageChange]       - nhận page 0-based
 *
 * @param {(row:any)=>string} [props.rowClassName]         - extra cls per row
 * @param {string} [props.cardClassName]                   - cls cho Card wrapper, '' = không wrap Card
 */
const DataTable = ({
    columns = [],
    data = [],
    rowKey = (row) => row.id,
    loading = false,
    emptyMessage = "Không tìm thấy dữ liệu phù hợp",
    loadingMessage = "Đang nạp dữ liệu...",
    selectable = false,
    selectedIds = [],
    onSelectedChange,
    page,
    totalPages,
    onPageChange,
    rowClassName,
    cardClassName = "!p-0 overflow-hidden shadow-sm",
}) => {
    const isAllSelected = data.length > 0 && selectedIds.length === data.length;
    const colCount = columns.length + (selectable ? 1 : 0);

    const toggleAll = (e) => {
        if (!onSelectedChange) return;
        onSelectedChange(e.target.checked ? data.map(rowKey) : []);
    };

    const toggleOne = (id) => {
        if (!onSelectedChange) return;
        onSelectedChange(
            selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]
        );
    };

    const headers = [
        ...(selectable ? [{
            label: (
                <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
            ),
            className: "w-10",
        }] : []),
        ...columns.map((c) => ({ label: c.label, className: c.className })),
    ];

    const tableContent = (
        <>
            <Table headers={headers}>
                {loading ? (
                    <tr>
                        <Td colSpan={colCount}>
                            <GlobalLoading fullScreen={false} message={loadingMessage} />
                        </Td>
                    </tr>
                ) : data.length === 0 ? (
                    <tr>
                        <Td colSpan={colCount} className="text-center py-10 text-slate-400 italic">
                            {emptyMessage}
                        </Td>
                    </tr>
                ) : (
                    data.map((row, idx) => {
                        const id = rowKey(row);
                        const isSelected = selectedIds.includes(id);
                        const extra = rowClassName ? rowClassName(row) : "";
                        return (
                            <tr
                                key={id}
                                className={`hover:bg-slate-50/50 transition-colors ${isSelected ? "bg-sky-50/50" : ""} ${extra}`}
                            >
                                {selectable && (
                                    <Td>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleOne(id)}
                                            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                        />
                                    </Td>
                                )}
                                {columns.map((c) => (
                                    <Td key={c.key} className={c.cellClassName}>
                                        {c.render ? c.render(row, idx) : row[c.key]}
                                    </Td>
                                ))}
                            </tr>
                        );
                    })
                )}
            </Table>

            {totalPages > 0 && onPageChange && (
                <Pagination
                    currentPage={(page ?? 0) + 1}
                    totalPages={totalPages}
                    onPageChange={(p) => onPageChange(Math.max(0, p - 1))}
                />
            )}
        </>
    );

    if (!cardClassName) return tableContent;
    return <Card className={cardClassName}>{tableContent}</Card>;
};

export default DataTable;
