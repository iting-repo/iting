// src/services/authService.js

// 1. Định nghĩa tài khoản mẫu
const MOCK_DB = [
    {
        email: 'candidate@gmail.com',
        password: '123',
        role: 'candidate',
        name: 'Nguyễn Văn Ứng Viên',
        avatar: 'https://i.pravatar.cc/150?img=11',
        token: 'fake-jwt-token-candidate'
    },
    {
        email: 'hr@company.com',
        password: '123',
        role: 'employer',
        name: 'HR Manager (VNG)',
        avatar: 'https://i.pravatar.cc/150?img=5',
        token: 'fake-jwt-token-employer'
    }
];

const authService = {
    // Hàm login giả lập
    login: async (email, password) => {
        return new Promise((resolve, reject) => {
            console.log("👉 Dữ liệu nhận được:", { email, password });
            console.log("👉 Dữ liệu trong kho (Mock DB):", MOCK_DB);
            // Giả lập độ trễ mạng 1 giây (1000ms)
            setTimeout(() => {
                const user = MOCK_DB.find(u => u.email === email && u.password === password);

                if (user) {
                    // Thành công: Trả về thông tin user (bỏ password ra)
                    const { password, ...userInfo } = user;
                    resolve(userInfo);
                } else {
                    // Thất bại
                    reject({ message: "Email hoặc mật khẩu không đúng!" });
                }
            }, 1000);
        });
    },

    // Hàm logout (nếu cần xử lý server, hiện tại mock thì ko cần)
    logout: () => {
        return Promise.resolve();
    }
};

export default authService;