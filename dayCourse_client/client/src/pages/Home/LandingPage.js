import React, { useEffect, useState } from 'react';
import KakaoMap from './KakaoMap';
import RightSidebar from './RightSidebar';
import styled from "styled-components";
import { fetchPlace, addPlace, deletePlace, updatePlacePriority } from './PlaceApi'; 
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

    const fetchExistPlace = async () => {
        try {
            const existPlace = await fetchPlace(userId, planId);
            console.log("Fetched places:", existPlace); // 데이터 로그 확인
            if (Array.isArray(existPlace)) {
                setSelectedPlaces(existPlace.map((place, index) => ({
                    ...place,
                    l_priority: index + 1, // 초기 우선 순위 설정
                })));
            } else {
                console.error("Invalid data format:", existPlace);
                setSelectedPlaces([]);
            }
        } catch (error) {
            console.error("기존 장소 불러오기 실패!", error);
        }
    };

    const addSelectedPlace = async (place) => {
        try {
            const addedPlace = await addPlace(userId, planId, place);
            console.log("Added place:", addedPlace); // 추가된 장소 로그 확인
         
                setSelectedPlaces(prevSelected => {
                    const updatedPlaces = [...prevSelected, addedPlace];
                    return updatedPlaces.map((p, index) => ({
                        ...p,
                        l_priority: index + 1, // 인덱스를 기반으로 우선 순위 설정
                    }));
                });

        } catch (error) {
            console.error("장소 추가 실패!!:", error);
        }
    };

    const removePlace = async (placeId) => {
        try {
            await deletePlace(placeId, userId);
            fetchExistPlace(); // 삭제 후 기존 장소 목록을 다시 가져옴
        } catch (error) {
            console.error("장소 삭제 실패!", error);
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) {
            return; // 목적지가 없으면 아무 작업도 하지 않음
        }

        const reorderedPlaces = Array.from(selectedPlaces);
        const [movedPlace] = reorderedPlaces.splice(result.source.index, 1);
        reorderedPlaces.splice(result.destination.index, 0, movedPlace);

        // 우선 순위 업데이트 및 데이터베이스에 반영
        const updatedPlaces = reorderedPlaces.map((place, index) => ({
            ...place,
            l_priority: index + 1,
        }));

        setSelectedPlaces(updatedPlaces); // 상태 업데이트

        // 우선 순위를 데이터베이스에 업데이트
        try {
            await Promise.all(updatedPlaces.map(place => 
                updatePlacePriority(place.placeId || place.id, place.l_priority) // placeId 또는 id 사용
            ));
        } catch (error) {
            console.error("우선 순위 업데이트 실패:", error);
        }
    };

    useEffect(() => {
        fetchExistPlace(); // 초기 렌더링 시 기존 장소를 가져옴
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
                        if (!place || !place.placeId && !place.id || !place.place_name) {
                            console.warn("Invalid place object:", place);
                            return null; // 유효하지 않은 객체는 렌더링하지 않음
                        }
                        return (
                            <Draggable
                                key={place.placeId?.toString() || place.id?.toString()} // 고유한 키 설정
                                draggableId={place.placeId?.toString() || place.id?.toString()} // 고유한 드래그 가능 ID 설정
                                index={index}
                            >
                                        {(provided) => (
                                            <PlaceBox 
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <h5>{index +1}. {place.place_name}</h5>
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