
import React, { useEffect, useState, useCallback, useContext } from 'react';
import KakaoMap from './KakaoMap';
import RightSidebar from './RightSidebar';
import styled from "styled-components";
import { fetchPlace, addPlace, deletePlace, updatePlacePriority, addRecommendedPlace, fullCourseRecommend } from './PlaceApi'; 
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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

// Styled Components (기존 스타일 유지)
const PlaceBox = styled.div`
    display: flex;
    align-items: center; /* 수직 중앙 정렬 */
    justify-content: space-between; /* 공간을 양쪽 끝에 배치 */
    width: 100%; /* 너비를 줄여 컨테이너 안에서 맞춤 */
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;

    &:hover {
        box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
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

    &:disabled {
        background-color: #ff4d4d;
        opacity: 0.6;
        cursor: not-allowed;
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

const RecommendButton = styled.button`
    padding: 5px 10px; /* 버튼 크기를 작게 조정 */
    background-color: white;
    border: 1px solid #90B54C;
    color: #90B54C;
    border-radius: 5px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
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
    justify-content: space-between; /* 내부 요소들을 좌우로 배치 */
`;

const SelectedPlacesContainer = styled.div`
    display: flex; 
    flex: 1;
    flex-direction: column;
    max-width: 48%; /* 최대 너비를 설정하여 컨테이너가 너무 커지지 않도록 */
`;

const LandingPage = ({ userId, planId, place, context, setUniqueUsers }) => {
    const { socket, joinRoom } = useContext(SocketContext); 
    const [keyword, setKeyword] = useState("");
    const [places, setPlaces] = useState([]);
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [isPlacesLoaded, setIsPlacesLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [userColors, setUserColors] = useState({});
    const [userCursors, setUserCursors] = useState({});
    const [version, setVersion] = useState(1);
    const [isRecommending, setIsRecommending] = useState(false); // 추천 로딩 상태
    const [recommendError, setRecommendError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false); // 삭제 로딩 상태
    const [deleteError, setDeleteError] = useState(null); // 삭제 에러 상태

    const submitKeyword = (newKeyword) => {
        setKeyword(newKeyword);
    };

    const fetchExistPlace = useCallback(async () => {
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
    }, [userId, planId]);

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

    const removePlace = async (placeId, isRecommended) => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const validPlaceId = placeId || place.id;
            console.log("삭제할 placeId:", validPlaceId);
            if (isRecommended) {
                console.log("관련 planId:", planId);
            }

            await deletePlace(validPlaceId, userId, isRecommended ? planId : null);

            const updatedPlaces = await fetchExistPlace();
            if (socket) {
                socket.emit('update-places', { room: planId, places: updatedPlaces });
            }
        } catch (error) {
            console.error("장소 삭제 실패!", error);
            setDeleteError("장소 삭제에 실패했습니다.");
        } finally {
            setIsDeleting(false);
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
    
            if (recommended && Array.isArray(recommended)) {
                // 추천된 장소를 데이터베이스에 추가
                await Promise.all(recommended.map(place => {
                    console.log('Adding recommended place:', place);
                    return addRecommendedPlace(userId, planId, place);
                }));
    
                // 업데이트된 장소 목록을 다시 불러옴
                const updatedPlaces = await fetchExistPlace();
                console.log('Updated Places:', updatedPlaces);
    
                setSelectedPlaces(updatedPlaces);
                setVersion(prev => prev + 1);
    
                // 모든 장소의 우선순위를 업데이트
                await Promise.all(updatedPlaces.map(place => {
                    console.log('Updating priority for place:', place);
                    return updatePlacePriority(
                        place.placeId || place.id,
                        place.l_priority,
                        userId,
                        place.version
                    );
                }));
    
                if (socket) {
                    console.log('Emitting course-recommended event:', updatedPlaces);
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
    }, [planId, userId, socket, version, fetchExistPlace]); 


    useEffect(() => {
        fetchExistPlace();
    }, [fetchExistPlace]);

    useEffect(() => {
        if (!socket) return;
    
        // 방에 참여
        joinRoom(planId);
    
        // 소켓 이벤트 리스너 설정
        socket.on('roomData', ({ room, users }) => {
            console.log('수신한 roomData:', { room, users });
            setUniqueUsers(users);
            const colorMapping = {};
            users.forEach(user => {
                colorMapping[user.userId] = user.color;
            });
            setUserColors(colorMapping);
        });
    
        socket.on('user-joined', (user) => {
            console.log('새로운 사용자加入:', user);
            setUniqueUsers(prevUsers => [...prevUsers, user]);
            setUserColors(prevColors => ({ ...prevColors, [user.userId]: user.color }));
        });
    
        socket.on('user-left', ({ userId }) => {
            console.log('사용자 나감:', userId);
            setUniqueUsers(prevUsers => prevUsers.filter(user => user.userId !== userId));
            setUserColors(prevColors => {
                const updatedColors = { ...prevColors };
                delete updatedColors[userId];
                return updatedColors;
            });
            setUserCursors(prev => {
                const updated = { ...prev };
                delete updated[userId];
                return updated;
            });
        });
    
        socket.on('user-mouse-move', ({ userId, name, cursor }) => {
            console.log('수신한 user-mouse-move:', { userId, name, cursor });
            setUserCursors(prev => ({
                ...prev,
                [userId]: { ...cursor, name }
            }));
        });
    
        socket.on('places-updated', (updatedPlaces) => {
            console.log('places-updated 수신:', updatedPlaces);
            if (Array.isArray(updatedPlaces)) {
                setSelectedPlaces(updatedPlaces);
            } else {
                console.error('Invalid updatedPlaces received:', updatedPlaces);
                setSelectedPlaces([]);
            }
        });
    

        socket.on('course-recommended', ({ updatedPlaces, socketId }) => {
            // 자신의 이벤트가 아닌 경우에만 상태 업데이트
            if (socketId !== socket.id) {
                console.log('course-recommended 수신:', updatedPlaces);
                console.log('Type of updatedPlaces:', typeof updatedPlaces);
                if (Array.isArray(updatedPlaces)) {
                    setSelectedPlaces(updatedPlaces);
                } else {
                    console.error('Invalid updatedPlaces received:', updatedPlaces);
                    setSelectedPlaces([]);
                }
            }
        });
    
        return () => {
            socket.off('roomData');
            socket.off('user-joined');
            socket.off('user-left');
            socket.off('user-mouse-move');
            socket.off('places-updated');
            socket.off('course-recommended');
        };
    }, [socket, planId, joinRoom, setUniqueUsers]);

    useEffect(() => {
        if (!socket) return;

        const throttledMouseMove = throttle((e) => {
            const x = e.clientX;
            const y = e.clientY;
            socket.emit('mouse-move', { room: planId, x, y });
        }, 80);

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
                                            {(selectedPlaces || [] ).map((place, index) => (
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
                                                                    <span>{place.placeAddr || place.place || "주소 정보 없음"}</span>
                                                                </div>
                                                                <DeleteButton 
                                                                    onClick={() => removePlace(place.placeId || place.id, place.isRecommended)}
                                                                    disabled={isDeleting}
                                                                >
                                                                    X
                                                                </DeleteButton>
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
                            {isDeleting && <div>삭제 중입니다...</div>}
                            {deleteError && <div style={{ color: 'red' }}>{deleteError}</div>}
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