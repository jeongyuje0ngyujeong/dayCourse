import React, { useEffect, useState } from 'react';
import KakaoMap from './KakaoMap';
import RightSidebar from './RightSidebar';
import styled from "styled-components";
import { fetchPlace, addPlace, deletePlace, updatePlacePriority, fetchDistance } from './PlaceApi'; 
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


const LandingPage = (props) => {
    const [keyword, setKeyword] = useState("");
    const [places, setPlaces] = useState([]);
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [distances, setDistances] = useState([]);
    const planInfo = props.context;
    
    // userId와 planId 가져오기
    const userId = sessionStorage.getItem('userId');
    const planId = planInfo.planId // planId도 세션 스토리지에서 가져옵니다.
    // console.log('planId: ',planId);

    const submitKeyword = (newKeyword) => {
        setKeyword(newKeyword);
    };

    const fetchExistPlace = async () => {
        try {
            const existPlace = await fetchPlace(planId); // planId만 전달
            console.log("Fetched places:", existPlace); // 데이터 로그 확인
            if (Array.isArray(existPlace)) {
                setSelectedPlaces(existPlace.map((place, index) => ({
                    ...place,
                    l_priority: index + 1, // 초기 우선 순위 설정
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

    const addSelectedPlace = async (place) => {
        try {
            const addedPlace = await addPlace(planId, place); // planId와 place만 전달
            console.log("Added place:", addedPlace); // 추가된 장소 로그 확인
            
            // 이전 선택된 장소 상태에 추가
            setSelectedPlaces(prevSelected => {
                // 새 장소를 추가한 배열을 생성
                const updatedPlaces = [...prevSelected, { ...addedPlace, l_priority: prevSelected.length + 1 }];
                // l_priority를 인덱스 기반으로 설정
                return updatedPlaces.map((p, index) => ({
                    ...p,
                    l_priority: index + 1, // 인덱스를 기반으로 우선 순위 설정
                }));
            });
            console.log(selectedPlaces);

        } catch (error) {
            console.error("장소 추가 실패!!:", error);
        }
    };

    const removePlace = async (placeId) => {
        if (!placeId) {
            console.error("삭제할 장소의 ID가 유효하지 않습니다.");
           // setErrorMessage("삭제할 장소의 ID가 유효하지 않습니다.");
            return;
        }
        console.log('삭제할 장소 ID:', placeId);
       // setIsDeleting(true);
        try {
            await deletePlace(placeId); // deletePlace 함수는 placeId만 받음
            fetchExistPlace(); // 삭제 후 장소 목록 다시 불러오기
           // setErrorMessage("");
            alert("장소가 성공적으로 삭제되었습니다."); // 성공 메시지 추가
        } catch (error) {
            console.error("장소 삭제 실패!", error);
           // setErrorMessage("장소 삭제에 실패했습니다. 다시 시도해주세요.");
        } finally {
          // setIsDeleting(false);
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
                updatePlacePriority(place.placeId||place.id, place.l_priority, place.version) // placeId 또는 id 사용
            ));
        } catch (error) {
            console.error("우선 순위 업데이트 실패:", error);
        }
    };

    useEffect(() => {
        if (planId) {
            fetchExistPlace(); // planId가 존재할 때만 기존 장소를 가져옴
        }
    }, [planId]);

    useEffect(() => {
        const loadDistance = async () => {
            if (selectedPlaces.length > 1) {
                const distances = await fetchDistance(planId);
                console.log("받은 거리 정보:", distances);
                setDistances(distances);
            }
        };
        loadDistance();
    }, [selectedPlaces]);

    return (
        <div className="landing-page">
            <RightSidebar 
                userId={userId} // userId를 사용
                planId={planId} // planId를 사용
                planInfo={planInfo}
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

                                        {index < selectedPlaces.length - 1 && distances[index] && (
                                            <DistanceBox>
                                                {`거리 : ${distances[index]}`} 
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