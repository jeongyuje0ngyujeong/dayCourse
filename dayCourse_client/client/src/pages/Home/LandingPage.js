import React, { useEffect, useState } from 'react';
import KakaoMap from './KakaoMap';
import RightSidebar from './RightSidebar';
import styled from "styled-components";
import { fetchPlace, addPlace, deletePlace } from './PlaceApi'; 
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const SelectedPlacesContainer = styled.div `
    display:column;
`
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
    
    const userId = 1; // 예시 사용자 ID
    const planId = 10; // 예시 플랜 ID

    // 제출한 검색어 상태 업데이트
    const submitKeyword = (newKeyword) => {
        setKeyword(newKeyword);
    };

    const addSelectedPlace = async (place) => {
        try {
            const addedPlace = await addPlace(userId, planId, place);
            setSelectedPlaces((prevSelected) => [...prevSelected, addedPlace]);
        } catch (error) {
            console.error("장소 추가 실패!!:", error);
        }
    }



    const removePlace = async(index) => {
        try {
            const placeToRemove = selectedPlaces[index];
            await deletePlace(placeToRemove.id);
            setSelectedPlaces((prevSelected) => prevSelected.filter((_, i) => i != index));
        } catch (error) {
            console.error("장소 삭제 실패!", error);
        }
    };




    // const drag = (result) => {
    //     if (!result.destination) return;
    //     const reorderedPlaces = Array.from(selectedPlaces);
    //     const [movedPlace] = reorderedPlaces.splice(result.source.index, 1);
    //     reorderedPlaces.splice(result.destionation.index, 0, movedPlace);
    //     setSelectedPlaces(reorderedPlaces);
    // }




    useEffect(() => {
        const fetchExistPlace = async () => {
            try {
                const existPlace = await fetchPlace(userId, planId);
                if (Array.isArray(existPlace)){
                setSelectedPlaces(existPlace);
            } else {
                console.error("Invalid data format:", existPlace);
                setSelectedPlaces([]); // 잘못된 형식일 경우 빈 배열로 초기화
            }
            } catch (error) {
                console.error("기존 장소 불러오기 실패!", error);
            }
        };
        fetchExistPlace();
    }, [userId, planId]);

    
    return (
        <div className="landing-page">
            <RightSidebar userId={userId} planId={planId} places={places} setPlaces={setPlaces} addPlace={addSelectedPlace} onSubmitKeyword={submitKeyword} setSelectedPlaces={setSelectedPlaces} />
            <KakaoMap searchKeyword={keyword} setPlaces={setPlaces} />
            <SelectedPlacesContainer>
                {selectedPlaces.map((place, index) => (
                    <PlaceBox key = {index}>
                        <h5>{index +1}. {place.place_name}</h5>
                        {place.road_address_name && <span>{place.road_adrress_name}</span>}
                        <span>{place.address_name}</span>
                        <span>{place.phone}</span>
                        <DeleteButton onClick={() => removePlace(index)}>삭제</DeleteButton>
                    </PlaceBox>
               ))}
            </SelectedPlacesContainer>
        </div>
    );
};
// return (
//     <div className="landing-page">
//         <RightSidebar userId={userId} planId={planId} places={places} setPlaces={setPlaces} addPlace={addSelectedPlace} onSubmitKeyword={submitKeyword}/>
//         <KakaoMap searchKeyword={keyword} setPlaces={setPlaces} />
//         <DragDropContext drag={fragEnd}>
//             <Droppable droppableId="places">
//                 {(provided) => (
//                     <SelectedPlacesContainer {...provided.droppableProps} ref={provided.innerRef}>
//                         {selectedPlaces.map((place, index) => (
//                             <Draggable key={place.placeId} draggableId={place.placeId} index={index}>
//                                 {(provided) => (
//                                     <PlaceBox ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
//                                         <h5>{index + 1}. {place.place_name}</h5>
//                                         {place.road_address_name && <span>{place.road_address_name}</span>}
//                                         <span>{place.address_name}</span>
//                                         <span>{place.phone}</span>
//                                         <DeleteButton onClick={() => removePlace(index)}>삭제</DeleteButton>
//                                     </PlaceBox>
//                                 )}
//                             </Draggable>
//                         ))}
//                         {provided.placeholder} {/* 드래그 공간 유지 */}
//                     </SelectedPlacesContainer>
//                 )}
//             </Droppable>
//         </DragDropContext>
//     </div>
// );
// };


export default LandingPage;