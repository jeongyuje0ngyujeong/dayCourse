import React, { useEffect, useRef, useState, useCallback } from 'react';
import './KakaoMap.css';

const { kakao } = window;

function KakaoMap({ searchKeyword, setPlaces, selectedPlaces = [] }) {
    const mapRef = useRef(null);
    const searchMarkerRef = useRef([]); // 검색 결과 마커를 저장할 배열
    const selectedOverlayRef = useRef([]); // 선택된 장소 오버레이를 저장할 배열
    const [autoFitBounds, setAutoFitBounds] = useState(true);
    const routeLinesRef = useRef([]);
    const animationIntervalRef = useRef(null); // 애니메이션 인터벌 추적

    // 오버레이 제거 함수 (기본 마커용)
    const clearOverlays = useCallback((overlays) => {
        overlays.forEach(overlay => overlay.setMap(null));
    }, []);

    // 라인 제거 함수
    const clearLines = useCallback((lines) => {
        lines.forEach(line => {
            if (line && typeof line.setMap === 'function') {
                line.setMap(null);
            } else {
                console.warn('Invalid line object:', line);
            }
        });
    }, []);

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
        let dashLength = [];

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
            path: [linePath[0]], // 시작 지점만 설정
            strokeWeight: strokeWeight,
            strokeColor: '#5c5b5b',
            strokeOpacity: 0.7,
            strokeStyle: dashLength.length ? 'dashed' : 'solid',
            strokeDashArray: dashLength
        });
        polyline.setMap(map);
        routeLinesRef.current.push(polyline);
        
        let currentIndex = 1;

        // 기존 인터벌이 존재하면 제거
        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current);
        }

        // 애니메이션 인터벌 설정
        animationIntervalRef.current = setInterval(() => {
            if (currentIndex < linePath.length) {
                const newPath = polyline.getPath();
                newPath.push(linePath[currentIndex]); // 경로에 다음 지점 추가
                polyline.setPath(newPath);
                currentIndex += 1;
            } else {
                clearInterval(animationIntervalRef.current); // 애니메이션 종료
                animationIntervalRef.current = null;
            }
        }, 100);
    }, [selectedPlaces, clearLines]);

    // 지도 초기화 (한 번만 실행)
    useEffect(() => {
        const mapContainer = document.getElementById("map");
        const mapOptions = {
            center: new kakao.maps.LatLng(37.496486063, 127.028361548), // 초기 중심 (강남역)
            level: 5,
            draggable: true,
            zoomable: true,
        };

        const map = new kakao.maps.Map(mapContainer, mapOptions);
        mapRef.current = map;

        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        // 드래그 시작 시 autoFitBounds 비활성화
        const dragStartListener = kakao.maps.event.addListener(map, 'dragstart', () => setAutoFitBounds(false));

        // 줌 변경 시 autoFitBounds 비활성화 및 경로 라인 재렌더링
        const zoomChangeListener = kakao.maps.event.addListener(map, 'zoom_changed', () => {
            setAutoFitBounds(false);
            renderRouteLines();
        });

        // 컴포넌트 언마운트 시 이벤트 리스너 해제 및 인터벌 클리어
        return () => {
            kakao.maps.event.removeListener(map, 'dragstart', dragStartListener);
            kakao.maps.event.removeListener(map, 'zoom_changed', zoomChangeListener);
            if (animationIntervalRef.current) {
                clearInterval(animationIntervalRef.current);
            }
        };

        
    }, [renderRouteLines, autoFitBounds]);

    // 선택된 장소 오버레이 렌더링 함수
    const renderOverlays = useCallback(() => {
        if (!mapRef.current) return;

        // 기존 오버레이 제거
        clearOverlays(selectedOverlayRef.current);
        selectedOverlayRef.current = [];

        const map = mapRef.current;
        const bounds = new kakao.maps.LatLngBounds();

        selectedPlaces.forEach((place, index) => {
            const position = new kakao.maps.LatLng(place.y || place.Y, place.x || place.X);
            
            // 오버레이를 감쌀 컨테이너 div 생성
            const container = document.createElement('div');
            container.className = 'overlay-container';

            // 애니메이션 클래스가 포함된 콘텐츠 div 생성
            const content = document.createElement('div');
            content.className = `overlay-animated overlay-delay-${index + 1}`; // 인덱스에 따라 지연 클래스 할당
            content.style.color = 'white';
            content.style.background = '#ff3f21';
            content.style.borderRadius = '50%';
            content.style.width = '24px';
            content.style.height = '24px';
            content.style.display = 'flex';
            content.style.alignItems = 'center';
            content.style.justifyContent = 'center';
            content.style.fontWeight = 'bold';
            content.textContent = index + 1;

            container.appendChild(content);

            const overlay = new kakao.maps.CustomOverlay({
                position,
                content: container, // 애니메이션이 적용된 콘텐츠를 포함한 컨테이너 사용
                yAnchor: 1,
                xAnchor: 0.5,
            });

            overlay.setMap(map);
            selectedOverlayRef.current.push(overlay);
            bounds.extend(position);
        });

        // autoFitBounds에 관계없이 선택된 장소들만을 기준으로 지도 경계 조정
        if (selectedPlaces.length > 0) {
            if (selectedPlaces.length === 1) {
                map.setCenter(bounds.getSouthWest());
            } else {
                map.setBounds(bounds);
            }
        }

        // 경로 라인 렌더링
        renderRouteLines();
    }, [selectedPlaces, clearOverlays, renderRouteLines]);

    // 장소 검색 및 마커 표시
    useEffect(() => {
        if (!mapRef.current || !searchKeyword) return;

        const ps = new kakao.maps.services.Places();
        setAutoFitBounds(false); // 검색 시 autoFitBounds 비활성화하여 검색 결과가 지도의 경계를 변경하지 않도록 함

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

        // 기존 검색 마커 제거
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
                // 기본 제공 마커 생성
                const marker = new kakao.maps.Marker({
                    position,
                    map, // 마커를 표시할 지도
                    title: place.place_name, // 마커에 표시할 제목
                });
                

                // 마커 클릭 시 선택된 장소로 추가하거나 다른 동작을 원할 경우 이벤트 핸들러 추가 가능
                // 예시:
                /*
                kakao.maps.event.addListener(marker, 'click', () => {
                    // 선택된 장소로 추가하는 로직
                });
                */

                searchMarkerRef.current.push(marker);
            }

            // 기존 bounds.extend(position); 제거: 검색 결과로 setBounds 하지 않음
        });

        // setBounds 관련 코드 제거

        setPlaces(places);
    }, [selectedPlaces, clearOverlays, setPlaces]);

    // 선택된 장소가 변경될 때 오버레이 및 라인 업데이트
    useEffect(() => {
        renderOverlays();

        // 검색 마커 제거
        clearOverlays(searchMarkerRef.current);
        searchMarkerRef.current = [];
    }, [selectedPlaces, renderOverlays, clearOverlays]);

    return (
        <div className="map-container">
            <div id="map" style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
}

export default KakaoMap;