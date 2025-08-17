import axios from 'axios';

// 환경에 따른 API 기본 URL 설정
const API_BASE_URL = 'https://www.pawnder.site/';

// axios 인스턴스 생성
const api = axios.create({
    baseURL: API_BASE_URL, //https로 변경했음
    withCredentials: true,
    timeout: 10000,
});

// 요청 인터셉터 (요청 전에 실행)
api.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (응답 후에 실행)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export default api; 