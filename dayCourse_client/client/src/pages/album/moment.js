import Modal from 'react-modal';
import React, {useState} from 'react';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    justify-content: center; /* 수평 중앙 정렬 */
   
`;

const Box = styled.div`
    width: 15vw;
    height: 22vh;
    background-color: gray;
    border-radius: 5px;
    margin: 2%;
    `;

const StyledModal = styled(Modal) `
    width: 60%;
    height: 90vh;
    background-color:gray;
    border-radius:5px;

    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;

    position:fixed;
    top:50%;
    left:50%;
    transform: translate(-50%, -50%);

`

    

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