import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { getPlan, getPhotosForPlan, uploadPhoto } from '../../AlbumApi.js';

const Container = styled.div`
    padding: 20px;
`;

const PhotoContainer = styled.div`
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
`;

const Photo = styled.img`
    width: 100px;
    height: 100px;
    margin: 5px;
    border-radius: 5px;
`;

const UploadContainer = styled.div`
    margin-top: 20px;
`;

const PlanDetail = () => {
    const { planId } = useParams(); // URL에서 플랜 ID 가져오기
    const [photos, setPhotos] = useState([]);
    const [file, setFile] = useState(null);
    const userId = 'user123'; // 예시로 사용자 ID 설정

    // 사진 가져오기
    const fetchPhotos = async () => {
        const fetchedPhotos = await  getPhotosForPlan(planId);
        setPhotos(fetchedPhotos);
    };

    const handleUpload = async () => {
        if (!file) {
            alert('파일을 선택해 주세요.');
            return;
        }

        try {
            const result = await uploadPhoto(planId, userId, file);
            alert(result.message); // 업로드 완료 메시지 표시
            setFile(null); // 업로드 후 파일 초기화
            fetchPhotos(); // 업로드 후 사진 목록 갱신
        } catch (error) {
            console.error('Error uploading photo:', error);
        }
    };

    useEffect(() => {
        fetchPhotos(); // 컴포넌트가 마운트될 때 사진 가져오기
    }, [planId]);

    return (
        <Container>
            <h2>플랜 ID: {planId}</h2>
            <UploadContainer>
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                />
                <button onClick={handleUpload}>사진 업로드</button>
            </UploadContainer>
            <h3>사진 목록</h3>
            <PhotoContainer>
                {photos.map(photo => (
                    <Photo key={photo.id} src={photo.url} alt="Uploaded" />
                ))}
            </PhotoContainer>
        </Container>
    );
};

export default PlanDetail;

