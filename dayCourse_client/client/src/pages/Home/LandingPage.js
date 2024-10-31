// LandingPage.js
import React, { useEffect, useState, useCallback } from 'react';
import KakaoMap from './KakaoMap';
import RightSidebar from './RightSidebar';
import styled from "styled-components";
import { fetchPlace, addPlace, deletePlace, updatePlacePriority, fetchDistance } from './PlaceApi'; 
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const SelectedPlacesContainer = styled.div`
    display: flex; 
    flex-direction: column; 
`;

// ... 기타 Styled Components ...

const LandingPage = ({ userId, planId, context }) => {
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
                    version: place.version || 1 // 버전 정보 설정
                })));
            } else if (existPlace && Array.isArray(existPlace.data)) {
                setSelectedPlaces(existPlace.data.map((place) => ({
                    ...place,
                    version: place.version || 1
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


    useEffect(() => {
        fetchExistPlace(); // 초기 렌더링 시 기존 장소를 가져옴
    }, [userId, planId]);

    const handlePlaceClick = (place) => {
        // 장소 추가 로직 구현
        // 예시: setPlaces([...places, place]);
        setPlaces(prevPlaces => [...prevPlaces, place]);
    };

    // 추가: fetchPlaces 함수 정의 및 useEffect에서 호출
    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const data = await fetchPlace(userId, planId);
                console.log('Fetched places data:', data); // 응답 데이터 확인
                if (Array.isArray(data)) { // API가 {msg: 'success', place: Array} 형태일 때
                    setPlaces(data);
                } else if (Array.isArray(data.place)) {
                    setPlaces(data.place);
                } else if (data && Array.isArray(data.data)) { // 혹시 다른 구조일 경우
                    setPlaces(data.data);
                } else {
                    console.error('Unexpected data format:', data);
                    setPlaces([]);
                }
            } catch (error) {
                console.error('장소 불러오기 실패:', error);
                setPlaces([]);
            }
        };
        fetchPlaces();
    }, [userId, planId]);

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
                onPlaceClick={handlePlaceClick} 
            />
            <KakaoMap searchKeyword={keyword} setPlaces={setPlaces} />

            {/* Drag and Drop Context 및 Droppable 설정 */}
            {/* ... */}
        </div>
    );
};

export default LandingPage;