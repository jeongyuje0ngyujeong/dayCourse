import React, {useState} from 'react';
import { SlCalender } from "react-icons/sl";
import {data} from './data';
import styled from 'styled-components';
import { getPlan } from './AlbumApi'; // 수정된 import 경로
// import { PageTitle } from '../../commonStyles';
import React, { useState, useEffect } from 'react';

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

const List = styled.div `
    flex-direction: column; 
`

const Search = () => {
    const [searchTerm, setSearchTerm] = useState('');

    //데이터 필터링
    const filteredData = data.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleInputChange = (event) => {
        setSearchTerm(event.target.value); 
    };

    return (
        <div>
            <Container>
            <p>이곳은 공유 앨범 페이지 입니다</p>
            <InnerContainer>
                <SlCalender />
            <Input type="text"
                placeholder="검색하기"
                value={searchTerm} 
                onChange={handleInputChange} />
            </InnerContainer>
            <List>
                {filteredData.length > 0 ? (
                    filteredData.map( item => (
                        <li key={item.id} > {item.title} </li>
                  ))
                ) : (
                    <li>검색 결과 없음</li>
                )}
                </List>
            
            </Container>
        </div>
    );
};

export default Search;