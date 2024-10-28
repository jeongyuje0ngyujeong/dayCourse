import axios from 'axios';

// 기본 URL
const BASE_URL = process.env.REACT_APP_BASE_URL;

// 기존 장소 불러오기
export const fetchPlace = async (userId, planId) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/place?userId=${userId}`, {
            userId,
            planId,
        }, {
            headers: {
                Authorization: `Bearer ${token}`, // Authorization 헤더 추가
            },
        });

        return response.data;

    } catch (error) {
        console.error("기존 장소 불러오기 실패:", error);
        throw error;
    }
};

// 장소 추가
export const addPlace = async (userId, planId, place) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/addPlace?userId=${userId}`, {
            userId,
            planId,
            place,
        }, {
            headers: {
                Authorization: `Bearer ${token}`, // Authorization 헤더 추가
            },
        });
        return response.data;

    } catch (error) {
        console.error("장소 추가 실패:", error);
        throw error;
    }
};

// 장소 삭제
export const deletePlace = async (placeId, userId) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    try {
        const response = await axios.delete(`${BASE_URL}/home/plan/place?userId=${userId}`, {
            params: { placeId },
            headers: {
                Authorization: `Bearer ${token}`, // Authorization 헤더 추가
            },
        });
        return response.data;

    } catch (error) {
        console.error("장소 삭제 실패:", error);
        throw error;
    }
};

// 장소 추천
export const recommendPlace = async (category, keyword) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/recommend_place?userId=${userId}`, {
            category,
            keyword,
        }, {
            headers: {
                Authorization: `Bearer ${token}`, // Authorization 헤더 추가
            },
        });
        return response.data;

    } catch (error) {
        console.error("장소 추천 실패:", error);
        throw error;
    }
};

// 거리 정보 가져오기
export const fetchDistance = async (planId) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    try {
        console.log("플랜 ID:", planId); // planId 로그 추가
        const response = await axios.post(`${BASE_URL}/home/plan/place_distance?userId=${userId}`, {
            planId,
        }, {
            headers: {
                Authorization: `Bearer ${token}`, // Authorization 헤더 추가
            },
        });
        return response.data;
    } catch (error) {
        console.error("거리 정보 에러:", error);
        throw error;
    }
};

// 장소 우선 순위 업데이트
export const updatePlacePriority = async (placeId, priority) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/place/priority?userId=${userId}`, {
            placeId,
            priority,
        }, {
            headers: {
                Authorization: `Bearer ${token}`, // Authorization 헤더 추가
            },
        });
        return response.data;
    } catch (error) {
        console.error("우선 순위 업데이트 실패:", error);
        throw error;
    }
};