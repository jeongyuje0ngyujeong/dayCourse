const BASE_URL = 'http://3.34.40.16'; 
// const BASE_URL = 'http://localhost:5001'; // 변경된 포트 사용


// 모든 플랜 가져오기
export async function getPlan() {
    try {
        const response = await fetch(`${BASE_URL}/plan`); // 서버에서 모든 플랜 요청
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

// 특정 플랜 ID에 대한 사진 가져오기
export async function getPhotosForPlan(planId) {
    try {
        const response = await fetch(`${BASE_URL}/album/${planId}`);
        if (!response.ok) {
            throw new Error('사진 가져오기 실패');
        }
        const photos = await response.json();
        return photos;
    } catch (error) {
        console.error('Error fetching photos:', error);
        throw error;
    }
}

// 자기 사진 등록
export async function uploadPhoto(planId, userId, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('planId', planId);
    formData.append('userId', userId);

    try {
        const response = await fetch(`${BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('사진 업로드 실패');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('포토 업로드 에러', error);
        throw error;
    }
}