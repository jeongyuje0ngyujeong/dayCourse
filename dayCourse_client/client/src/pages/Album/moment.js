import Modal from 'react-modal';
import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import { getMoment } from './AlbumApi';

const Container = styled.div`
    display: flex;
    flex-wrap: wrap;
    padding: 20px;
`;

const Box = styled.div`
    width: 150px; /* 너비 조정 */
    height: 200px; /* 높이 조정 */
    background-color: white; /* 배경색을 흰색으로 설정 */
    border: 1px solid #ccc; /* 경계선 추가 */
    border-radius: 10px; /* 둥근 모서리 */
    margin: 10px; /* 여백 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
    cursor: pointer;
    transition: transform 0.2s; /* 애니메이션 효과 */

    &:hover {
        transform: scale(1.05); /* 마우스 호버 시 확대 효과 */
    }

    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    position: relative;
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
    text-align: center; /* 텍스트를 중앙 정렬 */
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
    align-items: flex-start; /* 이미지들을 상단 정렬 */
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
                        <ModalImage key={idx} src={url} alt={`${title} 이미지 ${idx + 1}`} />
                    ))}
                </ImageGrid>
            </div>

            <ButtonContainer>
                <button onClick={onRequestClose}>닫기</button>
            </ButtonContainer>
        </StyledModal>
    );
};

const Moment = () => {
    const [moments, setMoments] = useState([]); // 모먼트 리스트 저장
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalImages, setModalImages] = useState([]);

    // 컴포넌트가 마운트될 때 모먼트 데이터 가져오기
    useEffect(() => {
        const fetchMoments = async () => {
            try {
                const data = await getMoment();
                // 서버의 응답 구조에 따라 데이터 설정
                // 예를 들어, data.moments가 모먼트 배열이라면:
                setMoments(data);
            } catch (err) {
                console.error('모먼트를 가져오는 중 오류가 발생했습니다:', err);
            }
        };

        fetchMoments();
    }, []);

    const handleBoxClick = (title, images) => {
        setModalTitle(title);
        setModalImages(images);
        setModalIsOpen(true);
    };

    return (
        <div>
            <h2>모먼트</h2>
            <Container>
                {Object.entries(moments).map(([key, images]) => (
                    <Box key={key} onClick={() => handleBoxClick(key, images)}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} {/* 첫 글자 대문자 */}
                    </Box>
                ))}
            </Container>

            <MomentModal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                title={modalTitle}
                images={modalImages}
            />
        </div>
    );
};

export default Moment;