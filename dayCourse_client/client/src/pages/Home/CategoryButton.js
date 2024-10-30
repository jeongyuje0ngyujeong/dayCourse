import React from 'react';
import { Button } from '../../Button'; // Button 컴포넌트를 가져옵니다.
import styled from "styled-components";



const CategoryContainer = styled.div`
    margin: 10px 0;
`;

const CategoryButton = ({ selectedCategory, setSelectedCategory }) => {
    const categories = ['랜덤', '음식점', '카페', '문화생활'];

    return (
        <CategoryContainer>
            {categories.map((category) => (
                <Button 
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    width="30%" // 원하는 너비를 지정
                    height="40px" // 원하는 높이를 지정
                    color={selectedCategory === category ? 'white' : 'black'}
                    $background={selectedCategory === category ? '#90B54C' : 'transparent'} 
                    $border={selectedCategory === category ? 'none' : 'solid 1px darkgray'} // 선택된 경우 테두리 없음, 아니면 검은색 테두리
                >
                    {category}
                </Button>
             ))}
        </CategoryContainer>
    );
};

export default CategoryButton;