import React, { useState } from 'react';
import styled from 'styled-components';
import { fetchPlace, addPlace } from './PlaceApi'; // addPlace를 포함하여 API 가져오기
import TabButton from './TabButton';
import CategoryButton from './CategoryButton';
import KeywordButton from './KeywordButton';

import Chat from '../Chat/Chat';


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
    margin-bottom: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
`;

const SidebarButton = styled.button`
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    } 
`;


const RightSidebar = ({ onSubmitKeyword, places = [], userId, planId, setSelectedPlaces }) => {
    console.log("RightSidebar Props - userId:", userId, "planId:", planId); // 로그 확인
    const [value, setValue] = useState(""); // 입력 값 상태
    const [activeTab, setActiveTab] = useState('search');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedKeyword, setSelectedKeyword] = useState(''); // 선택된 키워드 상태 추가

    // 입력값 변화 감지
    const keywordChange = (e) => {
        setValue(e.target.value);
    };

    // 제출한 검색어 상태 업데이트
    const submitKeyword = (e) => {
        e.preventDefault();
        onSubmitKeyword(value); // 제출한 검색어를 부모 컴포넌트로 전달
        setValue(""); // 제출 후 입력 필드 초기화
    };

    const handlePlaceClick = async (place) => {
        console.log("userId:", userId, "planId:", planId, "placeId:", place.placeId); // placeId 로그 추가
        try {
            await addPlace(userId, planId, place); // userId와 planId 전달
            setSelectedPlaces((prevSelected) => [...prevSelected, place]);
        } catch (error) {
            console.error("장소 추가 실패!!!!!", error.response?.data || error.message); // 추가된 로그
        }
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

                        <div id="search-result">
                            {places.length === 0 ? (
                                <p>검색 결과가 없습니다</p>
                            ) : (
                                <ul id="places-list">
                                    {places.map((place, index) => (
                                        <li key={index} onClick={() => handlePlaceClick(place)} style={{ cursor: 'pointer' }}>
                                            <h5>{place.place_name}</h5>
                                            {place.road_address_name && <span>{place.road_address_name}</span>}
                                            <span>{place.address_name}</span>
                                            <span>{place.phone}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                );

            case 'chat' :
                return <Chat userId={userId} planId={planId}/>; //여기에 관련 내용 추가

            default:
                return null;
        }
    };

    return (
        <SidebarContainer>
            <div>
                <TabButton active={activeTab === 'search'} onClick={() => setActiveTab('search')}>검색</TabButton>
                <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')}>채팅</TabButton>
            </div>
            {renderTab()}
        </SidebarContainer>
    );
};

export default RightSidebar;