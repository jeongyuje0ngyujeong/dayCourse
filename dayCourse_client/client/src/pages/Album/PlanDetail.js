// PlanDetail.js
import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { uploadImage, fetchImage, getPlan } from './AlbumApi.js';
import { saveAs } from 'file-saver';

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
    gap: 10px; /* 간격을 통일되게 설정 */
    justify-content: center; /* 사진을 가운데 정렬 */
`;

const ImageWrapper = styled.div`
    position: relative;
    display: inline-block;
    margin: 5px;
    width: 300px; /* 원하는 너비 설정 */
    height: 300px; /* 원하는 높이 설정 */
`;

const Image = styled.img`
    width: 100%;
    height: 100%;
    object-fit: contain; /* 이미지가 잘리지 않고 전체가 보이도록 설정 */
    border-radius: 5px;
    display: block;
    cursor: pointer; /* 이미지를 클릭할 수 있음을 시각적으로 표시 */
`;

const Checkbox = styled.input`
    position: absolute;
    top: 5px;
    left: 5px;
    transform: scale(1.5);
    z-index: 1;
`;

const DownloadButton = styled.button`
    display: inline-block;
    margin-top: 10px;
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }

    &:disabled {
        background-color: #a5d6a7;
        cursor: not-allowed;
    }
`;

const PlanDetail = () => {
    const { planId } = useParams();
    const [selectedFile, setSelectedFile] = useState(null);
    const [planName, setPlanName] = useState('');
    const [imageUrls, setImageUrls] = useState([]);
    const [creationDate, setCreationDate] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [isDownloading, setIsDownloading] = useState(false);

    const fetchPlanInfo = useCallback(async () => {
        try {
            const allPlans = await getPlan();
            const currentPlan = Array.isArray(allPlans.plans)
                ? allPlans.plans.find(plan => plan.planId === parseInt(planId, 10))
                : null;

            if (currentPlan) {
                setPlanName(currentPlan.planName);
                setCreationDate(currentPlan.dateKey);
            } else {
                console.error("해당 플랜을 찾을 수 없습니다.");
            }
        } catch (error) {
            console.error("플랜 정보 가져오기 에러:", error);
        }
    }, [planId]);

    const fetchImageUrls = useCallback(async () => {
        try {
            const data = await fetchImage(planId);
            setImageUrls(data || []);
        } catch (error) {
            console.error("이미지 목록 가져오기 에러:", error);
        }
    }, [planId]);

    const onFileChange = (event) => {
        const files = event.target.files;
        setSelectedFile(Array.from(files));
    };

    const onSubmit = async (event) => {
        event.preventDefault();

        if (!selectedFile || selectedFile.length === 0) {
            alert('파일을 선택해 주세요.');
            return;
        }

        try {
            await uploadImage(selectedFile, planId);
            fetchImageUrls();
            setSelectedFile([]);
        } catch (error) {
            console.error('업로드 실패:', error);
            alert(`업로드 실패: ${error.response?.data?.message || error.message}`);
        }
    };

    useEffect(() => {
        if (planId) {
            fetchPlanInfo();
            fetchImageUrls();
        }
    }, [planId, fetchImageUrls]);

    const handleImageSelect = (url) => {
        setSelectedImages((prevSelected) => 
            prevSelected.includes(url)
                ? prevSelected.filter((imgUrl) => imgUrl !== url) // 선택 해제
                : [...prevSelected, url] // 선택
        );
    };

    const downloadSelectedImages = async () => {
        if (selectedImages.length === 0) {
            alert('다운로드할 이미지를 선택하세요.');
            return;
        }

        setIsDownloading(true);

        try {
            await Promise.all(selectedImages.map(async (url, index) => {
                const response = await fetch(url, { mode: 'cors' });
                if (!response.ok) {
                    throw new Error(`이미지를 불러오는 데 실패했습니다: ${url}`);
                }
                const blob = await response.blob();
                const fileName = url.substring(url.lastIndexOf('/') + 1) || `image-${index + 1}.jpg`;
                saveAs(blob, fileName);
            }));
            alert('이미지가 성공적으로 다운로드되었습니다.');
        } catch (error) {
            console.error('다운로드 실패:', error);
            alert('이미지를 다운로드하는 중 오류가 발생했습니다.');
        } finally {
            setIsDownloading(false);
        }
    };

    // 이미지 클릭 시 확대하여 보기 위한 상태 및 함수 추가
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState(null);

    const openModal = (url) => {
        setModalImage(url);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalImage(null);
    };

    return (
        <Container>
            <h2>플랜 ID: {planId}</h2>
            <UploadContainer>
                <form onSubmit={onSubmit}>
                    <div>
                        <label>이미지 선택:</label>
                        <input type="file" multiple onChange={onFileChange} required />
                    </div>
                    <button type="submit">업로드</button>
                </form>
            </UploadContainer>

            <ImageContainer>
                {imageUrls.length > 0 ? (
                    imageUrls.map((url, index) => (
                        <ImageWrapper key={index}>
                            <Checkbox
                                type="checkbox"
                                checked={selectedImages.includes(url)}
                                onChange={() => handleImageSelect(url)}
                            />
                            <Image 
                                src={url} 
                                alt={`S3 이미지 ${index}`} 
                                onClick={() => openModal(url)} // 클릭 시 모달 열기
                            />
                        </ImageWrapper>
                    ))
                ) : (
                    <p>이미지 파일 없음</p>
                )}
            </ImageContainer>

            <DownloadButton onClick={downloadSelectedImages} disabled={isDownloading}>
                {isDownloading ? '다운로드 중...' : '선택한 이미지 다운로드'}
            </DownloadButton>

            {/* 이미지 모달 */}
            {isModalOpen && (
                <ModalOverlay onClick={closeModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <img src={modalImage} alt="확대된 이미지" />
                        <CloseButton onClick={closeModal}>닫기</CloseButton>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Container>
    );
};

// 모달 스타일링
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    position: relative;
    max-width: 90%;
    max-height: 90%;
    img {
        width: 100%;
        height: auto;
        border-radius: 5px;
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    background: #ff4d4d;
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-size: 16px;
    line-height: 30px;
    text-align: center;

    &:hover {
        background: #e60000;
    }
`;

export default PlanDetail;