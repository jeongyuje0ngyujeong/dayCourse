import React, { useState } from 'react';
import KakaoMap from './KakaoMap';
import RightSidebar from './RightSidebar';
import styled from "styled-components";
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// const SelectedPlacesContainer = styled.div `
//     display:flex;
// `
const PlaceBox = styled.div `
    margin:10px;
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
    const [keyword, setKeyword] = useState(""); // 제출한 검색어
    const [places, setPlaces] = useState([]); // 검색 결과 상태
    const [selectedPlaces, setSelectedPlaces] = useState([])
    

    // 제출한 검색어 상태 업데이트
    const submitKeyword = (newKeyword) => {
        setKeyword(newKeyword);
    };

    const addPlace = (place) => {
        setSelectedPlaces((prevSelected) => [...prevSelected, place]);
    };

    const removePlace = (index) => {
        setSelectedPlaces((prevSelected) => prevSelected.filter((_, i) => i !== index));
    }

    

    return (
        <div className="landing-page">
            <RightSidebar onSubmitKeyword={submitKeyword} places={places} addPlace={addPlace}/>
            <KakaoMap searchKeyword={keyword} setPlaces={setPlaces} />
            <selectedPlacesContainer>
                {selectedPlaces.map((place, index) => (
                    <PlaceBox key = {index}>
                        <h5>{place.place_name}</h5>
                        {place.road_address_name && <span>{place.road_adrress_name}</span>}
                        <span>{place.address_name}</span>
                        <span>{place.phone}</span>
                        <DeleteButton onClick={() => removePlace(index)}>삭제</DeleteButton>
                    </PlaceBox>
               ))}
            </selectedPlacesContainer>
        </div>
    );
};

export default LandingPage;