const ACCESS_TOKEN = 'access_token';
const USER_ROLE = 'user_role';
const USER_INFO = 'user_info';

export const storage = {
    // Access Token
    getToken: () => localStorage.getItem(ACCESS_TOKEN),
    setToken: (token) => localStorage.setItem(ACCESS_TOKEN, token),
    removeToken: () => localStorage.removeItem(ACCESS_TOKEN),

    // User Role
    getRole: () => localStorage.getItem(USER_ROLE),
    setRole: (role) => localStorage.setItem(USER_ROLE, role),
    removeRole: () => localStorage.removeItem(USER_ROLE),

    // User Info (Objects)
    getUserInfo: () => {
        const info = localStorage.getItem(USER_INFO);
        try {
            return info ? JSON.parse(info) : null;
        } catch (error) {
            console.error("Failed to parse user info from storage:", error);
            return null;
        }
    },
    setUserInfo: (info) => localStorage.setItem(USER_INFO, JSON.stringify(info)),
    removeUserInfo: () => localStorage.removeItem(USER_INFO),

    // Helper functions
    setAuth: (token, role, info) => {
        if (token) localStorage.setItem(ACCESS_TOKEN, token);
        if (role) localStorage.setItem(USER_ROLE, role);
        if (info) localStorage.setItem(USER_INFO, JSON.stringify(info));
    },
    clearAuth: () => {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(USER_ROLE);
        localStorage.removeItem(USER_INFO);
    }
};

export default storage;
