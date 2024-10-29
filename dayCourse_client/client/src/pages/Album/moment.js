import Modal from 'react-modal';
import React, {useState} from 'react';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    
    flex-wrap: wrap;
    padding:20px;
   
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
    border: none; /* 모달 경계선 제거 */
`;
    

const MomentModal = ({ isOpen, onRequestClose, content }) => {
    return (
        <StyledModal isOpen={isOpen} onRequestClose={onRequestClose} ariaHideApp={false}>
            <h3>모달 제목</h3>
            <p> {content} </p>
            <button onClick={onRequestClose}>닫기</button>
        </StyledModal>
    );
};


const Moment = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState('')

    const handleBoxClick = (content) => {
        setModalContent(content);
        setModalIsOpen(true);
    };

    return (
        <div>
            <h2>모먼트</h2>
            <Container>
                <Box onClick={()=> handleBoxClick('첫번째 모먼트')}></Box>
                <Box onClick={()=> handleBoxClick('두번째 모먼트')}></Box>
                <Box onClick={()=> handleBoxClick('세번째 모먼트')}></Box>
            </Container> 

            <MomentModal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            content={modalContent}
            />
        </div>
    );
};

export default Moment;