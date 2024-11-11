// KakaoMap.js
import React, { useEffect, useRef, useCallback } from 'react';
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
        // console.log('Clearing lines:', lines); 
        lines.forEach(line => {
            if (line && typeof line.setMap === 'function') {
                line.setMap(null);
            } else {
                console.warn('Invalid line object:', line);
            }
        });
    }, []);

    // 라인 렌더링 함수 먼저 정의
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
    }, [selectedPlaces, clearLines]);

    // 오버레이 렌더링 함수
    const renderOverlays = useCallback(() => {
        console.log('Rendering overlays with selectedPlaces:', selectedPlaces);
        if (!mapRef.current || selectedPlaces.length === 0) return;

        clearOverlays(selectedOverlayRef.current);
        selectedOverlayRef.current = []; // 배열 초기화

        const map = mapRef.current;
        const bounds = new kakao.maps.LatLngBounds();

        selectedPlaces.forEach((place, index) => {
            const position = new kakao.maps.LatLng(place.y || place.Y, place.x || place.X);
            const content = `
                <div style="pointer-events: none; color: white; background: #8cd108; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
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

        if (autoFitBoundsRef.current && selectedPlaces.length > 0) {
            if (selectedPlaces.length === 1) {
                map.setCenter(bounds.getSouthWest());
            } else {
                map.setBounds(bounds);
            }
        }
        renderRouteLines();
    }, [selectedPlaces, clearOverlays, renderRouteLines]);

    const handleZoomChange = useCallback(() => {
        renderRouteLines();
    }, [renderRouteLines]);

    useEffect(() => {
        if (mapRef.current) return; // 맵이 이미 초기화되었으면 중단

        // 지도 생성
        const mapOptions = {
            center: new kakao.maps.LatLng(37.496486063, 127.028361548),
            level: 5,
            draggable: true,
            zoomable: true,
        };

        const map = new kakao.maps.Map(mapContainerRef.current, mapOptions);
        mapRef.current = map;

        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        kakao.maps.event.addListener(map, 'tilesloaded', () => {
            console.log('Tiles loaded, rendering overlays and routes.');
            renderOverlays();
            renderRouteLines();
        });

        kakao.maps.event.addListener(map, 'dragstart', () => {
            console.log('Map drag started, setting autoFitBounds to false.');
            autoFitBoundsRef.current = false;
        });

        kakao.maps.event.addListener(map, 'zoom_changed', () => {
            console.log('Map zoom changed, setting autoFitBounds to false.');
            autoFitBoundsRef.current = false;
            handleZoomChange();
        });

        const ps = new kakao.maps.services.Places();

        // 검색 마커 표시 함수
        const displayPlaces = (places) => {
            console.log('Displaying places:', places);
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

            if (searchKeyword) {
                // 사용자가 검색을 수행했으므로 autoFitBoundsRef.current를 true로 설정
                autoFitBoundsRef.current = true;
            }

            if (autoFitBoundsRef.current) {
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
            console.log('Executing keyword search:', searchKeyword);
            autoFitBoundsRef.current = true; // 검색 시 autoFitBoundsRef.current를 true로 설정
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
    }, [renderOverlays, renderRouteLines, handleZoomChange, searchKeyword, setPlaces]);

    // 검색 키워드가 변경될 때마다 검색 실행
    useEffect(() => {
        if (!mapRef.current) return;

        const ps = new kakao.maps.services.Places();

        const displayPlaces = (places) => {
            console.log('Displaying places:', places);
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
                    marker.setMap(mapRef.current);
                    searchMarkerRef.current.push(marker);
                }

                bounds.extend(position);
            });

            if (searchKeyword) {
                // 사용자가 검색을 수행했으므로 autoFitBoundsRef.current를 true로 설정
                autoFitBoundsRef.current = true;
            }

            if (autoFitBoundsRef.current) {
                if (places.length === 1) {
                    const singlePlace = places[0];
                    const singlePosition = new kakao.maps.LatLng(singlePlace.y || singlePlace.Y, singlePlace.x || singlePlace.X);
                    mapRef.current.setCenter(singlePosition);
                } else {
                    mapRef.current.setBounds(bounds);
                }
            }
            setPlaces(places);
        };

        if (searchKeyword) {
            console.log('Executing keyword search:', searchKeyword);
            autoFitBoundsRef.current = true; // 검색 시 autoFitBoundsRef.current를 true로 설정
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
        } else {
            // 검색 키워드가 비어있을 경우 모든 검색 마커 제거
            clearOverlays(searchMarkerRef.current);
            searchMarkerRef.current = [];
        }

    }, [searchKeyword, setPlaces]);

    // selectedPlaces 변경 시 오버레이와 라인 렌더링 및 검색 마커 클리어
    useEffect(() => {
        console.log('selectedPlaces changed, rendering overlays and routes.');
        if (mapRef.current) {
            renderOverlays();
            renderRouteLines();
            // 선택된 장소가 변경되면 검색 마커도 클리어
            clearOverlays(searchMarkerRef.current);
            searchMarkerRef.current = [];
        }
    }, [selectedPlaces, renderOverlays, renderRouteLines, clearOverlays]);

    return (
        <div className="map-container">
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
});

export default KakaoMap;