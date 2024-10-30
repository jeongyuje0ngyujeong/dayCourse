import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL; // API 기본 URL

// 모든 플랜 가져오기
export async function getPlan() {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    const userId = sessionStorage.getItem('userId'); // userId를 세션 저장소에서 가져옴

    // userId가 없는 경우 에러 처리
    if (!userId) {
        throw new Error('사용자 ID가 정의되지 않았습니다.');
    }

    try {
        // URL에 userId를 쿼리 매개변수로 포함
        const response = await axios.get(`${BASE_URL}/home/plans/recent`, {
            headers: {
                Authorization: `Bearer ${token}`, 
            },
            params: {
                userId, // userId를 쿼리 매개변수로 포함
            }
        }); // 서버에서 모든 플랜 요청

        return response.data; // axios는 자동으로 JSON 변환

    } catch (error) {
        console.error('Error fetching plans:', error.response ? error.response.data : error);
        throw error;
    }
}

// 이미지 업로드
export const uploadImage = async (selectedFile, planId) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    const userId = sessionStorage.getItem('userId'); // userId를 세션 저장소에서 가져옴

    if (!userId) {
        throw new Error('사용자 ID가 정의되지 않았습니다.');
    }

    const formData = new FormData();
    formData.append("userId", userId);      // 사용자 ID 추가
    formData.append("image", selectedFile); // 이미지 파일 추가

    // 디버깅: FormData 내용 확인
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }

    try {
        const response = await axios.post(`${BASE_URL}/home/plan/${planId}/images`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`
            },
        });
        return response.data;
    } catch (error) {
        console.error("업로드 실패:", error.response ? error.response.data : error);
        throw error;
    }
};

// 특정 플랜에 있는 이미지 가져오기
export const fetchImage = async (planId) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    const userId = sessionStorage.getItem('userId'); // userId를 세션 저장소에서 가져옴

    if (!userId) {
        throw new Error('사용자 ID가 정의되지 않았습니다.');
    }

    try {
        const response = await axios.get(`${BASE_URL}/home/plan/${planId}/images`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                userId, // userId를 쿼리 매개변수로 포함
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching plan images:", error.response ? error.response.data : error);
        throw error;
    }
};



// 모먼트 가져오기
export async function getMoment() {
    const userId = sessionStorage.getItem('userId');
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    if (!userId) {
        throw new Error('사용자 ID가 정의되지 않았습니다.');
    }

    try {
        const response = await axios.get(`${BASE_URL}/home/plan/moment`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                userId 
            },
        });
        console.log('응답', response.data);
        return response.data; // 서버 응답 구조에 따라 수정 필요
    } catch (error) {
        console.error('Error fetching moments:', error.response ? error.response.data : error);
        throw error;
    }
}