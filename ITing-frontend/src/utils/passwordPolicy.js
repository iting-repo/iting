/**
 * Password policy duy nhất cho cả app — đồng bộ với
 * @StrongPassword bên BE (com.iting.jobportal.common.validation).
 *
 * Rule: ≥ 8 ký tự, có chữ HOA, chữ thường, số. KHÔNG ép ký tự đặc biệt
 * (NIST 800-63B khuyến nghị bỏ).
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;

/**
 * @param {string} pw
 * @returns {{ valid: boolean, errors: string[], score: 0|1|2|3|4, checks: {length:boolean, upper:boolean, lower:boolean, digit:boolean} }}
 */
export function validatePassword(pw) {
    const password = pw || "";
    const checks = {
        length: password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        digit: /\d/.test(password),
    };
    const errors = [];
    if (!checks.length) errors.push(`Ít nhất ${PASSWORD_MIN_LENGTH} ký tự`);
    if (!checks.upper) errors.push("Phải có chữ HOA");
    if (!checks.lower) errors.push("Phải có chữ thường");
    if (!checks.digit) errors.push("Phải có số");

    const score = Object.values(checks).filter(Boolean).length; // 0..4
    return { valid: errors.length === 0, errors, score, checks };
}

/** Lấy lỗi đầu tiên để hiển thị trong field error inline (ngắn gọn). */
export function firstPasswordError(pw) {
    const { errors } = validatePassword(pw);
    return errors[0] || null;
}
