import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { uploadImage, fetchImage } from '../../AlbumApi.js';

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
`;

const PlanDetail = () => {
    const { planId } = useParams(); // URL에서 플랜 ID 가져오기

    const [selectedFile, setSelectedFile] = useState(null);
    const [userId, setUserId] = useState("")
    const [imageUrls, setImageUrls] = useState([]);


    // 이미지 목록 가져오기
    const fetchImageUrls = useCallback(async () => {
        try {
            const data = await fetchImage(userId);
            setImageUrls(data);
        } catch (error) {
            console.error("이미지 목록 가져오기 에러:", error);
        }
    }, [userId]); // userId를 의존성으로 추가


    const onFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    }


    const onSubmit = async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            alert('파일을 선택해줘');
            return;
        }

        try {
            const response = await uploadImage(userId, selectedFile);
            console.log('서버 응답:', response);
            fetchImageUrls(null);
        } catch(error) {
            console.error('업로드 실패:', error);
        }
    };
    useEffect(() => {
        if (userId) {
            fetchImageUrls(); // 사용자 ID가 설정되면 이미지 목록 가져오기
        }
    }, [userId, fetchImageUrls]); // fetchImageUrls를 의존성으로 추가


    return (
        <Container>
            <h2>플랜 ID: {planId}</h2>
            <UploadContainer>
                <form onSubmit={onSubmit}>
                    <div>
                        <label>사용자 ID:</label>
                        <input  
                            type="text"
                            value={userId}
                            onChange={(e)=> setUserId(e.target.value)}
                            required
                        />
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
                        <Image key={index} src={url} alt = {`S3 이미지 ${index}`} />
                    ))
                ) : (
                    <p>이미지 파일 없음</p>
                
                )}
            </ImageContainer>
        </Container>
    )
};

export default PlanDetail;

