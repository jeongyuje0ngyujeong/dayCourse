import React, { useEffect, useState } from 'react';
import { Map, MapMarker } from "react-kakao-maps-sdk"

var markers = [];
const {kakao} = window;

export default function InputTown() {
    const [info, setInfo] = useState()
    const [markers, setMarkers] = useState([])
    const [map, setMap] = useState()

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

    useEffect(() => {
        if (!map) return
        const ps = new kakao.maps.services.Places()

        ps.keywordSearch("이태원 맛집", (data, status, _pagination) => {
        if (status === kakao.maps.services.Status.OK) {
            // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
            // LatLngBounds 객체에 좌표를 추가합니다
            const bounds = new kakao.maps.LatLngBounds()
            let markers = []

            for (var i = 0; i < data.length; i++) {
            // @ts-ignore
            markers.push({
                position: {
                lat: data[i].y,
                lng: data[i].x,
                },
                content: data[i].place_name,
            })
            // @ts-ignore
            bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x))
            }
            setMarkers(markers)

            // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
            map.setBounds(bounds)
        }
        })
    }, [map])

    return (
        // <form onSubmit={submitKeyword}>
        //     <input
        //         type="text"
        //         placeholder='검색어를 입력해주세요'
        //         value={value}
        //         onChange={keywordChange}
        //         required
        //     />
        //     <button type="submit">검색</button>
        // </form>

        <Map // 로드뷰를 표시할 Container
        center={{
            lat: 37.566826,
            lng: 126.9786567,
        }}
        style={{
            width: "100%",
            height: "350px",
        }}
        level={3}
        onCreate={setMap}
        >
        {markers.map((marker) => (
            <MapMarker
            key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
            position={marker.position}
            onClick={() => setInfo(marker)}
            >
            {info &&info.content === marker.content && (
                <div style={{color:"#000"}}>{marker.content}</div>
            )}
            </MapMarker>
        ))}
        </Map>
    )
}
