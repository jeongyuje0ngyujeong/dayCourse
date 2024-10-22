import React, { useState } from 'react';
import styled from 'styled-components';
import KakaoMap from './KakaoMap';
import LandingPage from './LandingPage';

const SidebarContainer = styled.div`
    width: 250px;
    padding: 20px;
    background-color: #f8f9fa;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    position: fixed; /* 고정된 사이드바 */
    right: 0; /* 오른쪽에 위치 */
    top: 0; /* 상단에 위치 */
    height: 100%; /* 전체 높이 */
    overflow-y:auto;
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

const RightSidebar = ({ onSubmitKeyword, places=[], addPlace}) => {
    const [value, setValue] = useState(""); // 입력 값 상태

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

    return (
        <SidebarContainer>
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
            <div id="search-result">
                <p className="result-text">
                    <span className="result-keyword">{places.length > 0 ? places[0].place_name : '검색 결과가 없습니다'}</span>
                </p>
                <ul id="places-list">
                    {places.map((place, index) => (
                        <li key={index} onClick={() => addPlace(place)}style={{cursor:'pointer'}}>
                            <h5>{place.place_name}</h5>
                            {place.road_address_name && <span>{place.road_address_name}</span>}
                            <span>{place.address_name}</span>
                            <span>{place.phone}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </SidebarContainer>
    );
};

export default RightSidebar;