/**
 * Normalize a string value: trim, collapse whitespace, convert blank to empty.
 * Safe to call on any value (returns non-strings unchanged).
 */
export const normalizeString = (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim().replace(/\s+/g, ' ');
    return trimmed || '';
};

/**
 * Recursively normalize all string values in an object.
 * Useful for cleaning entire form data before submission.
 *
 * @example
 *   normalizeFormData({ name: '  Nguyen   Van   A  ', email: '  test@mail.com ' })
 *   // { name: 'Nguyen Van A', email: 'test@mail.com' }
 */
export const normalizeFormData = (data) => {
    if (data === null || data === undefined) return data;
    if (typeof data === 'string') return normalizeString(data);
    if (Array.isArray(data)) return data.map(normalizeFormData);
    if (typeof data === 'object') {
        return Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, normalizeFormData(value)])
        );
    }
    return data;
};

/**
 * React Hook Form onBlur handler that trims the input value.
 * Usage: <input {...register('name')} onBlur={trimOnBlur} />
 */
export const trimOnBlur = (e) => {
    const { value } = e.target;
    if (typeof value === 'string') {
        e.target.value = normalizeString(value);
    }
};
