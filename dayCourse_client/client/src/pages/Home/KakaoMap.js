import React, { useEffect, useRef, useState, useCallback } from 'react';
import './KakaoMap.css';
const { kakao } = window;

const KakaoMap = React.memo(function KakaoMap({ searchKeyword, setPlaces, selectedPlaces = [] }) {
    console.log('KakaoMap 렌더링');

    const mapContainerRef = useRef(null); // map container ref
    const mapRef = useRef(null);
    const searchMarkerRef = useRef([]);
    const selectedOverlayRef = useRef([]);
    const routeLinesRef = useRef([]);
    const autoFitBoundsRef = useRef(true); // useRef로 autoFitBounds 관리

    // 오버레이 제거 함수
    const clearOverlays = useCallback((overlays) => {
        overlays.forEach(overlay => overlay.setMap(null));
    }, []);

    const clearLines = (lines) => {
        lines.forEach(line => {
            if (line && typeof line.setMap === 'function') {
                line.setMap(null);
            } else {
                console.warn('Invalid line object:', line);
            }
        });
    };

    // 지도 초기화 (한 번만 실행)
    useEffect(() => {
        const mapContainer = document.getElementById("map");
        const mapOptions = {
            center: new kakao.maps.LatLng(37.496486063, 127.028361548),
            level: 5,
            draggable: true,
            zoomable: true,
        };

        const map = new kakao.maps.Map(mapContainer, mapOptions);
        mapRef.current = map;

        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        kakao.maps.event.addListener(map, 'dragstart', () => setAutoFitBounds(false));
        kakao.maps.event.addListener(map, 'zoom_changed', () => {
            setAutoFitBounds(false);
            renderRouteLines();
        });

        // 컴포넌트 언마운트 시 이벤트 리스너 해제
        return () => {
            kakao.maps.event.removeListener(map, 'dragstart');
            kakao.maps.event.removeListener(map, 'zoom_changed');
        };
        // eslint-disable-next-line
    }, []); // 빈 배열로 설정하여 한 번만 실행

    // 선택된 장소 오버레이 렌더링 함수
    const renderOverlays = useCallback(() => {
        if (!mapRef.current) return;

        clearOverlays(selectedOverlayRef.current);
        selectedOverlayRef.current = [];

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
        // eslint-disable-next-line
    }, [selectedPlaces, autoFitBounds]);

    // 경로 라인 렌더링 함수
    const renderRouteLines = useCallback(() => {
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
            strokeStyle: dashLength ? 'dashed' : 'solid',
            strokeDashArray: dashLength
        });
        polyline.setMap(map);
        routeLinesRef.current.push(polyline);
    }, [selectedPlaces]);

    // 장소 검색 및 마커 표시
    useEffect(() => {
        if (!mapRef.current || !searchKeyword) return;

        const ps = new kakao.maps.services.Places();
        setAutoFitBounds(true);

        ps.keywordSearch(searchKeyword, (data, status) => {
            if (status === kakao.maps.services.Status.OK) {
                displayPlaces(data);
            } else {
                alert(
                    status === kakao.maps.services.Status.ZERO_RESULT
                        ? '검색 결과가 존재하지 않음'
                        : '검색 중 오류 발생!'
                );
            }
        });
        // eslint-disable-next-line
    }, [searchKeyword]);

    const displayPlaces = useCallback((places) => {
        if (!mapRef.current) return;

        const map = mapRef.current;
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
    }, [selectedPlaces, autoFitBounds, setPlaces]);

    // 선택된 장소가 변경될 때 오버레이 및 라인 업데이트
    useEffect(() => {
        renderOverlays();

        // 검색 마커 제거
        clearOverlays(searchMarkerRef.current);
        searchMarkerRef.current = [];
    }, [selectedPlaces, renderOverlays]);

    return (
        <div className="map-container">
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
});

export default KakaoMap;