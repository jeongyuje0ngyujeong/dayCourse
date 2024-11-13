// RightSidebar.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import styled from 'styled-components';
import { recommendPlace } from './PlaceApi'; 
import TabButton from './TabButton';
import CategoryButton from './CategoryButton';
import KeywordButton from './KeywordButton';
import Chat from '../Chat/Chat';
import {PageTitle} from '../../commonStyles';
import { Button } from '../../Button';
import SocketContext from '../../SocketContext';

// Styled Components (변경 없음)


const UnreadBadge = styled.div`
    background-color: #e8290c;
    color: white;
    border-radius: 50%;
    width: 2em;
    height: 2em;
    font-size: 0.8em;
    display: flex;
    align-items: center;
    justify-content: center;
    ${'' /* position: absolute; */}
    ${'' /* top: 0.8em; 
    right: 1.5em;  */}
    font-weight: bold;
    margin-left:2%;;
    animation: ${props => props.animate ? 'pop 0.3s ease-in-out' : 'none'};
    
    @keyframes pop {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
    }
`;

const SidebarContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 5rem;
    width: 20%;
    padding: 10px;
    padding-bottom: 9vh;
    background-color: #f8f9fa;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    position: fixed; 
    right: 0; 
    top: 0; 
    height: calc(100vh - 10px); 
    overflow-y: scroll;
`;

const StyledForm = styled.form`
    display: flex;
    align-items: center;
    border: 1px solid #ced4da;
    height: 6vh;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    
    &:focus-within {
        border: 2px solid #aaa;
    }
`;

const SidebarInput = styled.input`
    flex: 1;
    height:100%;
    padding: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
    outline: none;
    ${'' /* border: 1px solid #ced4da; */}
    border-radius: 4px;
`;

const SidebarButton = styled.button`
    ${'' /* width: 5rem; */}
    height:100%;
    padding: 10px;
    background-color: #90B54C;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: #78A743; /* hover 색상 변경 */
    } 
`;

const ListItem = styled.li`
    cursor: pointer;
    margin-bottom: 10px;
    padding: 10px;
    border-bottom: 1px solid #ced4da;
    font-size: 2vh;
    color: #000; /* 텍스트 색상 설정 */
    &:hover {
        background-color: #e6e6e6;
    }
`;

const PlaceTitle = styled.h5`
    color: #000;
    margin: 0 0 5px 0;
`;

const PlaceAddress = styled.span`
    color: #000;
`;

const RightSidebar = ({ userId, planId, planInfo, places, setPlaces, onSubmitKeyword, onPlaceClick }) => {
    // console.log("RightSidebar Props - userId:", userId, "planId:", planId); 
    // console.log('planInfo: ', planInfo);
    // console.log('places prop:', places); 

    const [value, setValue] = useState(""); // 입력 값 상태
    const [activeTab, setActiveTab] = useState('search');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedKeyword, setSelectedKeyword] = useState(''); // 선택된 키워드 상태 추가

    const { messages, enableSound } = useContext(SocketContext); // SocketContext에서 messages 가져오기
    const [unreadCount, setUnreadCount] = useState(0); // 읽지 않은 메시지 수 추적
    const lastMessageCountRef = useRef(0); // 마지막 메시지 수 추적을 위한 useRef
    const [animateBadge, setAnimateBadge] = useState(false);
  //  const prevUnreadCountRef = useRef(unreadCount);
    
    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => {
        // 클릭 시 상태 토글
        setIsVisible(!isVisible);
        setSelectedKeyword('');
    };

    const [recommendPlaces, setRecommendPlaces] = useState([]); 
    const [error, setError] = useState(null); // 에러 상태 추가


    const chatSound = useRef(new Audio('/chatSound_copy.wav')).current;

    // 사용자 상호작용 시 사운드 활성화
    useEffect(() => {
        const handleUserInteraction = () => {
            enableSound(); // 첫 상호작용 시 사운드 활성화
            document.removeEventListener('click', handleUserInteraction);
        };
        document.addEventListener('click', handleUserInteraction);

        return () => {
            document.removeEventListener('click', handleUserInteraction);
        };
    }, [enableSound]);


    useEffect(() => {
        const fetchRecommend = async () => {
            if (selectedCategory && selectedKeyword) {
                try {
                    const data = await recommendPlace(selectedCategory, selectedKeyword);
                    console.log('recommendPlace data:', data); // 데이터 확인

                    // 추가 로그: Array.isArray(data)
                    console.log('Is data an array?', Array.isArray(data));

                    // 데이터 구조에 따라 설정
                    if (Array.isArray(data)) {
                        setRecommendPlaces(data);
                    } else {
                        console.error('Unexpected data format:', data);
                        setRecommendPlaces([]);
                        setError('추천 장소 데이터 형식이 올바르지 않습니다.');
                    }
                } catch(error) {
                    console.error('추천 장소 가져오기 실패', error);
                    setRecommendPlaces([]); // 에러 발생 시 빈 배열 설정
                    setError('추천 장소를 가져오는 데 실패했습니다.');
                }
            }
        };
        fetchRecommend();
    }, [selectedCategory, selectedKeyword]);

    useEffect(() => {
        if (activeTab !== 'chat') {
            const newMessages = messages.length - lastMessageCountRef.current;
            if (newMessages > 0) {
                setUnreadCount(prev => prev + newMessages);
                // 애니메이션 트리거
                setAnimateBadge(true);
                // 알림음 재생
                chatSound.currentTime = 0; // 오디오 시작점 초기화
                chatSound.play().catch((error) => {
                    console.error("Sound playback failed:", error);
                });
            }
        }
        lastMessageCountRef.current = messages.length;
    }, [messages, activeTab, chatSound]);

    // 애니메이션 상태 초기화
    useEffect(() => {
        if (animateBadge) {
            const timer = setTimeout(() => {
                setAnimateBadge(false);
            }, 300); // 애니메이션 지속 시간과 일치
            return () => clearTimeout(timer);
        }
    }, [animateBadge]);

    const setActiveTabWithUnread = (tab) => {
        setActiveTab(tab);
        if (tab === 'chat') {
            setUnreadCount(0); // 채팅 탭으로 전환 시 읽지 않은 메시지 수 초기화
        }
    };


    // 입력값 변화 감지
    const keywordChange = (e) => {
        setValue(e.target.value);
    };

    // 제출한 검색어 상태 업데이트
    const submitKeyword = (e) => {
        e.preventDefault();
        onSubmitKeyword(value); // 제출한 검색어를 부모 컴포넌트로 전달
        setValue(""); // 제출 후 입력 필드 초기화
        setSelectedCategory('');
        setSelectedKeyword('');
    };

    const handlePlaceClick = (place) => {
        onPlaceClick(place); // 부모 컴포넌트로 장소 정보를 전달
    };

    const renderPlaceList = (placeList, isRecommended = false) => {
        // console.log('Rendering place list:', placeList);

        if (!Array.isArray(placeList)) {
            console.error('placeList is not an array:', placeList);
            return <p>데이터 형식 오류</p>; // 사용자에게 오류 메시지 표시
        }
        return (
            <ul id="places-list" style={{ listStyle: "none", padding:'0'}}>
                {placeList.map((place, index) => (
                    <ListItem 
                        key={index} 
                        onClick={() => handlePlaceClick(place)} 
                    >
                        <PlaceTitle>{place.place_name}</PlaceTitle>
                        <PlaceAddress>{place.address_name}</PlaceAddress><br />
                        {/* 필요에 따라 평점 표시 */}
                        {/* {place.placeRate && <span>평점: {place.placeRate}</span>} */}
                    </ListItem>
                ))}
            </ul>
        );
    };

    const renderTab = () => {
        switch (activeTab) {
            case 'search':
                return (
                    <div style={{display:'flex', flexDirection:'column',width:'100%'}}>
                        <StyledForm onSubmit={submitKeyword}>
                            <SidebarInput
                                type="text"
                                placeholder='검색어를 입력해주세요'
                                value={value}
                                onChange={keywordChange}
                                required
                            />
                            <SidebarButton type="submit">검색</SidebarButton>
                        </StyledForm>

                        <Button width='100%' style={{fontSize:'2vh'}} height='4vh' onClick={toggleVisibility}>{isVisible ? '닫기' : '장소추천'}</Button>

                        {isVisible && (
                        <>
                            <PageTitle style={{ marginBottom:'1vh', fontSize:'2vh'}}>카테고리</PageTitle>
                            <CategoryButton 
                                selectedCategory={selectedCategory} 
                                setSelectedCategory={setSelectedCategory} 
                            />
    
                            {selectedCategory && (
                                <>
                                <PageTitle  style={{marginBottom:'1vh', fontSize:'2vh'}}>키워드</PageTitle>
                                <KeywordButton 
                                    selectedCategory={selectedCategory} 
                                    selectedKeyword={selectedKeyword} // 선택된 키워드 전달
                                    setSelectedKeyword={setSelectedKeyword} // 키워드 상태 업데이트 함수 전달
                                />       
                                </>
                            )}
                        </>
                        )}

                        {selectedCategory && selectedKeyword ? (
                            <div id="recommend-result">
                                <PageTitle style={{marginBottom:'1vh', fontSize:'2vh'}}>추천장소</PageTitle>
                                {error && <p style={{ color: 'red' }}>{error}</p>}
                                {recommendPlaces.length === 0 && !error ? (
                                    <p>추천 결과 없음</p>
                                ) : (
                                    renderPlaceList(recommendPlaces)
                                )}
                            </div>
                        ) : (
                            <div id="search-result">
                                {places.length === 0 ? (
                                    <p>검색 결과가 없습니다</p>
                                ) : (
                                    renderPlaceList(places)
                                )}
                            </div>
                        )}
                    </div>
                );

            case 'chat':
                return <Chat userId={userId} planInfo={planInfo}/>; // 채팅 컴포넌트 추가

            default:
                return null;
        }
    };

    return (
        <SidebarContainer>
            <div style={{ display: 'flex', marginBottom: '3vh',  borderRadius:'30px', background:'white',boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'}}>
                <TabButton active={activeTab === 'search'} onClick={() => setActiveTab('search')}>검색</TabButton>
                <TabButton 
                    active={activeTab === 'chat'} 
                    onClick={() => setActiveTabWithUnread('chat')}
                >
                    <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:'1vh'}}>
                        {unreadCount > 0 ? (
                            <>
                            <div style={{height:'100%', marginLeft:'4vh'}}>채팅</div>
                            <UnreadBadge animate={animateBadge}>+{unreadCount > 99 ? '99' : unreadCount}</UnreadBadge>
                            </>
                        ):(<div style={{height:'100%'}}>채팅</div>)
                        }
                    </div>
                </TabButton>
            </div>
            {renderTab()}
        </SidebarContainer>
    );
};

export default RightSidebar;