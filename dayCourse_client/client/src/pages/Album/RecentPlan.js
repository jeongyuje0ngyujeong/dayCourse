import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getPlan } from '../../AlbumApi'; // API 함수 가져오기

const Container = styled.div`
    justify-content: center;
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
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: darkgray;
    }
`;

const SelectedPlanContainer = styled.div`
    margin-top: 20px;
    padding: 10px;
    background-color: #f0f0f0;
    border-radius: 5px;
`;

const RecentPlan = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]); // 플랜을 저장할 상태
    const [selectedPlan, setSelectedPlan] = useState(null); // 선택된 플랜 상태

    // 플랜 가져오기
    const fetchPlans = async () => {
        const allPlans = await getPlan(); // 모든 플랜 가져오기
        const recentPlans = allPlans
            .sort((a, b) => b.createdAt - a.createdAt) // createdAt 기준으로 내림차순 정렬
            .slice(0, 3); // 상위 3개 선택
        setPlans(recentPlans);
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleBoxClick = (item) => { // item으로 통일
        console.log('Selected plan:', item);
        setSelectedPlan(item); // 선택된 플랜 설정
        navigate(`/plan/${item.planId}`); // 플랜 상세 페이지로 이동
    };

    return (
        <div>
            <h2>최근 플랜</h2>
            <Container>
                {plans.map(item => ( // item으로 통일
                    <Box key={item.planId} onClick={() => handleBoxClick(item)}>
                        <div>
                            <h3>{item.planName}</h3>
                            <p>{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                    </Box>
                ))}
            </Container>
            {selectedPlan && (
                <SelectedPlanContainer>
                    <h3>선택된 플랜:</h3>
                    <p>{selectedPlan.planName}</p> {/* item.planName으로 통일 */}
                </SelectedPlanContainer>
            )}
        </div>
    );
};

export default RecentPlan;