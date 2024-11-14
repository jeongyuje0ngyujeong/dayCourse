import { Form, redirect, useLoaderData } from "react-router-dom";
import { updateSchedule, getEvent, getTownCd} from "../../schedules";
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
    margin-top: 1vh;
    ${'' /* border: 1px solid; */}
    border-radius: 10px;
    justify-content: center;
    align-items: center;
`

const Container = styled.div`
    height: 30vh;
    display: flex;
    gap: 5px;
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
    let town, town_code;
    
    if (event) {
        town = event.town;
        town_code = event.town_code;
    }
    
    const [selectedTown, setSelectedTown] = useState('');
    // console.log(selectedTown);
    const [departurePoints, setDeparturePoints] = useState([
        // {
        //     "user": "김민경",
        //     "address_name": "서울 강동구 상일동 산 73",
        //     "category_group_code": "SW8",
        //     "category_group_name": "지하철역",
        //     "category_name": "교통,수송 > 지하철,전철 > 수도권5호선",
        //     "distance": "",
        //     "id": "500054763",
        //     "phone": "",
        //     "place_name": "강일역 5호선",
        //     "place_url": "http://place.map.kakao.com/500054763",
        //     "road_address_name": "서울 강동구 고덕로 지하 456",
        //     "x": "127.175680183486",
        //     "y": "37.5574259795986"
        // },
        
        {
            "user": "정유정",
            "address_name": "경기 고양시 덕양구 원흥동 569-15",
            "category_group_code": "SW8",
            "category_group_name": "지하철역",
            "category_name": "교통,수송 > 지하철,전철 > 수도권3호선",
            "distance": "",
            "id": "26102869",
            "phone": "1544-7788",
            "place_name": "원흥역 3호선",
            "place_url": "http://place.map.kakao.com/26102869",
            "road_address_name": "경기 고양시 덕양구 권율대로 681",
            "x": "126.87302523491",
            "y": "37.6506921774602"
        },
        {
            "user": "김경은",
            "address_name": "서울 종로구 묘동 20-5",
            "category_group_code": "SW8",
            "category_group_name": "지하철역",
            "category_name": "교통,수송 > 지하철,전철 > 수도권3호선",
            "distance": "",
            "id": "21160545",
            "phone": "02-6110-3291",
            "place_name": "종로3가역 3호선",
            "place_url": "http://place.map.kakao.com/21160545",
            "road_address_name": "서울 종로구 돈화문로 지하 30",
            "x": "126.9918757981544",
            "y": "37.571563287751246"
        },
        {
            "user": "하혜민",
            "address_name": "경기 수원시 영통구 이의동 산 94-6",
            "category_group_code": "SC4",
            "category_group_name": "학교",
            "category_name": "교육,학문 > 학교 > 대학교",
            "distance": "",
            "id": "9673131",
            "phone": "031-249-9114",
            "place_name": "경기대학교 수원캠퍼스",
            "place_url": "http://place.map.kakao.com/9673131",
            "road_address_name": "경기 수원시 영통구 광교산로 154-42",
            "x": "127.03514122548546",
            "y": "37.30114907752158"
        }                

    ]); 

    const [keyword, setKeyword] = useState(""); // 제출한 검색어
    const [places, setPlaces] = useState([]); // 검색 결과 상태
    const [selectedRecommendedTown, setSelectedRecommendedTown] = useState(null); // { 상권명: '', centroid_x: , centroid_y: }

    const [selectedButton, setSelectedButton] = useState(null);

    const removeDeparturePoint = (index) => {
        setDeparturePoints(departurePoints.filter((_, i) => i !== index));
    };

    // 추천된 지역을 선택했을 때 호출되는 핸들러
    const handleSelectTown = async (town, index) => {
        console.log('Selected town:', town); 
        const result = await getTownCd(town);
        console.log(result);

        const transformedData = {
            full_addr: result.full_addr,
            cd: result.sido_cd + result.sgg_cd + result.emdong_cd
        };

        setSelectedButton(index);
        setSelectedTown(transformedData);
        setSelectedRecommendedTown(town);
    };

    return (
        <div>
            <SidebarContainer>
                <PageTitle style={{margin: '0.5rem 0', fontSize:'3vh'}}>약속지역</PageTitle>
                {/* margin: '0.5rem 0', fontSize:'3vh' */}
                <SelectTown contextTown={setSelectedTown} town={town} town_code={town_code}/>
                <Form method="post">        
                    <input type="hidden" name="town" value={selectedTown.full_addr} />
                    <input type="hidden" name="town_code" value={selectedTown.cd} />
                    {/* {selectedRecommendedTown && (
                        <>
                            <input type="hidden" name="town_name" value={selectedRecommendedTown.상권명} />
                            <input type="hidden" name="town_x" value={selectedRecommendedTown.centroid_x} />
                            <input type="hidden" name="town_y" value={selectedRecommendedTown.centroid_y} />
                        </>
                    )} */}
                    <Button 
                        type='submit' 
                        style={{ position: 'fixed', bottom: '5%', right: '3%', zIndex:'1000', fontSize:'2vh' }} 
                        width='4rem' 
                        height='3rem' 
                        border='none' 
                        $background='#90B54C' 
                        color='white'
                    > 
                        다음 
                    </Button>                   
                </Form>  
                <RecommendContainer>
                    <DepartureContainer>
                        <SearchKeyword keyword={keyword} setKeyword={setKeyword} places={places} setPlaces={setPlaces} departurePoints={departurePoints} setDeparturePoints={setDeparturePoints}/>
                        
                        <ScrollContainer>
                            {departurePoints.map((point, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center',justifyContent: 'space-between', gap: '5px', marginBottom: '10px'}}>
                                    {point.user && 
                                    <div style={{display:'flex', background: '#90B54C', height:'100%', alignItems:'center', borderRadius:'20vh'}}>
                                        <PageTitle style={{fontSize:'2vh', margin:'0 1vh', color:'white'}}>{point.user}</PageTitle>
                                    </div>
                                    }
                                    <div style={{ flex:'1', border: '1px solid #ccc', padding:'2vh', width:'100%', borderRadius: '8px',height:'2.5rem', display:'flex', alignItems:'center', gap:'2vh', justifyContent:'space-between'}}>
                                        <PageTitle style={{fontSize:'2vh'}}>{point.place_name}</PageTitle>
                                        <p> {point.address_name}</p>
                                    </div>
                                    <Button onClick={() => removeDeparturePoint(index)} width='3rem' height='2.5rem'>-</Button>
                                </div>
                            ))}
                        </ScrollContainer>

                        <Container>
                            <ConvexHullCalculator departurePoints={departurePoints} onSelectTown={handleSelectTown} selectedButton={selectedButton}/> 
                        </Container>
                    </DepartureContainer>

                    <RecommendResult>
                        <MapContainer>
                            <KakaoMap selectedRecommendedTown={selectedRecommendedTown} departurePoints={departurePoints} searchKeyword={keyword} setPlaces={setPlaces}/>
                        </MapContainer>
                    </RecommendResult>
                </RecommendContainer>
             
            </SidebarContainer>   
        </div>
    );
};




