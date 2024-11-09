import React, { useEffect, useRef,useState } from 'react';
import './KakaoMap.css';
const { kakao } = window;

function KakaoMap({ searchKeyword, setPlaces, selectedPlaces = [] }) {
    const mapRef = useRef(null);
    const searchMarkerRef = useRef([]);
    const selectedOverlayRef = useRef([]);
    const [autoFitBounds, setAutoFitBounds] = useState(true);
    const routeLinesRef = useRef([]);

    // 오버레이 제거 함수
    const clearOverlays = (overlays) => {
        overlays.forEach(overlay => overlay.setMap(null));
    };

    const clearLines = (lines) => {
        console.log('Clearing lines:', lines); // 디버깅용 로그
        lines.forEach(line => {
            if (line && typeof line.setMap === 'function') {
                line.setMap(null);
            } else {
                console.warn('Invalid line object:', line);
            }
        });
    }

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
                <div style="color: white; background: #8cd108; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
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

        if (autoFitBounds && selectedPlaces.length > 0) {
           if (selectedPlaces.length === 1) {
            map.setCenter(bounds.getSouthWest());
           } else {
            map.setBounds(bounds);
           }
        }
        renderRouteLines();
    };

    const renderRouteLines = () => {
        if (!mapRef.current || selectedPlaces.length < 2) {
            clearLines(routeLinesRef.current);
            routeLinesRef.current = [];
            return;
        }
        clearLines(routeLinesRef.current);
        routeLinesRef.current = [];

        const map = mapRef.current;
        const linePath = selectedPlaces.map(place => new kakao.maps.LatLng(place.y || place.Y, place.x || place.X));

        const zoomLevel = map.getLevel();
        let strokeWeight = 2;
        let dashLength;
    
        if (zoomLevel <= 3) {
            strokeWeight = 4;
            dashLength = [20, 20];
        } else if (zoomLevel <= 7) {
            strokeWeight = 6;
            dashLength = [10, 10];
        } else {
            strokeWeight = 8;
            dashLength = [5, 5];
        }

        const polyline = new kakao.maps.Polyline({
            path: linePath,
            strokeWeight: strokeWeight,
            strokeColor: '#5c5b5b',
            strokeOpacity: 0.7,
            strokeStyle: 'dashed',
        })
        polyline.setMap(map);
        routeLinesRef.current.push(polyline);
    }
    
    const handleZoomChange = () => {
        renderRouteLines();
    }

    useEffect(() => {
        // 지도 생성
        const mapContainer = document.getElementById("map");
        const mapOptions = {
            center: new kakao.maps.LatLng(37.496486063, 127.028361548),
            level: 5,
            draggable: true,  // 여기서 직접 설정
            zoomable: true,   // 여기서 직접 설정
        };
        
        const map = new kakao.maps.Map(mapContainer, mapOptions);
        mapRef.current = map;  // 지도 참조 즉시 설정

        map.setDraggable(true);
        map.setZoomable(true);
        

        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        // tilesloaded 이벤트에서는 초기 렌더링만 처리
        kakao.maps.event.addListener(map, 'tilesloaded', () => {
            // 초기 오버레이 및 라인 렌더링
            renderOverlays();
            renderRouteLines();
        });
    
        kakao.maps.event.addListener(map, 'dragstart', () => setAutoFitBounds(false));
        kakao.maps.event.addListener(map, 'zoom_changed', () => {
            
            setAutoFitBounds(false);
            handleZoomChange();
        });

        const ps = new kakao.maps.services.Places();

        // 검색 마커 표시 함수
        const displayPlaces = (places) => {
            const bounds = new kakao.maps.LatLngBounds();
            clearOverlays(searchMarkerRef.current);
            searchMarkerRef.current = [];

            places.forEach((place) => {
                const position = new kakao.maps.LatLng(place.y || place.Y, place.x || place.X);
        
                const isAlreadySelected = selectedPlaces.some(selected => {
                    return (
                        selected.place_name === place.place_name || 
                        selected.name === place.place_name ||
                        (selected.id && selected.id === place.id) ||
                        (selected.placeId && selected.placeId === place.id)
                    );
                });

                if (!isAlreadySelected) {
                    const marker = new kakao.maps.Marker({ position });
                    marker.setMap(map);
                    searchMarkerRef.current.push(marker);
                }

                bounds.extend(position);
            });

            if (autoFitBounds) {
                if (places.length === 1) {
                    const singlePlace = places[0];
                    const singlePosition = new kakao.maps.LatLng(singlePlace.y || singlePlace.Y, singlePlace.x || singlePlace.X);
                    map.setCenter(singlePosition);
                } else {
                    map.setBounds(bounds);
                }
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
            clearLines(routeLinesRef.current);
            searchMarkerRef.current = [];
            selectedOverlayRef.current = [];
            routeLinesRef.current = [];
        };
        // eslint-disable-next-line
    }, [searchKeyword, setPlaces, selectedPlaces]);

    useEffect(() => {
        setAutoFitBounds(true);
    }, [searchKeyword]);

    useEffect(() => {
        if (mapRef.current) {
            renderOverlays();
            renderRouteLines();
        }
        // eslint-disable-next-line
    }, [selectedPlaces]);

    return (
        <div className="map-container">
            <div id="map"></div>
        </div>
    );
}

export default KakaoMap;