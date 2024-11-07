// LandingPage.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import KakaoMap from './KakaoMap';
import RightSidebar from './RightSidebar';
import styled from "styled-components";
import { fetchPlace, addPlace, deletePlace, updatePlacePriority, addRecommendedPlace } from './PlaceApi'; 
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import io from 'socket.io-client';
import throttle from 'lodash/throttle';
import Loader from './Loader'; // 로딩 스피너 컴포넌트
import SocketContext from '../../SocketContext';

// Styled Components
const SelectedPlacesContainer = styled.div`
    display: flex; 
    flex-direction: column; 
`;
const PlaceBox = styled.div`
    display: flex;
    align-items: center; /* 수직 중앙 정렬 */
    justify-content: space-between; /* 공간을 양쪽 끝에 배치 */
    width: 35%;
    margin: 5px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0.1, 0.1, 0.1, 0.1);
    transition: box-shadow 0.3s ease;

    &:hover {
        box-shadow: 0 6px 10px rgba(0.15, 0.15, 0.15, 0.15);
    }

    h5 {
        margin: 0;
        font-size: 16px;
        font-weight: normal;
    }

    span {
        font-size: 14px;
        color: #666;
    }
`;
const DeleteButton = styled.button`
    margin-left: 10px; 
    background-color: #ff4d4d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    padding: 5px 10px;

    &:hover {
        background-color: #e60000;
    }
`;
const DistanceBox = styled.div`
    margin: 10px 0;
    font-weight: bold;
`;
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;
const UserCursor = styled.div`
    position: absolute;
    pointer-events: none;
    z-index: 1000;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${props => props.color || 'red'};
    transform: translate(-50%, -50%);
`;

const Container = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 20px;
`;

const PlacesBox = styled.div`
    flex: 2;
`;

const RecommendButton = styled.button`
    padding: 5px 10px; /* 버튼 크기를 작게 조정 */
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    margin-bottom: 10px; /* 버튼과 루트 목록 사이 간격 추가 */

    &:hover {
        background-color: #45a049;
    }

    &:disabled {
        background-color: #a5d6a7;
        cursor: not-allowed;
    }
`;



const RowContainer = styled.div`
    display: flex;
    width: 100%;
    gap: 50px; /* 간격 조정 */
    margin-top: 20px;
`;

const SelectedPlacesContainer = styled.div`
    display: flex; 
    flex-direction: column;
`;

const RecommendedRoutesBox = styled.div`
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 20px;
    background-color: #fefefe;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    height: fit-content;
    width: 33%;
    
`;

const LandingPage = ({ userId, planId, place, context }) => {
    const [keyword, setKeyword] = useState("");
    const [places, setPlaces] = useState([]);
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [isPlacesLoaded, setIsPlacesLoaded] = useState(false);
    const [error, setError] = useState(null);
    const distances = [];

    const [users, setUsers] = useState([]);
    const [userColors, setUserColors] = useState({});
    const [userCursors, setUserCursors] = useState({});

    const socketRef = useRef(null);

    const submitKeyword = (newKeyword) => {
        setKeyword(newKeyword);
    };

    const fetchExistPlace = async () => {
        try {
            const existPlace = await fetchPlace(userId, planId);
            console.log("Fetched places:", existPlace);
            if (Array.isArray(existPlace)) {
                const sortedPlaces = existPlace.sort((a, b) => a.l_priority - b.l_priority);
                const newSelectedPlaces = sortedPlaces.map((place) => ({
                    ...place,
                    version: place.version || 1
                }));
                setSelectedPlaces(newSelectedPlaces);
                setError(null);
                return newSelectedPlaces;
            } else {
                console.error("Invalid data format:", existPlace);
                setSelectedPlaces([]);
                setError("유효하지 않은 데이터 형식입니다.");
            }
        } catch (error) {
            console.error("기존 장소 불러오기 실패!", error);
            setSelectedPlaces([]);
            setError("장소를 불러오는 데 실패했습니다.");
        } finally {
            setIsPlacesLoaded(true);
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


    const handlePlaceClick = async (place, isRecommended = false) => {
        console.log('추가할 장소:', place);
        try {
            if (isRecommended) {
                await addRecommendedPlace(userId, planId, place);
            } else {
                await addPlace(userId, planId, place);
            }
            const updatedPlaces = await fetchExistPlace();

            if (socket) {
                socket.emit('update-places', { room: planId, places: updatedPlaces });
            }

        } catch (error) {
            console.error("장소 추가 실패:", error);
        }
    };

    const removePlace = async (placeId) => {
        try {
            await deletePlace(placeId, userId);
            const updatedPlaces = await fetchExistPlace();
            if (socket) {
                socket.emit('update-places', { room: planId, places: updatedPlaces });
            }
        } catch (error) {
            console.error("장소 삭제 실패!", error);
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) {
            return;
        }

        const reorderedPlaces = Array.from(selectedPlaces);
        const [movedPlace] = reorderedPlaces.splice(result.source.index, 1);
        reorderedPlaces.splice(result.destination.index, 0, movedPlace);

        const updatedPlaces = reorderedPlaces.map((place, index) => ({
            ...place,
            l_priority: index + 1,
        }));

        setSelectedPlaces(updatedPlaces);
        try {
            await Promise.all(updatedPlaces.map(place => 
                updatePlacePriority(
                    place.placeId || place.id,
                    place.l_priority,
                    userId,
                    place.version
                )
            ));
            if (socket) {
                socket.emit('update-places', { room: planId, places: updatedPlaces });
            }
        } catch (error) {
            console.error("우선 순위 업데이트 실패:", error);
        }
    };

    useEffect(() => {
        fetchExistPlace();
    }, [fetchExistPlace]);

    useEffect(() => {
        socketRef.current = io(process.env.REACT_APP_BASE_URLSS);

        socketRef.current.on('connect', () => {
            console.log('서버에 연결됨');
            
            socketRef.current.emit('join', { userId, name: `User_${userId}`, room: planId },
                (error) => {
                    if (error) {
                        alert(error.error);
                    } 
                }
            );
        });

        socketRef.current.on('disconnect', () => {
            console.log('서버 연결 끊어짐');
        });

        socketRef.current.on('roomData', ({ room, users }) => {
            console.log('수신한 roomData:', { room, users });
            setUsers(users);
            const colorMapping = {};
            users.forEach(user => {
                colorMapping[user.userId] = user.color;
            });
            setUserColors(colorMapping);
        });
        
        socketRef.current.on('user-mouse-move', ({ userId, name, cursor }) => {
            console.log('수신한 user-mouse-move:', { userId, name, cursor });
            setUserCursors(prev => ({
                ...prev,
                [userId]: { ...cursor, name }
            }));
        });

        socketRef.current.on('message', (message) => {
            console.log('수신한 메세지:', message);
        });

        socketRef.current.on('places-updated', (updatedPlaces) => {
            setSelectedPlaces(updatedPlaces);
        }); 

        socketRef.current.on('user-left', ({ userId }) => {
            setUserCursors(prev => {
                const updated = {...prev};
                delete updated[userId];
                return updated;
            });
            setUsers(prevUsers => prevUsers.filter(user => user.userId !== userId));
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [userId, planId]);

    useEffect(() => {
        if (!socket) return;

        const throttledMouseMove = throttle((e) => {
            const x = e.clientX;
            const y = e.clientY;
            socketRef.current.emit('mouse-move', { room: planId, x, y });
        }, 100);

        window.addEventListener('mousemove', throttledMouseMove);

        return () => {
            window.removeEventListener('mousemove', throttledMouseMove);
            throttledMouseMove.cancel();
        }
    }, [socket, planId]);

    useEffect(() => {
        if (isPlacesLoaded) {
            console.log("장소 데이터가 성공적으로 로드되었습니다.");
            // 추가적인 작업 수행 가능
        }
    }, [isPlacesLoaded]);


        //TMAP 거리 계산 API 

        useEffect(() => {
            const loadDistance = async () => {
                if (selectedPlaces.length > 1) {
                    const distances = await fetchDistance(planId, userId);
                    console.log("받은 거리 정보:", distances);
                    setDistances(distances.distances);
                } else {
                    setDistances([]); // 선택된 장소가 1개 이하일 경우 거리 정보를 빈 배열로 초기화
                }
            };
            loadDistance();
        }, [selectedPlaces, planId, userId]);

    return (
        <div className="landing-page">
            {!isPlacesLoaded && (
                <Overlay>
                    <Loader />
                </Overlay>
            )}
            {isPlacesLoaded && error ? (
                <div style={{ padding: '20px', color: 'red' }}>{error}</div>
            ) : (
                <>
                    <RightSidebar 
                        userId={userId} 
                        planId={planId} 
                        planInfo={context}
                        places={places} 
                        setPlaces={setPlaces} 
                        onSubmitKeyword={submitKeyword} 
                        onPlaceClick={handlePlaceClick}
                    />
                    <KakaoMap 
                        searchKeyword={keyword} 
                        setPlaces={setPlaces} 
                        selectedPlaces={selectedPlaces || []} 
                    />

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="places">
                            {(provided) => (
                                <SelectedPlacesContainer 
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {selectedPlaces.map((place, index) => {
                                        if (!place || (!place.placeId && !place.id) || !place.place_name) {
                                            console.warn("Invalid place object:", place);
                                            return null;
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
                                                            <h5>{index + 1}. {place.place_name}</h5>
                                                            <span>{place.address_name}</span>
                                                            <DeleteButton onClick={() => removePlace(place.placeId)}>삭제</DeleteButton>
                                                        </PlaceBox>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </SelectedPlacesContainer>
                                )}
                            </Droppable>
                        </DragDropContext>

                        {/* 다른 사용자의 마우스 커서 표시 */}
                        {Object.entries(userCursors).map(([userId, cursorData]) => (
                            <div key={userId}>
                                <UserCursor 
                                    style={{ top: cursorData.y, left: cursorData.x, backgroundColor: userColors[userId] }}
                                    title={cursorData.name}
                                />
                                <span style={{ position: 'absolute', top: cursorData.y + 15, left: cursorData.x, color: userColors[userId], backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '2px 4px', borderRadius: '4px', pointerEvents: 'none' }}>
                                    {cursorData.name}
                                </span>
                            </div>
                        ))}

                        {/* 현재 접속한 사용자 목록 표시 */}
                        <div style={{ position: 'absolute', top: "10%", left: "35%", background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '8px' }}>
                            <h4>접속 사용자</h4>
                            <ul>
                                {uniqueUsers.map(user => (
                                    <li key={user.userId} style={{ color: user.color }}>{user.name}</li>
                                ))}
                            </ul>
                        </div>

                        <RecommendedRoutesBox>
                            <RecommendButton onClick={fetchRecommendedRoutes} disabled={isRecommending}>
                                {isRecommending ? '추천 중...' : '루트 추천'}
                            </RecommendButton>
                            <div style={{ marginTop: '10px' }}>
                                {isRecommending ? (
                                    <div>추천 중입니다...</div>
                                ) : recommendError ? (
                                    <div style={{ color: 'red' }}>{recommendError}</div>
                                ) : recommendedRoutes.length > 0 ? (
                                    recommendedRoutes.map((place, index) => (
                                        <div key={index} style={{ marginBottom: '15px' }}>
                                            <PlaceBox>
                                                <div>
                                                    <h5>{index + 1}. {place.placeName}</h5>
                                                    <span>{place.placeAddr}</span>
                                                </div>
                                            </PlaceBox>
                                        </div>
                                    ))
                                ) : (
                                    <div>추천된 루트가 없습니다.</div>
                                )}
                            </div>
                        </RecommendedRoutesBox>
                    </RowContainer>
                </>
            )}
        </div>
    );
};

export default LandingPage;