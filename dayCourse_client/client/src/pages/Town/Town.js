import { Form, useLoaderData, redirect,useSubmit, } from "react-router-dom";
import { createSchedule, updateSchedule, getEvent, getToken, getSi} from "../../schedules";
import React, { useState, useEffect, useCallback } from 'react';
import KakaoMap from './InputTown';
import styled from "styled-components";
import {Button} from '../../Button';
import axios from 'axios';


export async function loader({ params }) {
      const { planId } = params;
      const event = await getEvent(planId);
      return { event };
    }

export async function action({ request, params }) {
    // console.log('dd');
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);

    const town = formData.get("town");
    const planId = params.planId;
    
    await updateSchedule(planId, updates);
    return redirect(`/main/empty`);
    // return null;
}


const SidebarContainer = styled.div`

    display: flex;
    flex-direction: column;
    margin:  auto;

    right: 0; 
    top: 0; 
    height: 100%; 
    overflow-y: auto;
`;

const ResultContainer = styled.div`
    position: relative;
    max-height: 15rem;  
    overflow-y: auto;
`

const SearchContainer = styled.form`
    display: flex;
    position: relative;

    gap: 1rem;
    ${'' /* align_items: center; */}
        
    height: 7%;
`

const SidebarInput = styled.input`
    ${'' /* width: 100%; 
    height: 100%; */}
    flex: 5;
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
`;

const SidebarButton = styled.button`
    border: 1px solid #ced4da;
    border-radius: 4px;
    cursor: pointer;
    &:hover {
        background-color: #0056b3;
    }
`;

const SelectedPlacesContainer = styled.div`
    display: column;
`;

const PlaceBox = styled.div`
    margin: 10px;
`;

const MapOnOff = styled.div`
    display: none;
`

const SelectedPlaceName = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const DeleteButton = styled.button`
    margin-top: 5px;
    background-color: #ff4d4d; /* 삭제 버튼 색상 */
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: #e60000; /* hover 시 색상 변경 */
    }
`;

const LandingPage = () => {
    async function loadSi() {
        const si = await getSi();
        console.log('Si:', si);
        return si;
    }

    const si = loadSi(); 

    const [keyword, setKeyword] = useState(""); // 제출한 검색어
    const [places, setPlaces] = useState([]); // 검색 결과 상태
    const [selectedPlaces, setSelectedPlaces] = useState(''); // 선택된 장소
    const [value, setValue] = useState(""); // 입력 값 상태
    const [showResult, setShowResult] = useState(true); // 결과 표시 여부

    const { event } = useLoaderData();
    let town;
    if (event) {
        town = event.town;
    }

    // 입력값 변화 감지
    const keywordChange = (e) => {
        setValue(e.target.value);
    };


    // 제출한 검색어 상태 업데이트
    const submitKeywordForm = (e) => {
        e.preventDefault();
        setKeyword(value); // 제출한 검색어를 상태로 저장
        setShowResult(true);
    };

    return (
        <div>
            <SidebarContainer>
                <h2>위치</h2>
                <SearchContainer onSubmit={submitKeywordForm}>
                    <SidebarInput
                        type="text"
                        placeholder='어디서 만나시나요?'
                        value={value}
                        onChange={keywordChange}
                        required
                    />
                    <SidebarButton type="submit">검색</SidebarButton>
                </SearchContainer>

                {showResult && ( // showResult가 true일 때만 결과를 표시
                    <ResultContainer id="search-result">
                        {places.length === 0 && value && ( // 검색 결과가 없을 때
                            <p className="result-text">검색 결과가 없습니다.</p>
                        )}
                        <ul id="places-list">
                            {places.map((place, index) => (
                                <li 
                                    key={index} 
                                    onClick={() => {
                                        setSelectedPlaces(place);
                                        setShowResult(false); // 결과 목록 숨기기
                                    }} 
                                    style={{ cursor: 'pointer' }}
                                >
                                    <h5>{place.place_name}</h5>
                                    {place.road_address_name && <span>{place.road_address_name}</span>}
                                    <span>{place.address_name}</span>
                                </li>
                            ))}
                        </ul>
                    </ResultContainer>
                )}
                <SelectedPlacesContainer>
                    {selectedPlaces && ( // 선택된 장소가 있을 때만 표시
                        <PlaceBox> 
                            <SelectedPlaceName>  
                                <h5>{selectedPlaces.place_name}</h5> 
                                <Button onClick={() => {setSelectedPlaces(''); setValue('');}} border='none'>X</Button>
                            </SelectedPlaceName>
                            {selectedPlaces.road_address_name && <span>{selectedPlaces.road_address_name}</span>}
                            <span>{selectedPlaces.address_name}</span>
                            {/* <span>{selectedPlaces.phone}</span> */}
                        </PlaceBox>
                    )}
                </SelectedPlacesContainer>

                <label>
                    <select name="selectedFruit"  placeholder="">
                        <option
                        value={'placeholder'}
                        disabled
                        hidden
                        selected
                        >시/군
                        </option>
                        <option value="apple">Apple</option>
                        <option value="banana">Banana</option>
                        <option value="orange">Orange</option>
                    </select>
                </label>
                <Form method="post">
                    <input type="hidden" name="town" value={selectedPlaces.place_name || ''} />
                    <Button type='submit' style={{ position: 'fixed', bottom: '30%', right: '6%' }} width='4rem' height='3rem' border='none' $background='#90B54C' color='white'> 다음 </Button>
                    
                </Form>
                
            </SidebarContainer>
            <MapOnOff>
                <KakaoMap searchKeyword={keyword} setPlaces={setPlaces} />
            </MapOnOff>
        </div>
    );
};

export default LandingPage;



