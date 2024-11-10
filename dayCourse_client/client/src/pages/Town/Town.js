import { Form, redirect, useLoaderData } from "react-router-dom";
import { updateSchedule, getEvent,} from "../../schedules";
import React, { useState, } from 'react';
import KakaoMap from './InputTown';
import SearchKeyword from './SearchKeyword';

import SelectTown from './SelectTown';
import styled from "styled-components";
import {Button} from '../../Button';
import ConvexHullCalculator from './Recommand/convex_hull'
import {PageTitle} from '../../commonStyles';


export async function loader({ params }) {
      const { planId } = params;
    //   console.log(planId);
      const event = await getEvent(planId);
      return { event };
}

export async function action({ request, params }) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);
    const planId = params.planId;
    
    await updateSchedule(planId, updates);
    return redirect(`/main/PlacePage/${planId}`);
}


const SidebarContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin:  auto; 
`;

const RecommendContainer = styled.div`
    display: flex;
    ${'' /* height: 100%; */}
    width: 100%;
    max-height: 31rem;
    flex: 1;
`

const DepartureContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between; 
    ${'' /* margin-top: 10px; */}
    margin-right: 20px;
    position: relative;
    height: 65vh;
`
const RecommendResult = styled.div`
    display: flex;
    margin-top: 30px;
    flex: 1;
    height: 60vh;
    ${'' /* height: 33rem; */}
`
const ScrollContainer = styled.div`
    flex: 1; 
    ${'' /* height: 26vh; */}
    display: flex;
    flex-direction: column;
    ${'' /* min-height: 13rem;   */}
    overflow: auto; 
    &::-webkit-scrollbar {
        display: none; 
    }
`

// const ResultContainer = styled.div`
//     display: flex;
//     flex-direction: column;
//     position: relative;
//     height: 15rem;  
//     overflow: auto; 
    
//     &::-webkit-scrollbar {
//         display: none; 
//     }
// `

const MapContainer = styled.div`
    display: flex;
    flex: 1;
    
    ${'' /* border: 1px solid; */}
    border-radius: 10px;
    justify-content: center;
    align-items: center;
`

const Container = styled.div`
    height: 30vh;
    display: flex;
    gap: 5px;
    margin-top: auto;
    width: 100%;
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
    const { event } = useLoaderData();
    
    const [selectedTown, setSelectedTown] = useState('');
    console.log(selectedTown);
    console.log(event);
    const [departurePoints, setDeparturePoints] = useState([]); 
    const [keyword, setKeyword] = useState(""); // 제출한 검색어
    const [places, setPlaces] = useState([]); // 검색 결과 상태

    const removeDeparturePoint = (index) => {
        setDeparturePoints(departurePoints.filter((_, i) => i !== index));
    };

    return (
        <div>
            <SidebarContainer>
                <PageTitle style={{margin: '0.5rem 0', fontSize:'3vh'}}>약속지역</PageTitle>
                {/* margin: '0.5rem 0', fontSize:'3vh' */}
                <SelectTown contextTown={setSelectedTown}/>
                <Form method="post">        
                    <input type="hidden" name="town" value={selectedTown.full_addr} />
                    <Button type='submit' style={{ position: 'fixed', bottom: '5%', right: '3%', zIndex:'1000' }} width='4rem' height='3rem' border='none' $background='#90B54C' color='white'> 다음 </Button>                   
                </Form>  
                <RecommendContainer>
                    <DepartureContainer>
                        <SearchKeyword keyword={keyword} setKeyword={setKeyword} places={places} setPlaces={setPlaces} departurePoints={departurePoints} setDeparturePoints={setDeparturePoints}/>
                        
                        <ScrollContainer>
                            {departurePoints.map((point, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center',justifyContent: 'space-between', gap: '5px', marginBottom: '10px'}}>
                                    <div style={{ border: '1px solid #ccc', padding:'2vh', width:'100%', borderRadius: '8px',height:'2.5rem', display:'flex', alignItems:'center', gap:'2vh', justifyContent:'space-between'}}>
                                        <PageTitle>{point.place_name}</PageTitle>
                                        <p> {point.address_name}</p>
                                    </div>
                                    <Button onClick={() => removeDeparturePoint(index)} width='3rem' height='2.5rem'>-</Button>
                                </div>
                            ))}
                        </ScrollContainer>

                        <Container>
                            <ConvexHullCalculator departurePoints={departurePoints}/> 
                        </Container>
                    </DepartureContainer>

                    <RecommendResult>
                        <MapContainer>
                            <KakaoMap searchKeyword={keyword} setPlaces={setPlaces}/>
                        </MapContainer>
                    </RecommendResult>
                </RecommendContainer>
             
            </SidebarContainer>   
        </div>
    );
};




