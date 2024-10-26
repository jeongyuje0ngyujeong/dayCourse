import axios from 'axios';
// const BASE_URL = 'http://192.168.1.80:5000';
const BASE_URL = process.env.REACT_APP_BASE_URL;  

// const BASE_URL = 'http://localhost:3000'; // 변경된 포트 사용


//모든 플랜 가져오기
export async function getPlan() {
    try {
        const response = await fetch(`${BASE_URL}/home/plans/recent?userId=1`); // 서버에서 모든 플랜 요청
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


//이미지 업로드
export const uploadImage = async (userId, selectedFile) => {
    const formData= new FormData();
    formData.append("userId", userId);      // 사용자 ID 추가
    formData.append("image", selectedFile); // 이미지 파일 추가


    try {
        const response = await axios.post(`${BASE_URL}/images?userId=1`, formData, {
            hearders: {
                "Content-Type" : "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("업로드 실패:", error);
        throw error;
    }
};

// 이미지 가져오기
export const fetchImage = async(userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/images`, {
            params: { name : userId},
        });
        return response.data;
    } catch (error)  {
        console.error("Error fetching images:", error);
        throw error;
    }
}