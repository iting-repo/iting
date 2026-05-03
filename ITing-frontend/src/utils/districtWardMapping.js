/**
 * Mapping quận/huyện cũ → danh sách phường mới sau sáp nhập 1/7/2025.
 *
 * Nguồn: Nghị quyết 1685/NQ-UBTVQH15 năm 2025 của Ủy ban Thường vụ Quốc hội
 * về việc sắp xếp đơn vị hành chính cấp xã.
 *
 * Phạm vi cover hiện tại: các quận trung tâm TP.HCM và Hà Nội (nơi tập trung
 * phần lớn việc làm IT). Bổ sung thêm khi cần — chú ý dữ liệu là 1-nhiều
 * (1 quận cũ → nhiều phường mới).
 *
 * TODO: bổ sung thêm Đà Nẵng, Hải Phòng, Bình Dương cũ (nay TP.HCM mở rộng), v.v.
 */

const stripPrefix = (s = '') => String(s)
    .replace(/^(Tỉnh|Thành phố|TP\.?|Thành Phố)\s+/i, '')
    .replace(/^(Phường|Xã|Thị trấn|Quận|Huyện)\s+/i, '')
    .trim()
    .toLowerCase();

const buildKey = (district, province) => `${stripPrefix(district)}|${stripPrefix(province)}`;

// inProvinceAlias: chấp nhận nhiều dạng tên tỉnh cũ để key match dễ hơn
const RAW_MAPPING = [
    // ============================================================
    // TP. HỒ CHÍ MINH (giữ tên sau khi sáp nhập Bình Dương + BR-VT)
    // ============================================================
    {
        district: 'Quận 1',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: ['Phường Sài Gòn', 'Phường Tân Định', 'Phường Bến Thành', 'Phường Cầu Ông Lãnh'],
    },
    {
        district: 'Quận 3',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: ['Phường Bàn Cờ', 'Phường Xuân Hòa', 'Phường Nhiêu Lộc'],
    },
    {
        district: 'Quận 4',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: ['Phường Vĩnh Hội', 'Phường Khánh Hội', 'Phường Xóm Chiếu'],
    },
    {
        district: 'Quận 5',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: ['Phường Chợ Quán', 'Phường An Đông', 'Phường Chợ Lớn'],
    },
    {
        district: 'Quận 6',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: ['Phường Bình Tiên', 'Phường Bình Tây', 'Phường Phú Lâm'],
    },
    {
        district: 'Quận 7',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: ['Phường Tân Mỹ', 'Phường Tân Hưng', 'Phường Tân Thuận', 'Phường Phú Thuận'],
    },
    {
        district: 'Quận 8',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: ['Phường Chánh Hưng', 'Phường Bình Đông', 'Phường Phú Định', 'Phường Rạch Ông'],
    },
    {
        district: 'Quận 10',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: ['Phường Vườn Lài', 'Phường Hòa Hưng', 'Phường Diên Hồng'],
    },
    {
        district: 'Quận 11',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: ['Phường Bình Thới', 'Phường Hòa Bình', 'Phường Minh Phụng'],
    },
    {
        district: 'Quận 12',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: [
            'Phường An Phú Đông',
            'Phường Đông Hưng Thuận',
            'Phường Trung Mỹ Tây',
            'Phường Tân Thới Hiệp',
            'Phường Thới An',
        ],
    },
    {
        district: 'Bình Thạnh',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: [
            'Phường Gia Định',
            'Phường Bình Lợi Trung',
            'Phường Bình Thạnh',
            'Phường Thanh Đa',
            'Phường Bình Quới',
            'Phường Hạnh Thông Tây',
        ],
    },
    {
        district: 'Gò Vấp',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: [
            'Phường Hạnh Thông',
            'Phường An Hội Tây',
            'Phường An Hội Đông',
            'Phường Gò Vấp',
            'Phường An Nhơn',
            'Phường Thông Tây Hội',
        ],
    },
    {
        district: 'Phú Nhuận',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: ['Phường Phú Nhuận', 'Phường Đức Nhuận', 'Phường Cầu Kiệu'],
    },
    {
        district: 'Tân Bình',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: [
            'Phường Tân Sơn Hòa',
            'Phường Tân Hòa',
            'Phường Bảy Hiền',
            'Phường Tân Sơn',
            'Phường Tân Sơn Nhất',
        ],
    },
    {
        district: 'Tân Phú',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: [
            'Phường Tân Sơn Nhì',
            'Phường Tân Phú',
            'Phường Phú Thọ Hòa',
            'Phường Tây Thạnh',
        ],
    },
    {
        district: 'Bình Tân',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: [
            'Phường Bình Hưng Hòa',
            'Phường Bình Trị Đông',
            'Phường An Lạc',
            'Phường Tân Tạo',
        ],
    },
    {
        district: 'Thủ Đức',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: [
            'Phường Thủ Đức',
            'Phường Hiệp Bình',
            'Phường Tam Bình',
            'Phường Linh Xuân',
            'Phường Long Bình',
            'Phường Long Phước',
            'Phường Long Trường',
            'Phường Tăng Nhơn Phú',
            'Phường Phước Long',
            'Phường Cát Lái',
            'Phường An Khánh',
            'Phường Bình Trưng',
        ],
    },
    {
        district: 'Quận 2',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: ['Phường An Khánh', 'Phường Bình Trưng', 'Phường Cát Lái'],
    },
    {
        district: 'Quận 9',
        provinces: ['Hồ Chí Minh', 'TP Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
        newProvince: 'Thành phố Hồ Chí Minh',
        wards: [
            'Phường Long Bình',
            'Phường Long Phước',
            'Phường Long Trường',
            'Phường Tăng Nhơn Phú',
            'Phường Phước Long',
        ],
    },

    // ============================================================
    // HÀ NỘI (giữ tên)
    // ============================================================
    {
        district: 'Hoàn Kiếm',
        provinces: ['Hà Nội', 'Thành phố Hà Nội'],
        newProvince: 'Thành phố Hà Nội',
        wards: ['Phường Hoàn Kiếm'],
    },
    {
        district: 'Ba Đình',
        provinces: ['Hà Nội', 'Thành phố Hà Nội'],
        newProvince: 'Thành phố Hà Nội',
        wards: ['Phường Ba Đình', 'Phường Ngọc Hà', 'Phường Giảng Võ'],
    },
    {
        district: 'Đống Đa',
        provinces: ['Hà Nội', 'Thành phố Hà Nội'],
        newProvince: 'Thành phố Hà Nội',
        wards: [
            'Phường Đống Đa',
            'Phường Văn Miếu - Quốc Tử Giám',
            'Phường Kim Liên',
            'Phường Ô Chợ Dừa',
            'Phường Láng',
        ],
    },
    {
        district: 'Hai Bà Trưng',
        provinces: ['Hà Nội', 'Thành phố Hà Nội'],
        newProvince: 'Thành phố Hà Nội',
        wards: ['Phường Hai Bà Trưng', 'Phường Vĩnh Tuy', 'Phường Bạch Mai', 'Phường Hồng Hà'],
    },
    {
        district: 'Cầu Giấy',
        provinces: ['Hà Nội', 'Thành phố Hà Nội'],
        newProvince: 'Thành phố Hà Nội',
        wards: ['Phường Cầu Giấy', 'Phường Yên Hòa', 'Phường Nghĩa Đô'],
    },
    {
        district: 'Thanh Xuân',
        provinces: ['Hà Nội', 'Thành phố Hà Nội'],
        newProvince: 'Thành phố Hà Nội',
        wards: ['Phường Thanh Xuân', 'Phường Khương Đình', 'Phường Phương Liệt'],
    },
    {
        district: 'Tây Hồ',
        provinces: ['Hà Nội', 'Thành phố Hà Nội'],
        newProvince: 'Thành phố Hà Nội',
        wards: ['Phường Tây Hồ', 'Phường Phú Thượng', 'Phường Xuân La'],
    },
    {
        district: 'Long Biên',
        provinces: ['Hà Nội', 'Thành phố Hà Nội'],
        newProvince: 'Thành phố Hà Nội',
        wards: ['Phường Long Biên', 'Phường Việt Hưng', 'Phường Bồ Đề', 'Phường Phúc Lợi'],
    },
    {
        district: 'Hà Đông',
        provinces: ['Hà Nội', 'Thành phố Hà Nội'],
        newProvince: 'Thành phố Hà Nội',
        wards: ['Phường Hà Đông', 'Phường Phú Lương', 'Phường Yên Nghĩa'],
    },
    {
        district: 'Nam Từ Liêm',
        provinces: ['Hà Nội', 'Thành phố Hà Nội'],
        newProvince: 'Thành phố Hà Nội',
        wards: ['Phường Từ Liêm', 'Phường Đại Mỗ', 'Phường Tây Mỗ', 'Phường Xuân Phương'],
    },
    {
        district: 'Bắc Từ Liêm',
        provinces: ['Hà Nội', 'Thành phố Hà Nội'],
        newProvince: 'Thành phố Hà Nội',
        wards: ['Phường Phú Diễn', 'Phường Tây Tựu', 'Phường Đông Ngạc'],
    },
    {
        district: 'Hoàng Mai',
        provinces: ['Hà Nội', 'Thành phố Hà Nội'],
        newProvince: 'Thành phố Hà Nội',
        wards: ['Phường Hoàng Liệt', 'Phường Tương Mai', 'Phường Định Công', 'Phường Vĩnh Hưng'],
    },
];

// Build lookup map: "<oldDistrict>|<oldProvince>" → entry
const LOOKUP = (() => {
    const map = new Map();
    RAW_MAPPING.forEach((entry) => {
        entry.provinces.forEach((prov) => {
            map.set(buildKey(entry.district, prov), entry);
        });
    });
    return map;
})();

/**
 * Tra cứu danh sách phường mới có thể tương ứng với 1 quận/huyện cũ.
 * Trả về `null` nếu không có trong mapping.
 *
 * @param {string} oldDistrict - Tên quận/huyện cũ (vd. "Quận 1", "Bình Thạnh")
 * @param {string} oldProvince - Tên tỉnh cũ (vd. "Hồ Chí Minh", "Hà Nội")
 * @returns {{newProvince: string, wards: string[]} | null}
 */
export const lookupMergedWards = (oldDistrict, oldProvince) => {
    if (!oldDistrict || !oldProvince) return null;
    const key = buildKey(oldDistrict, oldProvince);
    const entry = LOOKUP.get(key);
    if (!entry) return null;
    return {
        newProvince: entry.newProvince,
        wards: entry.wards,
    };
};

export default lookupMergedWards;
