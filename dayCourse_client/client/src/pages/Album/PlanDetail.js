import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { uploadImage, fetchImage, getPlan } from './AlbumApi.js';
// import JSZip from 'jszip';
// import { saveAs } from 'file-saver';
import Checkbox from './Checkbox';
import UploadButton from './UploadButton'; // Import 수정된 UploadButton

const Container = styled.div`
    padding: 20px;
`;

const UploadContainer = styled.div`
    margin-top: 20px;
    position: relative; /* UploadButton의 위치를 조정하기 위해 추가 */
`;

const ImageContainer = styled.div`
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
`;

const ImageWrapper = styled.div`
    position: relative;
    display: inline-block;
    margin: 5px;
    width: 300px;
    height: 300px;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 5px;
  display: block;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 10px;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
`;

const DownloadButton = styled.button`
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }
`;

const SelectAllButton = styled.button`
    padding: 10px 15px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #218838;
    }
`;

const PlanDetail = () => {
    const { planId } = useParams();
    const [planName, setPlanName] = useState('');
    const [imageUrls, setImageUrls] = useState([]);
    const [creationDate, setCreationDate] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

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

    const onFilesSelected = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            return;
        }

        // 이미지 파일만 허용
        const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (validFiles.length !== files.length) {
            alert('이미지 파일만 업로드할 수 있습니다.');
            return;
        }

        setIsUploading(true); // 업로드 상태 시작
        try {
            await uploadImage(validFiles, planId);
            await fetchImageUrls();
        } catch (error) {
            console.error('업로드 실패:', error);
            alert(`업로드 실패: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsUploading(false); // 업로드 상태 종료
            event.target.value = ''; // 파일 입력 초기화
        }
    };

    const handleUploadClick = () => {
        document.getElementById('file-input').click(); // 파일 선택창 열기
    };

    useEffect(() => {
        if (planId) {
            fetchPlanInfo();
            fetchImageUrls();
        }
    }, [planId, fetchPlanInfo, fetchImageUrls]);

    const handleImageSelect = (url) => {
        setSelectedImages((prevSelected) => 
            prevSelected.includes(url)
                ? prevSelected.filter((imgUrl) => imgUrl !== url)
                : [...prevSelected, url]
        );
    };

    const downloadSelectedImages = async () => {
        if (selectedImages.length === 0) {
            alert('다운로드할 이미지를 선택하세요.');
            return;
        }

        // const zip = new JSZip();
        // const folder = zip.folder('selected-images');

        try {
            await Promise.all(
                selectedImages.map(async (url, index) => {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    //경은 추가 코드
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `image-${index + 1}.jpg`;
                    document.body.appendChild(link);
                    //link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(link.href);
                    //경은 추가 코드

                    //folder.file(`image-${index + 1}.jpg`, blob);
                })
            );

            // const zipBlob = await zip.generateAsync({ type: 'blob' });
            // saveAs(zipBlob, 'selected-images.zip');
        } catch (error) {
            console.error('다운로드 실패:', error);
            alert('이미지를 다운로드하는 중 오류가 발생했습니다.');
        }
    };

    const selectAllImages = () => {
        setSelectedImages(imageUrls.length === selectedImages.length ? [] : [...imageUrls]);
    };

    return (
        <Container>
            <h2>일정 이름: {planName}</h2>
            <p>생성 날짜: {new Date(creationDate).toLocaleDateString()}</p>
            <UploadContainer>
                {/* 숨겨진 파일 입력 요소 */}
                <input
                    id="file-input"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={onFilesSelected}
                    style={{ display: 'none' }}
                />
                {/* UploadButton을 클릭하면 파일 선택 창이 열림 */}
                <UploadButton onClick={handleUploadClick} isUploading={isUploading} />
                <ButtonContainer>
                    <SelectAllButton onClick={selectAllImages}>
                        {imageUrls.length === selectedImages.length ? "전체 해제" : "전체 선택"}
                    </SelectAllButton>
                    <DownloadButton onClick={downloadSelectedImages}>선택한 이미지 다운로드</DownloadButton>
                </ButtonContainer>
            </UploadContainer>

            <ImageContainer>
                {imageUrls.length > 0 ? (
                    imageUrls.map((url, index) => (
                        <ImageWrapper key={index}>
                            <Checkbox
                                checked={selectedImages.includes(url)}
                                onChange={() => handleImageSelect(url)}
                            />
                            <Image src={url} alt={`S3 이미지 ${index}`} />
                        </ImageWrapper>
                    ))
                ) : (
                    <p>이미지 파일 없음</p>
                )}
            </ImageContainer>
        </Container>
    );
};

export default PlanDetail;