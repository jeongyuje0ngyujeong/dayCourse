import React, { useState,} from 'react';
import {Button} from '../../Button';
import { Form,} from "react-router-dom";
import styled from "styled-components";
import {PageTitle} from '../../commonStyles';

const ResultContainer = styled.div`
    position: absolute; 
    top: 105%; 
    left: 0; 
    max-height: 30rem;  
    width: 100%; 
    background: white; 
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);

    border-top: none;
    z-index: 1000; 
    overflow-y: auto; 
`

const StyledForm = styled(Form)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    position: relative; 
`;

export default function SearchKeyword({keyword, setKeyword, places, setPlaces, departurePoints, setDeparturePoints}){
    const [value, setValue] = useState(""); // 입력 값 상태
    const [showResult, setShowResult] = useState(false); // 결과 표시 여부
    // console.log(places);

    const keywordChange = (e) => {
        setValue(e.target.value);
    };

    // 제출한 검색어 상태 업데이트
    const submitKeywordForm = (e) => {
        e.preventDefault();
        setKeyword(value); // 제출한 검색어를 상태로 저장
        setValue('');
        setShowResult(true);
    };

    const addDeparturePoint = (place) => {
        // 최대 10개의 출발지 입력창만 추가할 수 있게 제한
        
        if (departurePoints.length < 10) {
            setDeparturePoints([...departurePoints, place]);
        }
        else {
            alert('출발지는 최대 10개 설정할 수 있어요')
        }
    };

    // const handleDepartureChange = (index, value) => {
    //     const updatedPoints = [...departurePoints];
    //     updatedPoints[index] = value;
    //     setDeparturePoints(updatedPoints);
    // }

    return(
        <>
        <PageTitle style={{marginBottom: '1.5vh', fontSize:'3vh'}}>출발지</PageTitle>
        <StyledForm onSubmit={submitKeywordForm}>
            <input
                type="text"
                placeholder={`출발지를 추가해보세요`}
                value={value}
                // onChange={(e) => handleDepartureChange(e.target.value)}
                onChange={keywordChange}
                onFocus={() => setShowResult(true)} // 포커스를 얻으면 결과 표시
                onBlur={() => {setShowResult(false); setPlaces([]);}}
                style={{ border: '1px solid #ccc', padding: '5px', width:'100%'}}
            />
            <Button type='submit'  width='3rem' height='100%'>검색</Button> 
            {/* {departurePoints.length <= 10 && ( departurePoints.length !== 10 ?
                :<Button disabled width='3rem' height='100%'>검색</Button>
            )} */}
            <ResultContainer>
                {showResult && (
                <>
                {places.length === 0 && ( // 검색 결과가 없을 때
                    <p className="result-text">검색 결과가 없습니다.</p>
                )}
                <ul id="places-list">
                    {places.map((place, index) => (
                        <li 
                            key={index} 
                            onMouseDown={() => {
                                addDeparturePoint(place);
                                setPlaces([]);
                                // setShowResult(false);
                            }} 
                            style={{ cursor: 'pointer' }}
                        >
                            <h5>{place.place_name}</h5>
                            {/* {place.road_address_name && <span>{place.road_address_name}</span>} */}
                            <span>{place.address_name}</span>
                        </li>
                    ))}
                </ul>
                </>
                )}
            </ResultContainer>
        </StyledForm>
        </>
    )
}