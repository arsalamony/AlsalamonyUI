import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7112";

export const http = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

// أي request بعد login هيتحط له Authorization تلقائيًا
http.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

http.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;

        if (status === 401) {
            // token invalid/expired
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("userId");
            localStorage.removeItem("name");

            // لو مش حابب تعمل window.location خليها بعدين مع react-router
            window.location.href = "/login";
        }

        return Promise.reject(err);
    },
);

