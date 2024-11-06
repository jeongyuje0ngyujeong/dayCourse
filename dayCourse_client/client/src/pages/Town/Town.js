import { Form, redirect, } from "react-router-dom";
import { updateSchedule, getEvent,} from "../../schedules";
import React, { useState, } from 'react';
import KakaoMap from './InputTown';
import SearchKeyword from './SearchKeyword';

import SelectTown from './SelectTown';
import styled from "styled-components";
import {Button} from '../../Button';
import ConvexHullCalculator from './Recommand/convex_hull'


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
    height: 100%;
    width: 100%;
    max-height: 31rem;
`

const DepartureContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between; 
    margin-top: 10px;
    padding-right: 20px;
    position: relative;
    max-height: 10rem;
`
const RecommendResult = styled.div`
    display: flex;
    margin-top: 30px;
    flex: 1;
    height: 33rem;
`
const ScrollContainer = styled.div`
    flex-grow: 1; 
    display: flex;
    flex-direction: column;
    min-height: 13rem;  
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
    width: 100%;
    ${'' /* border: 1px solid; */}
    border-radius: 10px;
    justify-content: center;
    align-items: center;
`

const Container = styled.div`
    flex: 1;
    display: flex;
    gap: 5px;
    margin-top: auto;
    width: 100%;
`;



export default function UpdateTown() {
    const [selectedTown, setSelectedTown] = useState("");
    const [departurePoints, setDeparturePoints] = useState([]); 
    const [keyword, setKeyword] = useState(""); // 제출한 검색어
    const [places, setPlaces] = useState([]); // 검색 결과 상태

    const removeDeparturePoint = (index) => {
        setDeparturePoints(departurePoints.filter((_, i) => i !== index));
    };

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
                        
                        <SearchKeyword keyword={keyword} setKeyword={setKeyword} places={places} setPlaces={setPlaces} departurePoints={departurePoints} setDeparturePoints={setDeparturePoints}/>
                        <ScrollContainer>
                            {departurePoints.map((point, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center',justifyContent: 'space-between', gap: '5px', marginBottom: '10px'}}>
                                    <div style={{ border: '1px solid #ccc', padding: '5px', width:'100%', borderRadius: '8px',height:'2.5rem'}}>
                                        {point.place_name}
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



