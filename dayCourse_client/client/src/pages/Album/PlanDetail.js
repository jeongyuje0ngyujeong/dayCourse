// PlanDetail.js

import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { uploadImage, fetchImage } from './AlbumApi.js';

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
    width: 100px;
    height: 100px;
    margin: 5px;
    border-radius: 5px;
    object-fit: cover; /* 이미지 비율을 유지하면서 영역에 맞게 조절 */
`;

const PlanDetail = ({ userId }) => {
    const { planId } = useParams(); // URL에서 플랜 ID 가져오기
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageUrls, setImageUrls] = useState([]);

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
        setSelectedFile(event.target.files[0]);
    }

    const onSubmit = async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            alert('파일을 선택해줘');
            return;
        }

        console.log('Selected file:', selectedFile); // 파일 확인

        try {
            await uploadImage(selectedFile, planId); // 올바른 매개변수 전달
            fetchImageUrls(); // 이미지 목록 새로고침
            setSelectedFile(null); // 업로드 후 파일 선택 초기화
        } catch (error) {
            console.error('업로드 실패:', error);
            alert(`업로드 실패: ${error.response?.data?.message || error.message}`);
        }
    };

    useEffect(() => {
        if (userId && planId) {
            fetchImageUrls(); // 사용자 ID와 플랜 ID가 설정되면 이미지 목록 가져오기
        }
    }, [userId, planId, fetchImageUrls]);

    return (
        <Container>
            <h2>플랜 ID: {planId}</h2>
            <UploadContainer>
                <form onSubmit={onSubmit}>
                    <div>
                        {/* 필요 시 추가 필드 */}
                    </div>
                    <div>
                        <label>이미지 선택:</label>
                        <input type="file" onChange={onFileChange} required/>
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