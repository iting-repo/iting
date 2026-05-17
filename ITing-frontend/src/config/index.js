const FALLBACK_LOCAL_API_ORIGIN = 'http://localhost:8080';

const normalizeApiOrigin = (value) => {
    if (!value) {
        return value;
    }

    return value
        .trim()
        .replace(/\/$/, '')
        .replace(/\/api$/, '');
};

const resolveApiOrigin = () => {
    const configuredOrigin = normalizeApiOrigin(import.meta.env.VITE_API_BASE);
    if (configuredOrigin) {
        return configuredOrigin;
    }

    if (typeof window !== 'undefined') {
        const { hostname, origin } = window.location;
        if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return origin;
        }
    }

    return FALLBACK_LOCAL_API_ORIGIN;
};

const API_ORIGIN = resolveApiOrigin();
const API_BASE_URL = `${API_ORIGIN}/api`;

export {
    API_ORIGIN,
    API_BASE_URL,
};
