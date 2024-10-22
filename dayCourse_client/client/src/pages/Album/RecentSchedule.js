import React, { useState } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import { data } from './Recent_schedule_data';
import Recent_1 from './Recent_1'; // 빈 페이지 컴포넌트 가져오기

const Container = styled.div`
    justify-content: center; /* 수평 중앙 정렬 */
    padding-left: 20%;
    padding-bottom: 20px;
`;

const Box = styled.div`
    width: 30vw;
    height: 13vh;
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

const RecentSchedule = () => {
    const [selectedSchedule, setSelectedSchedule] = useState(null); // 선택된 일정 상태

    // 클릭 핸들러
    const handleBoxClick = (schedule) => {
        console.log('Selected schedule:', schedule); 
        setSelectedSchedule(schedule); // 선택된 일정 설정
    };

    return (
        <div>
            <h2>최근 일정</h2>
            <Container>
                {data.slice(0, 3).map(schedule => (
                    <Box key={schedule.id} onClick={() => handleBoxClick(schedule)}>
                        {schedule.title}
                    </Box>
                ))}
            </Container>

        </div>
    );
};







export default RecentSchedule;