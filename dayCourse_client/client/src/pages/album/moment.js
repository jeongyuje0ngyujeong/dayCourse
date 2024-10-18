
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

const Moment = () => {

    return (
        <div>
            <h2>모먼트</h2>
            <Container>
                <Box></Box>
                <Box></Box>
                <Box></Box>
            </Container> 
        </div>
    );
};

export default Moment;