import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const { kakao } = window;

// 맵 컨테이너 스타일링
const MapDiv = styled.div`
    width: 100%;
    height: 100%;
`;

function KakaoMap({ searchKeyword, setPlaces, departurePoints }) {
    const mapContainerRef = useRef(null); // 맵 컨테이너 참조
    const mapRef = useRef(null); // 맵 인스턴스 참조
    const markersRef = useRef([]); // 마커 인스턴스 배열 참조

    // 맵 초기화 (컴포넌트 마운트 시 한 번만 실행)
    useEffect(() => {
        // 카카오 맵 SDK가 로드되었는지 확인
        if (!window.kakao || !window.kakao.maps) {
            console.error('카카오 맵 SDK가 로드되지 않았습니다.');
            return;
        }

        // 맵이 초기화되지 않았다면 초기화
        if (!mapRef.current && mapContainerRef.current) {
            const mapOptions = {
                center: new kakao.maps.LatLng(37.566826, 126.9786567), // 서울의 중심 좌표
                level: 3 // 초기 줌 레벨
            };
            mapRef.current = new kakao.maps.Map(mapContainerRef.current, mapOptions);
        }

        // 맵 인스턴스가 존재하는지 확인
        if (!mapRef.current) {
            console.error('맵 인스턴스가 초기화되지 않았습니다.');
            return;
        }
    }, []); // 빈 배열로 초기화 한번만 실행

    // 출발지 마커 업데이트
    useEffect(() => {
        if (!mapRef.current) return;

        // 기존 마커 제거
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // 새로운 마커 추가
        const bounds = new kakao.maps.LatLngBounds();

        departurePoints.forEach(place => {
            if (place.y && place.x) { // y와 x 값이 존재하는지 확인
                const position = new kakao.maps.LatLng(place.y, place.x);
                const marker = new kakao.maps.Marker({
                    position: position,
                    map: mapRef.current,
                    title: place.place_name
                });
                markersRef.current.push(marker);
                bounds.extend(position);
            } else {
                console.warn(`유효하지 않은 좌표: ${JSON.stringify(place)}`);
            }
        });

        // 맵의 경계를 설정
        if (departurePoints.length > 0) {
            mapRef.current.setBounds(bounds);
        } else {
            // 마커가 없으면 기본 중심으로 재설정
            mapRef.current.setCenter(new kakao.maps.LatLng(37.566826, 126.9786567));
            mapRef.current.setLevel(3);
        }
    }, [departurePoints]);

    // 검색 키워드에 따른 장소 검색 및 마커 업데이트
    useEffect(() => {
        if (!mapRef.current) return;

        const ps = new kakao.maps.services.Places();

        const displayPlaces = (places) => {
            // 기존 마커 제거
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];

            const bounds = new kakao.maps.LatLngBounds();
            const newPlaces = [];

            places.forEach(place => {
                if (place.y && place.x) { // y와 x 값이 존재하는지 확인
                    const position = new kakao.maps.LatLng(place.y, place.x);
                    const marker = new kakao.maps.Marker({
                        position: position,
                        map: mapRef.current,
                        title: place.place_name
                    });
                    markersRef.current.push(marker);
                    bounds.extend(position);
                    newPlaces.push(place);
                } else {
                    console.warn(`유효하지 않은 좌표: ${JSON.stringify(place)}`);
                }
            });

            if (newPlaces.length > 0) {
                mapRef.current.setBounds(bounds);
            } else {
                // 검색 결과 없을 때 기본 중심으로 재설정
                mapRef.current.setCenter(new kakao.maps.LatLng(37.566826, 126.9786567));
                mapRef.current.setLevel(3);
            }

            setPlaces(newPlaces);
        };

        if (searchKeyword) {
            ps.keywordSearch(searchKeyword, (data, status) => {
                if (status === kakao.maps.services.Status.OK) {
                    displayPlaces(data);
                } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
                    alert('검색 결과가 없습니다.');
                } else {
                    alert('검색 중 오류가 발생했습니다.');
                }
            });
        }
    }, [searchKeyword, setPlaces]);

    return (
        <MapDiv ref={mapContainerRef} id="map"></MapDiv>
    );
}

export default KakaoMap;