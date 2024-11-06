import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios'; // Axios 임포트

const BASE_URL = process.env.REACT_APP_BASE_URL;

const SurveyPage = styled.div`
    width: 100%;
    padding: 20px;
    display:flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; /* 수직 중앙 정렬 */
`;

const KeywordList = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    margin: 20px 0;
`;

// 버튼들을 감쌀 컨테이너 스타일 정의
const ButtonContainer = styled.div`
    display: flex;
    justify-content: center; 
    gap: 10px; 
`;

const KeywordItem = styled.div`
    display:flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius:10px;
    padding:10px;
    text-align:center;
    transition: all 0.3s;

    input {
        margin-top:5px;
        width: 20px; 
        height: 20px;
        border: 2px solid #90B54C; /* 수정된 부분 */
        border-radius: 4px;
        align-items:center;
        cursor: pointer;
        outline: none;
        accent-color: #90B54C;
    }
`;

const SubmitButton = styled.div`
    padding: 10px 20px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    background-color: #90B54C;
    color: white;
    cursor: pointer;

    &:hover {
        transform: scale(1.05); 
    }
`;

const Survey = () => {
    const navigate = useNavigate();
    const [selectedKeyWords, setSelectedKeywords] = useState([]);
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    const keywords = [
        '한식', '중식', '일식', '양식', '아시안',
        '로스팅 카페', '디저트', '감성카페', '카공', 
        '베이커리', '애견카페', '공방', '명소', 
        '방탈출', '만화카페', '영화관', '공원', 
        '쇼핑몰', '전시회'
    ];

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

                // 서버가 dataPresence를 boolean으로 보내는지, 숫자로 보내는지 확인
                const { dataPresence } = response.data;

                if (dataPresence === false) {
                    goMain();
                } else {
                    setLoading(true);
                }
            } catch (error) {
                console.error('서베이 상태 확인 오류', error);
                // 에러가 발생하면 서베이를 보여주거나 다른 처리를 할 수 있습니다.
                setLoading(false);
            }
        };
        checkOk();
    }, []);

    const checkboxChange = (keyword) => {
        if (selectedKeyWords.includes(keyword)) {
            setSelectedKeywords(selectedKeyWords.filter(item => item !== keyword));
        } else if (selectedKeyWords.length < 5) {
            setSelectedKeywords([...selectedKeyWords, keyword]);
        } else {
            alert('최대 5개까지만 선택할 수 있습니다.');
        }
    };

    const submitKeyword = async () => {
        const token = sessionStorage.getItem('token'); // 토큰을 세션 저장소에서 가져옴
        if (selectedKeyWords.length === 0) {
            alert('최소 하나의 관심사를 선택해 주세요.');
            return;
        }

        // 서버에서 필요한 형식으로 데이터를 변환
        const dataToSend = {
            interest1: selectedKeyWords[0] || null,
            interest2: selectedKeyWords[1] || null,
            interest3: selectedKeyWords[2] || null,
            interest4: selectedKeyWords[3] || null,
            interest5: selectedKeyWords[4] || null,
        };

        try {
            await axios.post(`${BASE_URL}/home/survey`,
                dataToSend, 
                {            
                    headers: {
                        Authorization: `Bearer ${token}`, // Authorization 헤더 추가
                    }
                }
            );
            goMain(); // 성공 시 메인 페이지로 이동
        } catch (error) {
            console.error('서베이 전송 에러', error);
            alert('서버 전송 중 오류가 발생했습니다. 다시 시도해 주세요.');
        }
    };

    const goMain = () => {
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2,'0')}`;
        navigate(`/main/home/schedules/${formattedDate}`);
    };

    if (loading) {
        // 로딩 중일 때 표시할 내용 (예: 스피너)
        return <SurveyPage><p>로딩 중...</p></SurveyPage>;
    }

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