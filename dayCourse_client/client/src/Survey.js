import {React, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
const SurveyPage = styled.div `
    width: 100%;
    padding: 20px;
    display:flex;
    flex-direction: column;
    align-items: center;
`

const KeywordList = styled.div `
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    margin: 20px 0;
`

const KeywordItem = styled.div `
    display:flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius:10px;
    padding:10px;
    text-align:center;
    transition: all 0.3s;
    
    &:hover {
        background-color: #90B54C;
    }

    input {
        margin-top:5px;
        width: 20px; // 체크박스 크기
        height: 20px;
        border: 2px solid: #90B54C;
        border-radius: 4px;
        align-items:center;
        cursor: pointer;
        outline: none;
    }
`

const SubmitButton = styled.div `
    padding: 10px 20px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: white;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }
`;



const Survey = () => {
    const navigate = useNavigate();
    const [selectedKeyWords, setSelectedKeywords] = useState([])

    const keywords = [
        '한식', '중식', '일식', '양식', '아시안',
        '로스팅', '디저트', '감성카페', '카공', 
        '베이커리', '애견카페', '공방', '명소', 
        '방탈출', '만화카페', '영화관', '공원', 
        '쇼핑몰', '전시회'
    ];


    const checkboxChange = (keyword) => {
        setSelectedKeywords((prev) => 
            prev.includes(keyword)
                ? prev.filter((item) => item !== keyword)
                : [...prev, keyword]
            );
    };

    const goMain = () => {
        navigate('/main');
    };

    return (
        <SurveyPage>
            <h2>관심있는 분야를 선택하세요</h2>
            <KeywordList>
                {keywords.map((keyword) => (
                    <KeywordItem key={keyword}>
                        <span>{keyword}</span>
                        <input 
                            type="checkbox"
                            checked={selectedKeyWords.includes(keyword)}
                            onChange={() => checkboxChange(keyword)}
                        />
                    </KeywordItem>
                ))}
            </KeywordList>
            <SubmitButton onClick={goMain}>확인</SubmitButton>
        </SurveyPage>
    );
};

export default Survey;