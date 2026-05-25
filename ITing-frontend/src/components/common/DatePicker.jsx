import React, { useMemo, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { toast } from "sonner";

/**
 * Helpers
 */
export const toIsoDate = (d) => {
    if (!d) return "";
    if (typeof d === "string") return d.slice(0, 10);
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return "";
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

export const todayIso = () => toIsoDate(new Date());

const addDays = (iso, days) => {
    const d = new Date(iso);
    d.setDate(d.getDate() + days);
    return toIsoDate(d);
};

/**
 * Single date picker — wrapper quanh <input type="date"> với style nhất quán
 * project, hỗ trợ `blockFuture` (đa số case báo cáo) và label optional.
 *
 * @param {object} props
 * @param {string} props.value         - ISO yyyy-MM-dd
 * @param {(v:string)=>void} props.onChange
 * @param {string} [props.min]         - ISO min (inclusive)
 * @param {string} [props.max]         - ISO max (inclusive)
 * @param {boolean} [props.blockFuture] - shortcut: max = today
 * @param {string} [props.label]
 * @param {string} [props.placeholder]
 * @param {boolean} [props.required]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]   - thêm vào input
 * @param {string} [props.wrapperClassName]
 * @param {string} [props.size]        - 'sm' | 'md' (default md)
 */
const DatePicker = ({
    value,
    onChange,
    min,
    max,
    blockFuture = false,
    label,
    required = false,
    disabled = false,
    className = "",
    wrapperClassName = "",
    size = "md",
}) => {
    const effectiveMax = blockFuture ? (max ? (max < todayIso() ? max : todayIso()) : todayIso()) : max;

    const handleChange = (e) => {
        const v = e.target.value;
        if (!v) {
            onChange?.("");
            return;
        }
        if (effectiveMax && v > effectiveMax) {
            toast.warning(blockFuture ? "Không thể chọn ngày tương lai" : `Ngày phải ≤ ${effectiveMax}`);
            return;
        }
        if (min && v < min) {
            toast.warning(`Ngày phải ≥ ${min}`);
            return;
        }
        onChange?.(v);
    };

    const sizeCls = size === "sm" ? "py-1.5 text-xs" : "py-2 text-sm";

    return (
        <div className={`flex flex-col ${wrapperClassName}`}>
            {label && (
                <label className="text-xs font-medium text-gray-600 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
                <input
                    type="date"
                    value={value || ""}
                    onChange={handleChange}
                    min={min}
                    max={effectiveMax}
                    required={required}
                    disabled={disabled}
                    className={`pl-9 pr-3 ${sizeCls} rounded-lg border border-gray-200 bg-white focus:border-[#3AB4E6] focus:ring-2 focus:ring-[#3AB4E6]/10 outline-none transition-all w-full ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
                />
            </div>
        </div>
    );
};

/**
 * Date range picker với preset shortcuts (7d/30d/90d/365d/YTD/Custom).
 *
 * @param {object} props
 * @param {string} props.from
 * @param {string} props.to
 * @param {(range:{from:string,to:string})=>void} props.onChange - bắn cả 2 cùng lúc khi 1 đầu thay đổi
 * @param {boolean} [props.blockFuture]    - chặn future cho cả from + to
 * @param {boolean} [props.showPresets]    - hiện hàng preset shortcut (default true)
 * @param {string[]} [props.presets]       - subset preset hiện ('7d','30d','90d','365d','ytd')
 * @param {string} [props.className]
 */
export const DateRangePicker = ({
    from,
    to,
    onChange,
    blockFuture = true,
    showPresets = true,
    presets = ["7d", "30d", "90d", "365d", "ytd"],
    className = "",
}) => {
    const today = todayIso();
    const [activePreset, setActivePreset] = useState(null);

    const presetOpts = useMemo(() => ({
        "7d":   { label: "7 ngày",   from: addDays(today, -6) },
        "30d":  { label: "30 ngày",  from: addDays(today, -29) },
        "90d":  { label: "90 ngày",  from: addDays(today, -89) },
        "365d": { label: "1 năm",    from: addDays(today, -364) },
        "ytd":  { label: "Từ đầu năm", from: `${new Date().getFullYear()}-01-01` },
    }), [today]);

    const applyPreset = (key) => {
        const p = presetOpts[key];
        if (!p) return;
        setActivePreset(key);
        onChange?.({ from: p.from, to: today });
    };

    const handleFrom = (v) => {
        setActivePreset(null);
        if (to && v && v > to) {
            toast.warning("Ngày bắt đầu phải ≤ ngày kết thúc");
            return;
        }
        onChange?.({ from: v, to });
    };

    const handleTo = (v) => {
        setActivePreset(null);
        if (from && v && v < from) {
            toast.warning("Ngày kết thúc phải ≥ ngày bắt đầu");
            return;
        }
        onChange?.({ from, to: v });
    };

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            {showPresets && (
                <div className="flex flex-wrap items-center gap-1 mr-1">
                    {presets.map((key) => {
                        const p = presetOpts[key];
                        if (!p) return null;
                        const active = activePreset === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => applyPreset(key)}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                                    active
                                        ? "bg-[#3AB4E6] text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                {p.label}
                            </button>
                        );
                    })}
                </div>
            )}
            <DatePicker
                value={from}
                onChange={handleFrom}
                max={to || (blockFuture ? today : undefined)}
                blockFuture={blockFuture}
                size="sm"
            />
            <span className="text-gray-400 text-xs">→</span>
            <DatePicker
                value={to}
                onChange={handleTo}
                min={from}
                blockFuture={blockFuture}
                size="sm"
            />
        </div>
    );
};

export default DatePicker;
