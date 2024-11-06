import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios'; // Axios 임포트


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
// 버튼들을 감쌀 컨테이너 스타일 정의
const ButtonContainer = styled.div`
    display: flex;
    justify-content: center; 
    gap: 10px; 
    
`;


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
        width: 20px; 
        height: 20px;
        border: 2px solid: #90B54C;
        border-radius: 4px;
        align-items:center;
        cursor: pointer;
        outline: none;
        accent-color: #90B54C;
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
        transform: scale(1.05); 
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

    const goMain = useCallback(() => {
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2,'0')}`;
        navigate(`/main/home/schedules/${formattedDate}`);
    }, [navigate]);

    useEffect(() => {
        const checkOk = async () => {
            const token = sessionStorage.getItem('token'); // 토큰 가져오기
            try {
                const response = await axios.get(`${BASE_URL}/home/survey`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log('서버 응답:', response.data); // 서버 응답 로그 확인

                const { dataPresence } = response.data;

                if (dataPresence === false) {
                    goMain();
                } else {
                    setLoading(true);
                }
            } catch (error) {
                console.error('서베이 상태 확인 오류', error);
                setLoading(false);
            }
        };
        checkOk();
    }, [goMain]); // goMain을 의존성 배열에 추가

    const checkboxChange = (keyword) => {
        if (selectedKeyWords.includes(keyword)) {
            setSelectedKeywords(selectedKeyWords.filter(item => item !== keyword));
        } else if (selectedKeyWords.length < 5) {
            setSelectedKeywords([...selectedKeyWords, keyword]);
        } else {
            alert('최대 5개까지만 선택할 수 있습니다.')
        }
    };

    const submitKeyword = async() => {
        try {
            await axios.post('/main/home/survey', selectedKeyWords );
            goMain();
        } catch(error) {
            console.error('서버 전송 에러', error);
        }
    };

    if (loading) {
        // 로딩 중일 때 표시할 내용 (예: 스피너)
        return <SurveyPage><p>로딩 중...</p></SurveyPage>;
    }

    
    const goMain = () => {
        navigate(`/main/home/schedules/${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2,'0')}`);
    };

    return (
        <SurveyPage>
            <h2>관심있는 분야를 최대 5개까지 선택하세요</h2>
            <KeywordList>
                {keywords.map((keyword) => (
                    <KeywordItem key={keyword}>
                        <span>{keyword}</span>
                        <input 
                            type="checkbox"
                            checked={selectedKeyWords.includes(keyword)}
                            onChange={() => checkboxChange(keyword)}
                            disabled={!selectedKeyWords.includes(keyword) && selectedKeyWords.length >= 5} // 5개 선택 시 추가 선택 불가
                        />
                    </KeywordItem>
                ))}
            </KeywordList>
            <ButtonContainer>
                <SubmitButton onClick={goMain}>다음에 하기</SubmitButton>
                <SubmitButton onClick={submitKeyword}>확인</SubmitButton>
            </ButtonContainer>
        </SurveyPage>
    );
};

export default Survey;