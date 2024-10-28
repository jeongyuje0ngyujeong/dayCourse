import axios from 'axios';

// 기본 URL
const BASE_URL = process.env.REACT_APP_BASE_URL;

// 기존 장소 불러오기
export const fetchPlace = async (planId) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    const userId = sessionStorage.getItem('userId'); // userId를 세션 저장소에서 가져옴
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/place`, {
            planId,
        }, {
            headers: {
                Authorization: `Bearer ${token}`, // Authorization 헤더 추가
            },
            params: {
                userId,
            }
        });

        return response.data;

    } catch (error) {
        console.error("기존 장소 불러오기 실패:", error);
        throw error;
    }
};

// 장소 추가
export const addPlace = async (planId, place) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    const userId = sessionStorage.getItem('userId');
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/addPlace`, {
            planId,
            place,
        }, {
            headers: {
                Authorization: `Bearer ${token}`, // Authorization 헤더 추가
            },
            params : {
                userId,
            }
        });
        return response.data;

    } catch (error) {
        console.error("장소 추가 실패:", error);
        throw error;
    }
};

// 장소 삭제
export const deletePlace = async (placeId) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    const userId = sessionStorage.getItem('userId');
    try {
        const response = await axios.delete(`${BASE_URL}/home/plan/place`, {
            params: { placeId, userId },
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
    const userId = sessionStorage.getItem('userId');
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/recommend_place`, {
            category,
            keyword,
        }, {
            headers: {
                Authorization: `Bearer ${token}`, // Authorization 헤더 추가
            },
            params:{
                userId,
            }
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
    const userId = sessionStorage.getItem('userId');
    try {
        console.log("플랜 ID:", planId); // planId 로그 추가
        const response = await axios.post(`${BASE_URL}/home/plan/place_distance`, {
            planId,
        }, {
            headers: {
                Authorization: `Bearer ${token}`, // Authorization 헤더 추가
            },
            params:{
                userId,
            }
        });
        return response.data;
    } catch (error) {
        console.error("거리 정보 에러:", error);
        throw error;
    }
};

// 장소 우선 순위 업데이트
export const updatePlacePriority = async (placeId, priority, version) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    const userId = sessionStorage.getItem('userId');
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/place/priority`, {
            placeId,
            priority,
            version,
        }, {
            headers: {
                Authorization: `Bearer ${token}`, // Authorization 헤더 추가
            },
            params: {
                userId,
            }
        });

        if (response.status === 409) {
            throw new Error('충돌 발생: 데이터가 이미 수정됨');
        }
        return response.data;
    } catch (error) {
        console.error("우선 순위 업데이트 실패:", error);
        throw error; 
    }
};