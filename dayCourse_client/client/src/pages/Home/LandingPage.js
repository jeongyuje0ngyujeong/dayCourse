import React, { useEffect, useState, useCallback, useRef, useContext} from 'react';
import KakaoMap from './KakaoMap';
import RightSidebar from './RightSidebar';
import styled from "styled-components";
import { fetchPlace, addPlace, deletePlace, updatePlacePriority, addRecommendedPlace } from './PlaceApi'; 
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import throttle from 'lodash/throttle';
import Loader from './Loader'; // 로딩 스피너 컴포넌트
import SocketContext from '../../SocketContext';
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

const LandingPage = ({ userId, planId, place, context }) => {
    const { socket, joinRoom } = useContext(SocketContext); 
 const { socket, messages, users, joinRoom, sendMessage } = useContext(SocketContext); 
    const [keyword, setKeyword] = useState("");
    const [places, setPlaces] = useState([]);
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [isPlacesLoaded, setIsPlacesLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [localUsers, setLocalUsers] = useState([]);


    const distances = [];

    // const [users, setUsers] = useState([]);
    const [userColors, setUserColors] = useState({});
    const [userCursors, setUserCursors] = useState({});
    // const [uniqueUsers, setUniqueUsers] = useState([]);

   // const socketRef = useRef(null);

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
        if (!socket) return;

        // 방에 참여
        joinRoom(planId);

        // 소켓 이벤트 리스너 설정
    socket.on('roomData', ({ room, users }) => {
        console.log('수신한 roomData:', { room, users });
        setLocalUsers(users); // 여기 업데이트
        const colorMapping = {};
        users.forEach(user => {
            colorMapping[user.userId] = user.color;
        });
        setUserColors(colorMapping);
        setLocalUsers(users);
    });

    socket.on('user-joined', ({ userId, name, color }) => {
        console.log('새로운 사용자加入:', { userId, name, color });
        setLocalUsers(prevUsers => [...prevUsers, { userId, name, color }]); // 여기 업데이트
        setUserColors(prevColors => ({...prevColors, [userId]: color }));
    });

    socket.on('user-left', ({ userId }) => {
        setUserCursors(prev => {
            const updated = {...prev };
            delete updated[userId];
            return updated;
        });
        setLocalUsers(prevUsers => prevUsers.filter(user => user.userId!== userId)); // 여기 업데이트
    });

        return () => {
            socket.off('places-updated');
            socket.off('user-mouse-move');
            socket.off('roomData');
            socket.off('user-joined');
            socket.off('user-left');
        };
    }, [socket, planId, joinRoom]);



    useEffect(() => {
        if (!socket) return;
        if (!socket) return;

        const throttledMouseMove = throttle((e) => {
            const x = e.clientX;
            const y = e.clientY;
            socket.emit('mouse-move', { room: planId, x, y });
            socket.emit('mouse-move', { room: planId, x, y });
        }, 100);

        window.addEventListener('mousemove', throttledMouseMove);

        return () => {
            window.removeEventListener('mousemove', throttledMouseMove);
            throttledMouseMove.cancel();
        }
    }, [socket, planId]);
    }, [socket, planId]);

    useEffect(() => {
        if (isPlacesLoaded) {
            console.log("장소 데이터가 성공적으로 로드되었습니다.");
            // 추가적인 작업 수행 가능
        }
    }, [isPlacesLoaded]);

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
                                                </Draggable>

                                                {selectedPlaces.length > 1 && index < selectedPlaces.length - 1 && distances[index] !== undefined && (
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
                    <div style={{ position: 'absolute', top: "2%", left: "90%", background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '8px' }}>
                        <h4>접속 사용자</h4>
                        <ul>
                        {localUsers.map(user => (
                            <li key={user.userId} style={{ color: user.color }}>{user.name}</li>
                        ))}
                    </ul>
                    </div>
                </>
            )}
        </div>
    );
};

export default LandingPage;