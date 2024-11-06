// PlanDetail.js

import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { uploadImage, fetchImage, getPlan } from './AlbumApi.js';

const Container = styled.div`
    padding: 20px;
`;

const UploadContainer = styled.div`
    margin-top: 20px;
`;

const ImageContainer = styled.div`
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
`;

const Image = styled.img`
    width: 300px;
    height: 300px;
    margin: 5px;
    border-radius: 5px;
    object-fit: contain; /* 이미지가 잘리지 않고 전체가 보이도록 설정 */
    object-fit: cover; /* 이미지 비율을 유지하면서 영역에 맞게 조절 */
`;

const PlanDetail = ({plans}) => {
    const { planId } = useParams(); // URL에서 플랜 ID 가져오기
    const [selectedFile, setSelectedFile] = useState(null);
    const [planName, setPlanName] = useState(''); // planName 상태 추가
    const [imageUrls, setImageUrls] = useState([]);
    const [creationDate, setCreationDate] = useState('');

    // 플랜 정보 가져오기
    const fetchPlanInfo = useCallback(async () => {
        try {
            const allPlans = await getPlan(); // 모든 플랜을 가져옴
            console.log('Fetched plans:', allPlans); // 반환된 데이터 확인
            console.log('Current planId:', planId); // planId 확인
            
            // allPlans 객체에서 plans 배열을 가져와서 검색
            const currentPlan = Array.isArray(allPlans.plans) 
                ? allPlans.plans.find(plan => plan.planId === parseInt(planId, 10)) 
                : null;
            
            if (currentPlan) {
                setPlanName(currentPlan.planName); // 플랜 이름 설정
                setCreationDate(currentPlan.dateKey); // 생성 날짜 설정 (dateKey 사용)
            } else {
                console.error("해당 플랜을 찾을 수 없습니다.");
            }
        } catch (error) {
            console.error("플랜 정보 가져오기 에러:", error);
        }
    }, [planId]);
    // 이미지 목록 가져오기
    const fetchImageUrls = useCallback(async () => {
        try {
            const data = await fetchImage(planId); // 올바른 매개변수 전달
            console.log('Fetched image data:', data); // 응답 데이터 확인
            setImageUrls(data || []); // 서버 응답 형식에 맞게 조정
        } catch (error) {
            console.error("이미지 목록 가져오기 에러:", error);
        }
    }, [planId]);

    const onFileChange = (event) => {
        const files = event.target.files;
        setSelectedFile(Array.from(files)); // 배열로 변환하여 상태에 저장
    }
    
    const onSubmit = async (event) => {
        event.preventDefault();
    
        if (!selectedFile || selectedFile.length === 0) {
            alert('파일을 선택해줘');
            return;
        }
    
        try {
            await uploadImage(selectedFile, planId); // 다중 파일 업로드 함수 호출
            fetchImageUrls(); // 이미지 목록 새로고침
            setSelectedFile([]); // 업로드 후 파일 선택 초기화
        } catch (error) {
            console.error('업로드 실패:', error);
            alert(`업로드 실패: ${error.response?.data?.message || error.message}`);
        }
    };
    

    useEffect(() => {
        if (planId) {
            fetchPlanInfo(); // 플랜 정보 가져오기
            fetchImageUrls(); // 이미지 목록 가져오기
        }
    }, [planId, fetchPlanInfo, fetchImageUrls]);

    return (
        <Container>
            <h2>일정 이름: {planName}</h2>
            <p>생성 날짜: {new Date(creationDate).toLocaleDateString()}</p>
            <UploadContainer>
                <form onSubmit={onSubmit}>
                    <div>
                        {/* 필요 시 추가 필드 */}
                    </div>
                    <div>
                        <label>이미지 선택:</label>
                        <input type="file" multiple onChange={onFileChange} required/>
                    </div>
                    <button type="submit">업로드</button>
                </form>
            </UploadContainer>

            <h3>사진 목록</h3>
            <ImageContainer>
                {imageUrls.length > 0 ? (
                    imageUrls.map((url, index) => (
                        <Image key={index} src={url} alt={`S3 이미지 ${index}`} />
                    ))
                ) : (
                    <p>이미지 파일 없음</p>
                )}
            </ImageContainer>
        </Container>
    );
};

export default PlanDetail;