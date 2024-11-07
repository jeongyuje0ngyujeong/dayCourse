import Modal from 'react-modal';
import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import { getMoment } from './AlbumApi';

const Container = styled.div`
    display: grid;
    width: 100%;
    grid-template-columns: ${({ columns }) => `repeat(${columns}, 1fr)`};
    place-items: center;
    ${'' /* padding: 20px; */}
`;

const Box = styled.div`
    width: 150px;
    height: 200px;
    background-color: #ccc;
    border: 1px solid #ccc;
    border-radius: 10px;
    margin: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.2s; /* 애니메이션 효과 */
    overflow: hidden;
    &:hover {
        transform: scale(1.05); /* 마우스 호버 시 확대 효과 */
    }

    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    overflow: hidden;
    background-image: url(${props => props.background});
    background-size: cover;
    background-position: center;
    color: white;
    font-size: 16px;
    text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.7);

    &:hover {
        transform: scale(1.05);
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
    console.log(images);
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
                    onMomentCountChange(totalCount); // 모먼트 개수를 업데이트
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
                    .slice(0, maxItems || Object.entries(moments).length) // maxItems가 없을 경우 전체 항목 렌더링
                    .map(([key, images]) => (
                    <Box key={key} onClick={() => handleBoxClick(key, images)}>
                        <img
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: 0.5,
                                filter: 'blur(2px)',
                                borderRadius: '10px'
                            }}
                            src={images[0].imgURL}
                            alt="Company Logo"
                            className="logo"
                        />
                        <p style={{ position: 'absolute' }}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </p>
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