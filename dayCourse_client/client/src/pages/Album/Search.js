import { SlCalender } from "react-icons/sl";
import styled from 'styled-components';

import React from 'react';

const Container = styled.div `
    display: flex;
    justify-content: center; 
    flex-direction: column;
    align-items: center;
`

const InnerContainer = styled.div `
    display:flex;
    align-items:center;
    `

const Input = styled.input `
    margin-left: 10px;
    `



const Search = ({searchTerm, setSearchTerm}) => {
    const handleInputChange = (event) => {
        setSearchTerm(event.target.value); 
    };

    return (
        <div>
            <Container>
            {/* <p>이곳은 공유 앨범 페이지 입니다</p> */}
                <InnerContainer>
                    <SlCalender />
                    <Input type="text"
                        placeholder="검색하기"
                        value={searchTerm} 
                        onChange={handleInputChange} />
                </InnerContainer>
            </Container>
        </div>
    );
};

export default Search;
