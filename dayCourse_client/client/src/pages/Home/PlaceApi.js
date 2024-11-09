import axios from 'axios';

// 기본 URL
const BASE_URL = process.env.REACT_APP_BASE_URL;

// 기존 장소 불러오기
export const fetchPlace = async (userId, planId) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/place`, {
            planId,
            userId, // userId를 본문에 포함
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;

    } catch (error) {
        console.error("기존 장소 불러오기 실패:", error.response?.data || error.message); // 에러 메시지 추가
        throw error;
    }
};

// 장소 추가
export const addPlace = async (userId, planId, place) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/addPlace`, {
            planId,
            place,
            userId, // userId를 본문에 포함
        }, {
            headers: {
                Authorization: `Bearer ${token}`, // Authorization 헤더 추가
            },
        });
        return response.data;

    } catch (error) {
        console.error("장소 추가 실패:", error.response?.data || error.message); // 에러 메시지 추가
        throw error;
    }
};

// 장소 삭제
export const deletePlace = async (placeId, userId) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    try {
        const response = await axios.delete(`${BASE_URL}/home/plan/place`, {
            headers: {
                Authorization: `Bearer ${token}`, // Authorization 헤더 추가
            },
            params: { // params에 placeId와 userId를 포함
                placeId,
                userId,
            },
        });
        return response.data;

    } catch (error) {
        console.error("장소 삭제 실패:", error.response?.data || error.message); // 에러 메시지 추가
        throw error;
    }
};

// 거리 정보 가져오기
export const fetchDistance = async (planId, userId) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    try {
        console.log("플랜 ID:", planId);
        const response = await axios.post(`${BASE_URL}/home/plan/place_distance`, {
            planId,
            userId, // userId를 본문에 포함
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("거리 정보 에러:", error.response?.data || error.message); // 에러 메시지 추가
        throw error;
    }
};

// 우선 순위 업데이트
export const updatePlacePriority = async (placeId, priority, userId, version) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/place/priority`, {
            placeId,
            priority,
            userId, 
            version,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("우선 순위 업데이트 실패:", error.response?.data || error.message); // 에러 메시지 추가
        throw error;
    }
};





// 장소 추천
export const recommendPlace = async (category, keyword=null) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    const userId = sessionStorage.getItem('userId');

    const enCategory = encodeURIComponent(category);
    const enKeyword = keyword ? encodeURIComponent(keyword) : null;

    let endpoint = `${BASE_URL}/home/plan/${enCategory}`;
    if (enKeyword) {
        endpoint += `/${enKeyword}`;
    }

    try {
        const response = await axios.post(
            endpoint, 
        {},
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // Authorization 헤더 추가
            },
            params:{
                userId,
            }
        });
        return response.data.place;

    } catch (error) {
        console.error("장소 추천 실패:", error);
        throw error;
    }
};





// 추천 장소 추가 시 사용
export const addRecommendedPlace = async (userId, planId, place) => {
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/addRecommendedPlace`, {
            userId,
            planId,
            place_name: place.place_name,
            address_name: place.address_name,
            l_priority: place.l_priority || 1,
            X: place.X || place.x,
            Y: place.Y || place.y,

        });
        return response.data;
    } catch (error) {
        console.error('추천 장소 추가 실패: ', error.response ? error.response.data : error.message);
        throw error;
    }
};
//루트 추천
export const recommendRoutes = async (planId, version) => {
    const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/recommend_routes`, {
            planId, 
            version
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("루트 추천 실패:", error);
        throw error;
    }
};

