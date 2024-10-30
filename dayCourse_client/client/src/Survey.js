import React from 'react';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
const SurveyPage = styled.div `
    width: 100%
`

const Survey = () => {
    const navigate = useNavigate();

    const goMain = () => {
        navigate('/main');
    };

    return (
        <SurveyPage>
            <h1>로그인 성공</h1>
            <button onClick={goMain}>메인 페이지로</button>
        </SurveyPage>
    );
};

export default Survey;