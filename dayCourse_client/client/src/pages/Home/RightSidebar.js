// RightSidebar.js
import React, { useState, useEffect , useContext} from 'react';
import styled from 'styled-components';
import { recommendPlace } from './PlaceApi'; 
import TabButton from './TabButton';
import CategoryButton from './CategoryButton';
import KeywordButton from './KeywordButton';
import Chat from '../Chat/Chat';
import SocketContext from '../../SocketContext';

// Styled Components
const SidebarContainer = styled.div`
    width: 20%;
    padding: 20px;
    background-color: #f8f9fa;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    position: fixed; /* 고정된 사이드바 */
    right: 0; /* 오른쪽에 위치 */
    top: 0; /* 상단에 위치 */
    height: 100%; /* 전체 높이 */
    overflow-y: auto;
`;

const SidebarInput = styled.input`
    width: 100%; /* 전체 폭을 사용 */
    padding: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
`;

const SidebarButton = styled.button`
    width: 100%;
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
    const { messages, users, sendMessage } = useContext(SocketContext);

    const [value, setValue] = useState(""); // 입력 값 상태
    const [activeTab, setActiveTab] = useState('search');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedKeyword, setSelectedKeyword] = useState(''); // 선택된 키워드 상태 추가

    const [recommendPlaces, setRecommendPlaces] = useState([]); 
    const [error, setError] = useState(null); // 에러 상태 추가

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

    const renderPlaceList = (placeList) => {
        console.log('Rendering place list:', placeList); // 디버깅을 위한 로그 추가

        if (!Array.isArray(placeList)) {
            console.error('placeList is not an array:', placeList);
            return <p>데이터 형식 오류</p>; // 사용자에게 오류 메시지 표시
        }
        return (
            <ul id="places-list" style={{ listStyle: "none", padding:0 }}>
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
                    <div>
                        <form onSubmit={submitKeyword}>
                            <SidebarInput
                                type="text"
                                placeholder='검색어를 입력해주세요'
                                value={value}
                                onChange={keywordChange}
                                required
                            />
                            <SidebarButton type="submit">검색</SidebarButton>
                        </form>
                      
                        <div>
                            <CategoryButton 
                                selectedCategory={selectedCategory} 
                                setSelectedCategory={setSelectedCategory} 
                            />
                            {selectedCategory && (
                                <KeywordButton 
                                    selectedCategory={selectedCategory} 
                                    selectedKeyword={selectedKeyword} // 선택된 키워드 전달
                                    setSelectedKeyword={setSelectedKeyword} // 키워드 상태 업데이트 함수 전달
                                />
                            )}
                        </div>

                        {selectedCategory && selectedKeyword ? (
                            <div id="recommend-result">
                                <h5>추천장소</h5>
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
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <TabButton active={activeTab === 'search'} onClick={() => setActiveTab('search')}>검색</TabButton>
                <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')}>채팅</TabButton>
            </div>
            {renderTab()}
        </SidebarContainer>
    );
};

export default RightSidebar;