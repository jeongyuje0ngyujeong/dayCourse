import Modal from 'react-modal';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getMoment } from './AlbumApi';

const Container = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(150px, 1fr));
    gap: 5px;
    padding: 20px 0;
    margin-left: 22%;
`;

const Box = styled.div`
    position: relative;
    width: 100%;
    height: 150px; /* 고정된 높이로 설정 */
    padding-bottom: 100%; /* 정사각형 비율 유지 */
    background-color: #bfbfbf;
    cursor: pointer;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 16px;
    color: white;
    background-image: url(${props => props.background});
    background-size: cover;
    background-position: center;
    transition: transform 0.2s;

    &:hover {
        transform: scale(1.02);
    }

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3); /* 썸네일 위에 어두운 오버레이 */
    }
    
    > p {
        position: absolute; /* 부모 요소 기준으로 절대 위치 지정 */
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%); /* 텍스트 중앙으로 이동 */
        z-index: 1;
        text-align: center;
    }
`;

const StyledModal = styled(Modal)`
    width: 60%;
    height: 70vh;
    background-color: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    justify-content: space-between; 
    align-items: center;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: none;
    overflow-y: auto;
    text-align: center;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center; 
    margin-top: 20px;
    width: 100%;
`;

const ImageGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
    justify-content: center;
    align-items: flex-start;
`;

const ModalImage = styled.img`
    max-width: 100%;
    height: auto;
    object-fit: contain;
    border-radius: 5px;
    margin-bottom: 10px;

    @media (min-width: 768px) {
        max-width: 150px;
    }

    @media (min-width: 1024px) {
        max-width: 200px;
    }
`;

const MomentModal = ({ isOpen, onRequestClose, title, images }) => {
    return (
        <StyledModal isOpen={isOpen} onRequestClose={onRequestClose} ariaHideApp={false}>
            <div>
                <h3>{title}</h3>
                <ImageGrid>
                    {images.map((url, idx) => (
                        <ModalImage key={idx} src={url.imgURL} alt={`${title} 이미지 ${idx + 1}`} />
                    ))}
                </ImageGrid>
            </div>

            <ButtonContainer>
                <button onClick={onRequestClose}>닫기</button>
            </ButtonContainer>
        </StyledModal>
    );
};

const Moment = ({ maxItems, columns, onMomentCountChange }) => {
    const [moments, setMoments] = useState([]); 
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalImages, setModalImages] = useState([]);

    useEffect(() => {
        const fetchMoments = async () => {
            try {
                const data = await getMoment();
                setMoments(data);
                const totalCount = Object.keys(data).length;
                if (onMomentCountChange) {
                    onMomentCountChange(totalCount);
                }
            } catch (err) {
                console.error('모먼트를 가져오는 중 오류가 발생했습니다:', err);
            }
        };
        fetchMoments();
    }, [onMomentCountChange]);

    const handleBoxClick = (title, images) => {
        setModalTitle(title);
        setModalImages(images);
        setModalIsOpen(true);
    };

    return (
        <>
            <Container columns={columns}>
                {Object.entries(moments)
                    .slice(0, maxItems || Object.entries(moments).length)
                    .map(([key, images]) => (
                    <Box
                        key={key}
                        onClick={() => handleBoxClick(key, images)}
                        background={images[0]?.imgURL} // 배경 이미지로 설정
                    >
                        <p>{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                    </Box>
                ))}
            </Container>

            <MomentModal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                title={modalTitle}
                images={modalImages}
            />
        </>
    );
};

export default Moment;