import { Form, redirect, } from "react-router-dom";
import { updateSchedule, getEvent,} from "../../schedules";
import React, { useState, } from 'react';

import SelectTown from './SelectTown';
import styled from "styled-components";
import {Button} from '../../Button';


export async function loader({ params }) {
      const { planId } = params;
      const event = await getEvent(planId);
      return { event };
    }

export async function action({ request, params }) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);
    const planId = params.planId;
    
    await updateSchedule(planId, updates);
    return redirect(`/main/empty/${planId}`);
}


const SidebarContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin:  auto; 
`;

const RecommendContainer = styled.div`
    display: flex;
    height: 100%;
    width: 100%;
    max-height: 31rem;
`

const DepartureContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* 컨테이너 전체 공간을 균일하게 사용 */
    margin-top: 10px;
    padding-right: 20px;
    position: relative;
`
const RecommendResult = styled.div`
    display: flex;
    margin-top: 30px;
    flex: 1;
    height: 29rem;

`
const ScrollContainer = styled.div`
    flex-grow: 1; 
    display: flex;
    flex-direction: column;
    min-height: 14rem;  
    overflow: auto; 
    &::-webkit-scrollbar {
        display: none; 
    }
`

const ResultContainer = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    height: 15rem;  
    overflow: auto; 
    
    &::-webkit-scrollbar {
        display: none; 
    }
`

const MapContainer = styled.div`
    display: flex;
    width: 100%;
    border: 1px solid;
    justify-content: center;
    align-items: center;
`

const Container = styled.div`
    flex: 1;
    display: flex;
    ${'' /* gap: 5px; */}
    margin-top: auto;
`;

const Box = styled.div`
    width: 100%; /* 너비 조정 */
    height: 8rem; /* 높이 조정 */
    background-color: white; /* 배경색을 흰색으로 설정 */
    border: 1px solid #ccc; /* 경계선 추가 */
    border-radius: 10px; /* 둥근 모서리 */
    margin-bottom: 10px; /* 여백 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
    cursor: pointer;
    transition: transform 0.2s; /* 애니메이션 효과 */
    
    &:hover {
        transform: scale(1.05); /* 마우스 호버 시 확대 효과 */
    }

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;


export default function UpdateTown() {
    const [selectedTown, setSelectedTown] = useState("");
    const [departurePoints, setDeparturePoints] = useState([""]); 

    const addDeparturePoint = () => {
        // 최대 10개의 출발지 입력창만 추가할 수 있게 제한
        if (departurePoints.length < 10) {
            setDeparturePoints([...departurePoints, ""]);
        }
    };

    const removeDeparturePoint = (index) => {
        // 최소 하나의 입력창은 항상 유지
        if (departurePoints.length > 1) {
            setDeparturePoints(departurePoints.filter((_, i) => i !== index));
        }
    };

    const handleDepartureChange = (index, value) => {
        // 특정 입력창의 값을 업데이트
        const updatedPoints = [...departurePoints];
        updatedPoints[index] = value;
        setDeparturePoints(updatedPoints);
    }


    return (
        <div>
            <SidebarContainer>
                <h2>약속 지역</h2>
                <SelectTown contextTown={setSelectedTown}/>
                <Form method="post">        
                    <input type="hidden" name="town" value={selectedTown.full_addr} />
                    <Button type='submit' style={{ position: 'fixed', bottom: '5%', right: '6%' }} width='4rem' height='3rem' border='none' $background='#90B54C' color='white'> 다음 </Button>                   
                </Form>  
                <RecommendContainer>
                    <DepartureContainer>
                        <h3 style={{marginTop: '1rem'}}>출발지</h3>
                        <ScrollContainer>
                        {departurePoints.map((point, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px'}}>
                                <input
                                    type="text"
                                    placeholder={`출발지 ${index + 1}`}
                                    value={point}
                                    onChange={(e) => handleDepartureChange(index, e.target.value)}
                                    style={{ border: '1px solid #ccc', padding: '5px', width:'100%'}}
                                />
                                {index === 0 && departurePoints.length <= 10 && ( departurePoints.length !== 10 ?
                                    <Button onClick={addDeparturePoint}>+</Button> : <Button disable onClick={addDeparturePoint}>+</Button>
                                )}
                                {index > 0 && (
                                    <Button onClick={() => removeDeparturePoint(index)}>-</Button>
                                )}
                            </div>
                        ))}
                        </ScrollContainer>
                        <h3 style={{marginTop: '1rem'}}>추천지역</h3>
                        <Container>
                            <Box>추천지역1</Box>
                            <Box>추천지역2</Box>
                            <Box>추천지역3</Box>
                        </Container>
                    </DepartureContainer>

                    <RecommendResult>
                        <MapContainer>
                            지도
                        </MapContainer>
                    </RecommendResult>
                </RecommendContainer>
            </SidebarContainer>     
        </div>
    );
};




