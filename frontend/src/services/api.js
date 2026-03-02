import axios from 'axios';

// Konfigurasi dasar Axios
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // URL Backend Laravel Anda
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor untuk menyisipkan token Authorization di setiap request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
