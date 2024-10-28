import axios from 'axios';
//place 장소의 정보
//placeId 장소 구분하기 위한 ID
// const BASE_URL = 'http://192.168.1.80:5000';
// const BASE_URL = 'http://localhost:3000'; // 변경된 포트 사용
const BASE_URL = process.env.REACT_APP_BASE_URL;  

//기존 장소 불러오기
export const fetchPlace = async (userId, planId) => {
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/place?userId=1`,
         {
            userId,
            planId,
        });
        
    return response.data;

    } catch (error) {
        console.error("기존 장소 불러오기 실패:", error);
        throw error;
    }
}


//장소 추가
export const addPlace = async (userId, planId, place) => {
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/addPlace?userId=1`, {
            userId,
            planId,
            place,
        });
        return response.data;

    } catch (error) {
        console.error("장소 추가 실패:", error);
        throw error;
    }
}





//장소 삭제
export const deletePlace = async (placeId, userId) => {
    try {
        const response = await axios.delete(`${BASE_URL}/home/plan/place?userId=1`, {
            params: {placeId},
        });
        return response.data;

    } catch (error) {
        console.error("장소 삭제 실패:", error);
        throw error;
    }
}


//장소 추천
export const recommendPlace = async (category, keyword) => {
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/recommend_place?userId=1`, {
            category, keyword
        });
        return response.data;
        
    } catch (error) {
        console.error("장소 추천 실패:", error);
        throw error;
    }
}



export const fetchDistance = async (planId) => {
    try {
        console.log("플랜 ID:", planId); // planId 로그 추가
        const response = await axios.post(`${BASE_URL}/home/plan/place_distance?userId=1`, {
            planId,

    });
        return response.data;
    } catch (error) {
        console.error("거리 정보 에러:", error);
        throw error;
    }
};


// PlaceApi.js에 추가
export const updatePlacePriority = async (placeId, priority) => {
    try {
        const response = await axios.post(`${BASE_URL}/home/plan/place/priority?userId=1`, {
            placeId,
            priority,
        });
        return response.data;
    } catch (error) {
        console.error("우선 순위 업데이트 실패:", error);
        throw error;
    }
};

