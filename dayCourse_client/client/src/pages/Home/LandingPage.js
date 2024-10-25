import React, { useEffect, useState } from 'react';
import KakaoMap from './KakaoMap';
import RightSidebar from './RightSidebar';
import styled from "styled-components";
import { fetchPlace, addPlace, deletePlace } from './PlaceApi'; 
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const SelectedPlacesContainer = styled.div`
    display: flex; 
    flex-direction: column; 
`;
const PlaceBox = styled.div`
    margin: 10px;
`;
const DeleteButton = styled.button`
    margin-top: 5px;
    background-color: #ff4d4d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: #e60000;
    }
`;

const LandingPage = () => {
    const [keyword, setKeyword] = useState("");
    const [places, setPlaces] = useState([]);
    const [selectedPlaces, setSelectedPlaces] = useState([]);

    const userId = 1; 
    const planId = 10; 

    const submitKeyword = (newKeyword) => {
        setKeyword(newKeyword);
    };

    const addSelectedPlace = async (place) => {
        try {
            const addedPlace = await addPlace(userId, planId, place);
            console.log("Added place:", addedPlace); // 추가된 장소 로그 확인
            if (addedPlace && addedPlace.placeId) {
                // 기존 선택된 장소를 복사하고 추가된 장소를 포함
                setSelectedPlaces(prevSelected => {
                    const updatedPlaces = [...prevSelected, addedPlace];
                    // 우선 순위 업데이트
                    return updatedPlaces.map((p, index) => ({
                        ...p,
                        l_priority: index + 1, // 인덱스를 기반으로 우선 순위 설정
                    }));
                });
            } else {
                console.error("Invalid place added:", addedPlace);
            }
        } catch (error) {
            console.error("장소 추가 실패!!:", error);
        }
    };
    const removePlace = async (placeId) => {
        try {
            await deletePlace(placeId);
            setSelectedPlaces((prevSelected) => {
                const updatedPlaces = prevSelected.filter(place => place.placeId !== placeId);
                // 우선 순위 업데이트
                return updatedPlaces.map((place, index) => ({
                    ...place,
                    l_priority: index + 1, // 인덱스를 기반으로 우선 순위 설정
                }));
            });
        } catch (error) {
            console.error("장소 삭제 실패!", error);
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const reorderedPlaces = Array.from(selectedPlaces);
        const [movedPlace] = reorderedPlaces.splice(result.source.index, 1);
        reorderedPlaces.splice(result.destination.index, 0, movedPlace);

        // 우선 순위 업데이트
        const updatedPlaces = reorderedPlaces.map((place, index) => ({
            ...place,
            l_priority: index + 1,
        }));

        setSelectedPlaces(updatedPlaces);
    };

    useEffect(() => {
        const fetchExistPlace = async () => {
            try {
                const existPlace = await fetchPlace(userId, planId);
                if (Array.isArray(existPlace)) {
                    setSelectedPlaces(existPlace);
                } else {
                    console.error("Invalid data format:", existPlace);
                    setSelectedPlaces([]);
                }
            } catch (error) {
                console.error("기존 장소 불러오기 실패!", error);
            }
        };
        fetchExistPlace();
    }, [userId, planId]);

    return (
        <div className="landing-page">
            <RightSidebar 
                userId={userId} 
                planId={planId} 
                places={places} 
                setPlaces={setPlaces} 
                addPlace={addSelectedPlace} 
                onSubmitKeyword={submitKeyword} 
                setSelectedPlaces={setSelectedPlaces} 
            />
            <KakaoMap searchKeyword={keyword} setPlaces={setPlaces} />

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="places">
                    {(provided) => (
                        <SelectedPlacesContainer 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {selectedPlaces.map((place, index) => {
                                 // 유효한 place 객체인지 확인
                                 if (!place || !place.placeId || !place.place_name) {
                                    console.warn("Invalid place object:", place);
                                    return null; // 유효하지 않은 객체는 렌더링하지 않음
                                }
                                return (
                                <Draggable
                                    key={place.placeId.toString()}
                                    draggableId={place.placeId.toString()}
                                    index={index}
                                >
                                    {(provided) => (
                                        <PlaceBox 
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <h5>{place.l_priority}. {place.place_name}</h5>
                                            {place.place && <span>{place.place}</span>}
                                            <span>{place.address_name}</span>
                                            <span>{place.phone}</span>
                                            <DeleteButton onClick={() => removePlace(place.placeId)}>삭제</DeleteButton>
                                        </PlaceBox>
                                    )}
                                </Draggable>
                                );
                            })}
                            {provided.placeholder}
                        </SelectedPlacesContainer>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default LandingPage;

