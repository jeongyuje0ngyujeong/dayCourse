import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// axios 인스턴스를 생성
const api = axios.create({
    baseURL: 'https://api.example.com', // API 기본 URL 설정
    headers: {
        'Content-Type': 'application/json',
    },
});

export function setupAxiosInterceptors(navigate) {
    // 응답 에러를 가로채는 인터셉터 설정
    api.interceptors.response.use(
        response => response,
        error => {
            if (error.response && error.response.status === 401) {
                // 401 에러일 때 로그인 페이지로 이동
                navigate('/login');
            }
            return Promise.reject(error);
        }
    );
}

export default api;
