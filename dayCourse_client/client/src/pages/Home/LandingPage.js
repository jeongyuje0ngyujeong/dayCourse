// LandingPage.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import KakaoMap from './KakaoMap';
import RightSidebar from './RightSidebar';
import styled from "styled-components";
import { fetchPlace, addPlace, deletePlace, updatePlacePriority, addRecommendedPlace, fullCourseRecommend} from './PlaceApi'; 
//import { fetchPlace, addPlace, deletePlace, updatePlacePriority, addRecommendedPlace,recommendRoutes, fetchDistance } from './PlaceApi'; 

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import io from 'socket.io-client';
import throttle from 'lodash/throttle';
import Loader from './Loader'; // 로딩 스피너 컴포넌트
import SocketContext from '../../SocketContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMousePointer } from '@fortawesome/free-solid-svg-icons';



const UserCursor = styled(FontAwesomeIcon)`
    position: absolute;
    pointer-events: none;
    z-index: 1000;
    width: 30px; /* 아이콘 크기 조절 */
    height: 30px;
    transform: translate(-50%, -50%); /* 아이콘을 정확히 커서 위치에 맞추기 */
`;



// Styled Components
const SelectedPlacesContainer = styled.div`
    display: flex; 
    flex-direction: column; 
`;
const PlaceBox = styled.div`
    display: flex;
    align-items: center; /* 수직 중앙 정렬 */
    justify-content: space-between; /* 공간을 양쪽 끝에 배치 */
    width: 100%; /* 너비를 줄여 컨테이너 안에서 맞춤 */
    ${'' /* margin: 5px; */}
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


// const Container = styled.div`
//     display: flex;
//     flex-direction: row;
//     justify-content: space-between;
//     padding: 20px;
// `;

// const PlacesBox = styled.div`
//     flex: 2;
// `;

const RecommendButton = styled.button`
    padding: 5px 10px; /* 버튼 크기를 작게 조정 */
    background-color: white;
    border: 1px solid #90B54C;
    color: #90B54C;
    ${'' /* border: none; */}
    border-radius: 5px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    ${'' /* box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.25); */}
    cursor: pointer;
    font-size: 14px;
    margin-bottom: 10px; /* 버튼과 루트 목록 사이 간격 추가 */
    font-family: 'NPSfontBold', system-ui;
    font-size: 2vh;

    &:hover {
        background-color: #90B54C;
        color: white;
    }

    &:disabled {
        background-color: #90B54C;
        color: white;
        cursor: not-allowed;
    }
`;



const RowContainer = styled.div`
    display: flex;
    width: 75%;
    gap: 2vh; /* 간격 조정 */
    ${'' /* margin-top: 20px; */}
    justify-content: space-between; /* 내부 요소들을 좌우로 배치 */
   
`;

const SelectedPlacesContainer = styled.div`
    display: flex; 
    flex: 1;
    flex-direction: column;
    max-width: 48%; /* 최대 너비를 설정하여 컨테이너가 너무 커지지 않도록 */
`;

// const RecommendedRoutesBox = styled.div`
//     border: 1px solid #ddd;
//     border-radius: 10px;
//     padding: 20px;
//     background-color: #fefefe;
//     box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//     height: fit-content;
//     flex:1;
    
// `;

const LandingPage = ({ userId, planId, place, context, setUniqueUsers}) => {
    const { socket, joinRoom } = useContext(SocketContext); 
    const [keyword, setKeyword] = useState("");
    const [places, setPlaces] = useState([]);
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [isPlacesLoaded, setIsPlacesLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [userColors, setUserColors] = useState({});
    const [userCursors, setUserCursors] = useState({});
    
   // const [recommendedRoutes, setRecommendedRoutes] = useState([]);
   // const [distances, setDistances] = useState([]);
    const [version, setVersion] = useState(1);
    const [isRecommending, setIsRecommending] = useState(false); // 추천 로딩 상태
    const [recommendError, setRecommendError] = useState(null);
    const [isCourseRecommending, setIsCourseRecommending] = useState(false);
    const [courseRecommendError, setCourseRecommendError] = useState(null);
    


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
                setVersion(Math.max(...newSelectedPlaces.map(p=> p.version)) || 1);
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



    const fetchFullCourse = useCallback(async () => {
        setIsRecommending(true);
        try {
            const recommended = await fullCourseRecommend(planId, userId, version);
            console.log('추천된 코스', recommended);

            // 서버가 통합된 추천을 반환한다고 가정
            if (recommended && Array.isArray(recommended)) {
                const recommendedPlaces = recommended;

                // 기존 선택된 장소와 병합
                const updatedPlaces = [
                    ...selectedPlaces,
                    ...recommendedPlaces.map(place => ({
                        ...place,
                        l_priority: selectedPlaces.length + 1 + recommendedPlaces.indexOf(place),
                        version: version + 1,
                    }))
                ];

                setSelectedPlaces(updatedPlaces);
                setVersion(prev => prev + 1);

                await Promise.all(updatedPlaces.map(place =>
                    updatePlacePriority(
                        place.placeId || place.id,
                        place.l_priority,
                        userId,
                        place.version
                    )
                ));

                // 추천 결과를 소켓을 통해 다른 사용자에게 전송
                if (socket) {
                    socket.emit('course-recommended', { room: planId, updatedPlaces });
                }

                setRecommendError(null);
            } else {
                console.error("추천 코스 데이터 형식이 올바르지 않습니다:", recommended);
                setRecommendError("추천 코스 데이터를 불러오는 데 문제가 있습니다.");
            }
        } catch (error) {
            console.error("코스 추천 가져오기 실패:", error);
            setRecommendError("코스 추천을 가져오는 데 실패했습니다.");
        } finally {
            setIsRecommending(false);
        }
    }, [planId, selectedPlaces, userId, socket, version]);

    // useEffect(() => {
    //     fetchFullCourse(); // 컴포넌트가 처음 렌더링될 때 코스 추천 데이터를 불러옵니다.
    // }, [fetchFullCourse]);




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


        // 루트 추천 결과 수신
        socket.on('route-recommended', ({ updatedPlaces }) => {
            setSelectedPlaces(updatedPlaces);
        });


        // // 루트 추천 결과 수신
        // socket.on('route-recommended', ({ updatedPlaces }) => {
        //     setSelectedPlaces(updatedPlaces);
        // });

        // **코스 추천 결과 수신**
        socket.on('course-recommended', ({ updatedPlaces }) => {
            setSelectedPlaces(updatedPlaces);
        });


        return () => {
            socket.off('roomData');
            socket.off('user-joined');
            socket.off('user-left');
            socket.off('user-mouse-move');
            socket.off('places-updated');
            socket.off('route-recommended'); 
            socket.off('course-recommended'); 
        };
    }, [socket, planId, joinRoom,setUniqueUsers]);

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

        // useEffect(() => {
        //     const loadDistance = async () => {
        //         if (selectedPlaces.length > 1) {
        //             const distances = await fetchDistance(planId, userId);
        //             console.log("받은 거리 정보:", distances);
        //             setDistances(distances.distances);
        //         } else {
        //             setDistances([]); // 선택된 장소가 1개 이하일 경우 거리 정보를 빈 배열로 초기화
        //         }
        //     };
        //     loadDistance();
        // }, [selectedPlaces, planId, userId]);

        return (
            <div className="landing-page">
                {!isPlacesLoaded ? (
                    <Overlay>
                        <Loader />
                    </Overlay>
                ) : error ? (
                    <div style={{ padding: '20px', color: 'red' }}>{error}</div>
                ) : (
                    <>
                        <KakaoMap 
                            searchKeyword={keyword} 
                            setPlaces={setPlaces} 
                            selectedPlaces={selectedPlaces || []} 
                        />
                                                
                        <RightSidebar 
                            userId={userId} 
                            planId={planId} 
                            planInfo={context}
                            places={places} 
                            setPlaces={setPlaces} 
                            onSubmitKeyword={submitKeyword} 
                            onPlaceClick={handlePlaceClick}
                        />

<RowContainer>
                        <SelectedPlacesContainer>
                            <RecommendButton onClick={fetchFullCourse} disabled={isRecommending}>
                                {isRecommending ? '추천 중...' : '코스 추천'}
                            </RecommendButton>
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="places">
                                    {(provided) => (
                                        <div 
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {selectedPlaces.map((place, index) => (
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
                                                                <div>
                                                                    <h5>{index + 1}. {place.place_name}</h5>
                                                                    <span>{place.place || "주소 정보 없음"}</span>
                                                                </div>
                                                                <DeleteButton onClick={() => removePlace(place.placeId)}>X</DeleteButton>
                                                            </PlaceBox>
                                                        )}
                                                    </Draggable>

                                                    {/* 거리 표시 */}
                                                    {selectedPlaces.length > 1 && index < selectedPlaces.length - 1 && (
                                                        <DistanceBox>
                                                            {/* 거리 정보 필요 시 활성화 */}
                                                            {/* {`거리 : ${(distances[index] / 1000).toFixed(2)} km`} */}
                                                        </DistanceBox>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                    
                            {isRecommending && <div>추천 중입니다...</div>}
                            {recommendError && <div style={{ color: 'red' }}>{recommendError}</div>}
                        </SelectedPlacesContainer>

                        {/* 다른 사용자의 마우스 커서 표시 */}
                        {Object.entries(userCursors).map(([userId, cursorData]) => (
                            <div key={userId}>
                                <UserCursor 
                                    icon={faMousePointer} 
                                    color={userColors[userId]} 
                                    style={{ top: cursorData.y, left: cursorData.x }}
                                    title={cursorData.name}
                                />
                            </div>
                        ))}
                    </RowContainer>
                    </>
                )}
            </div>
        );
    };
    
    export default LandingPage;