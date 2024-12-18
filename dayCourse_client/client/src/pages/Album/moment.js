import Modal from 'react-modal';
import React, { useState, useEffect} from 'react';
import styled from 'styled-components';
import { getMoment } from './AlbumApi'; 

const Container = styled.div`
    display: grid;

    grid-template-columns: ${({ columns }) => `repeat(${columns},  minmax(150px, 1fr))`};
    gap: 10px; /* 그리드 간격 */
    padding: 20px 0;
    max-width: 935px; /* 최대 너비 설정 */
    margin: 0 auto; /* 중앙 정렬 */
    width: 100%;
    box-sizing: border-box;
`;

const Box = styled.div`
    position: relative;
    width: 100%;
    padding-bottom: 100%; /* 정사각형 비율 유지 */
    background-color: #bfbfbf;
    cursor: pointer;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 30px;
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
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%); /* 텍스트 중앙으로 이동 */
        text-align: center;
        
       
    }
`;

const StyledModal = styled(Modal)`
    width: 60%;
    height: 70vh; /* 높이를 줄여서 내용이 잘 보이도록 설정 */
    background-color: white; /* 모달 배경색 흰색으로 변경 */
    border-radius: 10px; /* 둥근 모서리 */
    padding: 20px; /* 패딩 추가 */
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); /* 그림자 추가 */
    
    display: flex;
    flex-direction: column;
    justify-content: center;
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
    max-height: 400px; /* 최대 높이를 제한하여 원본 비율 유지 */
    width: auto; /* 가로 비율을 자동으로 조정 */
    object-fit: contain; /* 원본 비율 유지하면서 영역에 맞게 조정 */
    border-radius: 5px;
    margin-bottom: 10px;

    @media (min-width: 768px) {
        max-width: 200px;
        max-height: 200px;
    }

    @media (min-width: 1024px) {
        max-width: 300px;
        max-height: 250px; 
    }
`;

const MomentModal = ({ isOpen, onRequestClose, title, images }) => {
    return (
        <StyledModal isOpen={isOpen} onRequestClose={onRequestClose} ariaHideApp={false}>
            <div>
                <h3>{title}</h3>
                <ImageGrid>
                    {images.map((url, idx) => (
                        <ModalImage key={idx} src={url.imgURL} alt={`${title} 이미지 ${idx + 1}`} loading="lazy" />
                    ))}
                </ImageGrid>
            </div>

            <ButtonContainer>
                <button onClick={onRequestClose}>닫기</button>
            </ButtonContainer>
        </StyledModal>
    );
};

const Moment = ({ maxItems, onMomentCountChange, columns}) => {
    // console.log('colums: ', columns);
    const [moments, setMoments] = useState([]); 
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState('')

    // const currentUserId = sessionStorage.getItem('userId');

    useEffect(() => {
        // if (currentUserId) {
    
          const fetchMoments = async () => {
            try {
              const data = await getMoment();
              setMoments(data);
              const totalCount = Object.keys(data).length;
              onMomentCountChange(totalCount);
            } catch (error) {
              console.error('모먼트를 가져오는 중 오류가 발생했습니다:', error);
            }
          };
    
          fetchMoments();
        // } else {
        //   console.error('유저 ID를 가져올 수 없습니다.');
        // }
    }, [onMomentCountChange]);

    useEffect(() => {
        // 이미 부모 컴포넌트에서 모먼트를 가져왔으므로, 여기서는 추가로 가져올 필요 없음
        if (onMomentCountChange) {
          const totalCount = Object.keys(moments).length;
          onMomentCountChange(totalCount);
        }
      }, [moments, onMomentCountChange]);
    
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