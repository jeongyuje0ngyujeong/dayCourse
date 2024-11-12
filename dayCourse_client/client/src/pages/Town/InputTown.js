import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const { kakao } = window;

// 맵 컨테이너 스타일링
const MapDiv = styled.div`
    width: 100%;
    height: 100%;
`;

function KakaoMap({ searchKeyword, setPlaces, departurePoints, selectedRecommendedTown }) {
    const mapContainerRef = useRef(null); // 맵 컨테이너 참조
    const mapRef = useRef(null); // 맵 인스턴스 참조
    const markersRef = useRef([]); // 마커 인스턴스 배열 참조
   // const departureMarkersRef = useRef([]); // 출발지 마커 인스턴스 배열 참조
    const recommendedMarkerRef = useRef(null); // 추천 지역 마커 인스턴스 참조
    const infowindowRef = useRef(null); // 인포윈도우 참조

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
                        title: place.place_name || place.name
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

    // bounds를 전역으로 선언
    const bounds = new kakao.maps.LatLngBounds();

    // 출발지 마커 추가 함수
    const addMarkersToBounds = (points, mapInstance, markersArray) => {
        points.forEach(place => {
            if (place.y && place.x) {
                const position = new kakao.maps.LatLng(place.y, place.x);
                const marker = new kakao.maps.Marker({
                    position: position,
                    map: mapInstance,
                    title: place.place_name
                });
                markersArray.push(marker);
                bounds.extend(position); // bounds 확장
            } else {
                console.warn(`유효하지 않은 좌표: ${JSON.stringify(place)}`);
            }
        });
    };

    // 출발지 및 추천 지역 마커 업데이트
    useEffect(() => {
        if (!mapRef.current || !selectedRecommendedTown) return;

        // 기존 마커 제거
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // 기존 추천 마커 제거
        if (recommendedMarkerRef.current) {
            recommendedMarkerRef.current.setMap(null);
            recommendedMarkerRef.current = null;
        }

        // 기존 인포윈도우 제거
        if (infowindowRef.current) {
            infowindowRef.current.close();
            infowindowRef.current = null;
        }

        // 출발지 마커 추가
        addMarkersToBounds(departurePoints, mapRef.current, markersRef.current);

        // 추천 지역 마커 추가
        if (selectedRecommendedTown) {
            const { 상권명, centroid_x, centroid_y } = selectedRecommendedTown;
            const position = new kakao.maps.LatLng(centroid_y, centroid_x);

            // 추천 지역 마커 생성
            const marker = new kakao.maps.Marker({
                position: position,
                map: mapRef.current,
                title: 상권명,
                image: new kakao.maps.MarkerImage(
                    'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
                    new kakao.maps.Size(30, 40)
                )
            });

            // 인포윈도우 생성
            const infowindow = new kakao.maps.InfoWindow({
                content: `<div style="width: 100%; text-align: center; margin: 0 auto;">추천지역: ${상권명}</div>`,
            });

            // kakao.maps.event.addListener(marker, 'click', () => {
                infowindow.open(mapRef.current, marker);
            // });

            recommendedMarkerRef.current = marker;
            infowindowRef.current = infowindow;
            bounds.extend(position); // bounds 확장
        }

        // 경계 설정
        mapRef.current.setBounds(bounds);
        // eslint-disable-next-line
    }, [departurePoints, selectedRecommendedTown]); 


    return (
        <MapDiv ref={mapContainerRef} id="map"></MapDiv>
    );
}

export default KakaoMap;