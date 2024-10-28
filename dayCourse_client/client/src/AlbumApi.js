import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL; // API 기본 URL

// 모든 플랜 가져오기
export async function getPlan(userId) {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    try {
        // URL에 userId를 쿼리 매개변수로 포함
        const response = await fetch(`${BASE_URL}/home/plans/recent?userId=${userId}`, {
            headers: {
                Authorization: `Bearer ${token}` 
            }
        }); // 서버에서 모든 플랜 요청

        if (!response.ok) {
            throw new Error('플랜 가져오기 실패');
        }
        const plans = await response.json();
        return plans;
    } catch (error) {
        console.error('Error fetching plans:', error);
        throw error;
    }
}

// 이미지 업로드
export const uploadImage = async (userId, selectedFile) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    const formData = new FormData();
    formData.append("userId", userId);      // 사용자 ID 추가
    formData.append("image", selectedFile); // 이미지 파일 추가

    try {
        const response = await axios.post(`${BASE_URL}/home/plan/${planId}/images`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`
            },
        });
        return response.data;
    } catch (error) {
        console.error("업로드 실패:", error);
        throw error;
    }
};

// 특정 플랜에 있는 이미지 가져오기
export const fetchImage = async (planId) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    try {
        const response = await axios.get(`${BASE_URL}/home/plan/${planId}/images`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching plan images:", error);
        throw error;
    }
};