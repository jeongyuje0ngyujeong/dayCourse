import React from 'react';
import { Button } from '../../Button'; // Button 컴포넌트를 불러옵니다.

const KeywordButton = ({ selectedCategory, selectedKeyword, setSelectedKeyword }) => {
    const keywords = {
        음식점: ['한식', '중식', '일식', '양식', '아시안'],
        카페: ['로스팅', '디저트', '감성카페', '카공', '베이커리', '애견카페'],
        문화생활: ['공방', '명소', '방탈출', '만화카페', '영화관', '공원', '쇼핑몰', '전시회']
    };

    return (
        <div>
            {keywords[selectedCategory] && keywords[selectedCategory].map((keyword) => (
                <Button 
                    key={keyword}
                    onClick={() => setSelectedKeyword(keyword)} 
                    width="28%" // 버튼 너비 설정
                    height="30px" // 버튼 높이 설정
                    color={selectedKeyword === keyword ? 'white' : 'black'}
                    $background={selectedKeyword === keyword ? '#90B54C' : 'transparent'} 
                    $border={selectedKeyword === keyword ? 'none' : 'solid 1px darkgray'} // 선택된 경우 테두리 없음, 아니면 검은색 테두리

                >
                    {keyword}
                </Button>
            ))}
        </div>
    );
};

export default KeywordButton;