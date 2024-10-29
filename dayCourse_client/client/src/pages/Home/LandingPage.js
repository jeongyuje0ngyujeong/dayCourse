import React, { useEffect, useState } from 'react';
import KakaoMap from './KakaoMap';
import RightSidebar from './RightSidebar';
import styled from "styled-components";
// TMAP 거리 계산 API
// import { fetchPlace, addPlace, deletePlace, updatePlacePriority , fetchDistance} from './PlaceApi'; 
import { fetchPlace, addPlace, deletePlace, updatePlacePriority ,} from './PlaceApi'; 
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

const DistanceBox = styled.div`
    margin: 10px 0;
    font-weight: bold;
`;



const LandingPage = ({userId, planId, place, context}) => {
    console.log('context: ',context);
    console.log("LandingPage Props - userId:", userId, "planId:", planId); // 로그 확인
    const [keyword, setKeyword] = useState("");
    const [places, setPlaces] = useState([]);
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    // TMAP 거리 계산 API
    // const [distances, setDistances] = useState([]);
    const distances = [];

    const submitKeyword = (newKeyword) => {
        setKeyword(newKeyword);
    };

    const fetchExistPlace = async () => {
        try {
            const existPlace = await fetchPlace(userId, planId);
            console.log("Fetched places:", existPlace); // 데이터 로그 확인
            if (Array.isArray(existPlace)) {
                const sortedPlaces = existPlace.sort((a, b) => a.l_priority - b.l_priority);
                setSelectedPlaces(sortedPlaces.map((place) => ({
                    ...place,
                    // l_priority: index + 1, // 초기 우선 순위 설정
                    version: place.version || 1 //버전이 존재하고 유효한 값이라면 해당값을 사용하고, 아니면 버전정보=>1
                })));
            } else {
                console.error("Invalid data format:", existPlace);
                setSelectedPlaces([]);
            }
        } catch (error) {
            console.error("기존 장소 불러오기 실패!", error);
        }
    };


    // const handlePlaceClick = async (place) => {
    //     try {
    //         const addedPlace = await addPlace(userId, planId, place);
    //         await fetchExistPlace(); // 상태를 갱신하기 위해 전체 장소 목록을 다시 가져옵니다.
    //         setSelectedPlaces(prevSelected => {
    //             const updatedPlaces = [...prevSelected, addedPlace];
    //             return updatedPlaces.map((p, index) => ({
    //                 ...p,
    //                 l_priority: index + 1,
    //             }));
    //         });
    //     } catch (error) {
    //         console.error("장소 추가 실패:", error);
    //     }
    // };


    const handlePlaceClick = async (place) => {
        try {
            await addPlace(userId, planId, place);
            await fetchExistPlace(); // 상태 갱신
        } catch (error) {
            console.error("장소 추가 실패:", error);
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
    
        // 우선 순위 업데이트
        const updatedPlaces = reorderedPlaces.map((place, index) => ({
            ...place,
            l_priority: index + 1,
        }));
    
        // 우선 순위를 데이터베이스에 업데이트
        try {
            await Promise.all(updatedPlaces.map(place => 
                updatePlacePriority(
                    place.placeId || place.id,
                    place.l_priority,
                    userId,
                    place.version // 여전히 유효한 version 값 사용
                ))
            );
    
            // 상태 업데이트
            setSelectedPlaces(updatedPlaces);
        } catch (error) {
            console.error("우선 순위 업데이트 실패:", error);
        }
    };





    useEffect(() => {
        fetchExistPlace(); // 초기 렌더링 시 기존 장소를 가져옴
    }, [userId, planId, fetchExistPlace]);


    // TMAP 거리 계산 API
    // useEffect(() => {
    //     const loadDistance = async () => {
    //         if (selectedPlaces.length > 1) {
    //             const distances = await fetchDistance(planId, userId);
    //             console.log("받은 거리 정보:", distances);
    //             setDistances(distances.distances);
    //         }  else {
    //             setDistances([]); // 선택된 장소가 1개 이하일 경우 거리 정보를 빈 배열로 초기화
    //         }
    //     };
    //     loadDistance();
    // }, [selectedPlaces]);

    return (
        <div className="landing-page">
            <RightSidebar 
                userId={userId} 
                planId={planId} 
                planInfo={context}
                places={places} 
                setPlaces={setPlaces} 
               // addPlace={addSelectedPlace} 
                onSubmitKeyword={submitKeyword} 
                onPlaceClick={handlePlaceClick} // 함수 전달
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
                        if (!place || (!place.placeId && !place.id) || !place.place_name) {
                            console.warn("Invalid place object:", place);
                            return null; // 유효하지 않은 객체는 렌더링하지 않음
                        }
                        return (
                            <React.Fragment key={place.placeId?.toString() || place.id?.toString()}>
                                <Draggable
                                    draggableId={place.placeId?.toString() || place.id?.toString()} 
                                    index={index}
                                >
                                    {(provided) => (
                                        <PlaceBox 
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                        <h5>{selectedPlaces.indexOf(place) + 1}. {place.place_name}</h5>
                                            {place.place && <span>{place.place}</span>}
                                            <span>{place.address_name}</span>
                                            <span>{place.phone}</span>
                                            <DeleteButton onClick={() => removePlace(place.placeId)}>삭제</DeleteButton>
                                        </PlaceBox>
                                    )}
                                </Draggable>

                                {index < selectedPlaces.length - 1 && distances[index] !== undefined && (
                                <DistanceBox>
                                        {`거리 : ${(distances[index] / 1000).toFixed(2)} km`}
                                </DistanceBox>
                                )}
                            </React.Fragment>
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