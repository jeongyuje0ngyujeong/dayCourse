import React from 'react';
import { Button } from '../../Button'; // Button 컴포넌트를 가져옵니다.
import styled from "styled-components";



const CategoryContainer = styled.div`
    display:flex;
    ${'' /* margin: 10px 0; */}
`;

const CategoryButton = ({ selectedCategory, setSelectedCategory }) => {
    const categories = ['랜덤', '음식점', '카페', '문화생활'];

    return (
        <>
            <CategoryContainer>
                {categories.map((category) => (
                    <Button 
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        style={{
                            flex: '1',
                            fontSize: '2vh',
                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
                        }}
                        height="4vh" // 원하는 높이를 지정
                        
                        color={selectedCategory === category ? 'white' : '#343a40'}
                        $background={selectedCategory === category ? '#90B54C' : 'white'} 
                        $border={selectedCategory === category ? 'none' : 'solid 1px #ddd'} // 선택된 경우 테두리 없음, 아니면 검은색 테두리
                        
                    >
                        {category}
                    </Button>
                ))}
            </CategoryContainer>
        </>
    );
};

export default CategoryButton;