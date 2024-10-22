import React, { useEffect} from 'react';
// import { CustomOverlayMap, Map, MapMarker, MarkerClusterer } from 'react-kakao-maps-sdk';

const { kakao } = window;

function KakaoMap({ searchKeyword, setPlaces }) {
    useEffect(() => {
        const mapContainer = document.getElementById("map");
        const mapOptions = {
            center: new kakao.maps.LatLng(37.566826, 126.9786567), // 서울의 중심 좌표
            level: 3 // 초기 줌 레벨
        };

        const map = new kakao.maps.Map(mapContainer, mapOptions);
        const ps = new kakao.maps.services.Places();

        if (searchKeyword) {
            ps.keywordSearch(searchKeyword, (data, status) => {
                if (status === kakao.maps.services.Status.OK) {
                    displayPlaces(data);
                } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
                    alert('검색 결과가 존재하지 않음');
                } else {
                    alert('검색 중 오류 발생!');
                }
            });
        }

        const displayPlaces = (places) => {
            const bounds = new kakao.maps.LatLngBounds();
            const markers = [];

            places.forEach((place) => {
                const position = new kakao.maps.LatLng(place.y, place.x);
                const marker = new kakao.maps.Marker({
                    position: position,
                });
                marker.setMap(map);
                bounds.extend(position);
                markers.push(place);
            });
            map.setBounds(bounds);
            setPlaces(markers); // 검색 결과를 상태로 설정
        };
    }, [searchKeyword, setPlaces]);

    return (
        <div className="map-container">
            <div id="map" style={{ width: "500px", height: "500px" }}></div>
        </div>
    );
}

export default KakaoMap;