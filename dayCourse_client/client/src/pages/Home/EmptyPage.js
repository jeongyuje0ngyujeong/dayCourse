import React from 'react';
import KakaoMap from './KakaoMap';
import styled from "styled-components";
import LandingPage from './LandingPage';
import RightSidebar from './RightSidebar';

const Box = styled.div`
    width: 50vw;
    height: 80vh;
    background-color: gray;
    border-radius: 5px;
    margin: 2%;
    cursor: pointer;
    display: flex; /* 내용 중앙 정렬을 위해 Flexbox 사용 */
    align-items: center;
    justify-content: center; /* 수평 중앙 정렬 */

    &:hover {
        background-color: darkgray;
    }
`;


const EmptyPage = () => {
    return (
        <div>
            <LandingPage></LandingPage>
            <KakaoMap></KakaoMap>
            <Box>일정칸입니다</Box>
         {/* <RightSidebar></RightSidebar> */}
        </div>

    );
};

export default EmptyPage;