
import React, {useState} from 'react';
import { SlCalender } from "react-icons/sl";
import {data} from './data';
// import styled from 'styled-components';
import { PageTitle } from '../../commonStyles';


const Search = () => {
    const [searchTerm, setSearchTerm] = useState('');

    //데이터 필터링
    const filteredData = data.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleInputChange = (event) => {
        setSearchTerm(event.target.value); 
    };

    return (
        <div>
            <PageTitle>Hofgfme Page</PageTitle>
            <p>Welcome to the Home Page!</p>
            <h3>달력 <SlCalender /></h3>
            < input type="text" placeholder="검색하기" value={searchTerm} onChange={handleInputChange} />
            <ul>
                {filteredData.length > 0 ? (
                    filteredData.map( item => (
                        <li key={item.id} > {item.title} </li>
                  ))
                ) : (
                    <li>검색 결과 없음</li>
                )}
            </ul>
        </div>
    );
};

export default Search;