import React from 'react';
import { Button } from '../../Button'; // Button 컴포넌트를 불러옵니다.
import styled from "styled-components";



const KeywordContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    ${'' /* width: 100%; */}

    ${'' /* margin: 10px 0; */}
`;

const KeywordButton = ({ selectedCategory, selectedKeyword, setSelectedKeyword }) => {
    const keywords = {
        음식점: ['랜덤', '한식', '중식', '일식', '양식', '아시안'],
        카페: ['랜덤', '로스팅', '디저트', '감성카페', '카공', '베이커리', '애견카페'],
        문화생활: ['랜덤', '공방', '명소', '방탈출', '만화카페', '영화관', '공원', '쇼핑몰', '전시회']
    };

    return (
        <>
            <KeywordContainer>
                {keywords[selectedCategory] && keywords[selectedCategory].map((keyword) => (
                    <Button 
                        key={keyword}
                        onClick={() => setSelectedKeyword(keyword)} 
                        style={{flex:'1', minWidth:'8vh',fontSize: '2vh', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'}}
                        height="4vh" // 원하는 높이를 지정
                        color={selectedKeyword === keyword ? 'white' : '#343a40'}
                        $background={selectedKeyword === keyword ? '#90B54C' : 'white'} 
                        $border={selectedKeyword === keyword ? 'none' : 'solid 1px #ddd'} // 선택된 경우 테두리 없음, 아니면 검은색 테두리

                    >
                        {keyword}
                    </Button>
                ))}
            </KeywordContainer>
        </>
    );
};

export default KeywordButton;