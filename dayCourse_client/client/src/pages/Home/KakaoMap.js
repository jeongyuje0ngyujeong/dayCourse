import React, { useEffect, useRef,useState } from 'react';

const { kakao } = window;

function KakaoMap({ searchKeyword, setPlaces, selectedPlaces = [] }) {
    const mapRef = useRef(null);
    const searchMarkerRef = useRef([]);
    const selectedOverlayRef = useRef([]);
    const [autoFitBounds, setAutoFitBounds] = useState(true);

    // 오버레이 제거 함수
    const clearOverlays = (overlays) => {
        overlays.forEach(overlay => overlay.setMap(null));
    };

    // 선택된 장소들의 오버레이를 렌더링하는 함수
    const renderOverlays = () => {
        if (!mapRef.current || selectedPlaces.length === 0) return;

        clearOverlays(selectedOverlayRef.current);
        selectedOverlayRef.current = []; // 배열 초기화

        const map = mapRef.current;
        const bounds = new kakao.maps.LatLngBounds();

        selectedPlaces.forEach((place, index) => {
            const position = new kakao.maps.LatLng(place.y || place.Y, place.x || place.X);
            const content = `
                <div style="color: white; background: #90B54C; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    ${index + 1}
                </div>`;
            const overlay = new kakao.maps.CustomOverlay({
                position,
                content,
                yAnchor: 1,
                xAnchor: 0.5,
            });
            overlay.setMap(map);
            selectedOverlayRef.current.push(overlay);
            bounds.extend(position);
        });

        // 선택된 장소의 범위로 지도 조정
        if (autoFitBounds && selectedPlaces.length > 0) {
            map.setBounds(bounds);
        }
    };

    useEffect(() => {
        // 지도 생성
        const mapContainer = document.getElementById("map");
        const mapOptions = {
            center: new kakao.maps.LatLng(37.496486063, 127.028361548),
            level: 3,
        };
        
        const map = new kakao.maps.Map(mapContainer, mapOptions);

        const zoomControl = new kakao.maps.ZoomControl();
        const mapTypecontrol = new kakao.maps.MapTypeControl();

        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
        map.addControl(mapTypecontrol, kakao.maps.ControlPosition.TOPRIGHT);
        
        // 지도가 완전히 로드된 후 실행
        kakao.maps.event.addListener(map, 'tilesloaded', () => {
            mapRef.current = map;
            // 초기 오버레이 렌더링
            if (selectedPlaces.length > 0) {
                renderOverlays();
            }
        });

        kakao.maps.event.addListener(map, 'dragstart', () => setAutoFitBounds(false));
        kakao.maps.event.addListener(map, 'zoom_changed', () => setAutoFitBounds(false));

        const ps = new kakao.maps.services.Places();

        // 검색 마커 표시 함수 (selectedPlaces와 중복되는 검색 결과는 파란색 마커를 표시하지 않음)
        const displayPlaces = (places) => {
            const bounds = new kakao.maps.LatLngBounds();
            clearOverlays(searchMarkerRef.current);
            searchMarkerRef.current = []; // 배열 초기화

            places.forEach((place) => {
                const position = new kakao.maps.LatLng(place.y || place.Y, place.x || place.X);
        
                // selectedPlaces에 이미 포함된 장소인지 확인
                const isAlreadySelected = selectedPlaces.some(selected => {
                    // 장소명 또는 ID로 비교
                    return (
                        selected.place_name === place.place_name || 
                        selected.name === place.place_name ||
                        (selected.id && selected.id === place.id) ||
                        (selected.placeId && selected.placeId === place.id)
                    );
                });

                if (!isAlreadySelected) {
                    // 선택되지 않은 새로운 장소만 파란색 마커 표시
                    const marker = new kakao.maps.Marker({ position });
                    marker.setMap(map);
                    searchMarkerRef.current.push(marker);
                }

                bounds.extend(position);
            });

            if (autoFitBounds) {
                map.setBounds(bounds);
            }
            setPlaces(places);
        };

        // 검색 실행
        if (searchKeyword) {
            setAutoFitBounds(true);
            ps.keywordSearch(searchKeyword, (data, status) => {
                if (status === kakao.maps.services.Status.OK) {
                    displayPlaces(data);
                } else {
                    alert(status === kakao.maps.services.Status.ZERO_RESULT
                        ? '검색 결과가 존재하지 않음'
                        : '검색 중 오류 발생!'
                    
                    );
                }
            });
        }

        return () => {
            clearOverlays(searchMarkerRef.current);
            clearOverlays(selectedOverlayRef.current);
            searchMarkerRef.current = [];
            selectedOverlayRef.current = [];
        };
        // eslint-disable-next-line
    }, [searchKeyword, setPlaces, selectedPlaces]); // selectedPlaces 의존성 추가

    useEffect(() => {
        setAutoFitBounds(true);
    }, [searchKeyword]);

    useEffect(() => {
        // selectedPlaces가 업데이트될 때마다 오버레이 렌더링
        if (mapRef.current) {
            renderOverlays();
        }
        // eslint-disable-next-line
    }, [selectedPlaces]);

    return (
        <div className="map-container">
            <div id="map" style={{ 
                width: "80%", 
                height: "500px",
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
            }}></div>
        </div>
    );
}

export default KakaoMap;