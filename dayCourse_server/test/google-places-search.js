const express = require('express');
var axios = require('axios');
const app = express();

const API_KEY = 'AIzaSyDKWY8E-Qjx_Bt7mgOGh7bUKIoFgmEwo6E'

app.get('/search', async (req, res) => {
    const region = '강남역';
    const keyWord = '한식';
    const placeName = region + " " + keyWord; // 검색할 장소
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;

    try {
        // Google Places API에 요청 보내기
        const response = await axios.get(url, {
            params: {
                query: placeName,
                key: API_KEY,
                language: 'ko' // 응답을 한글로 받기 위해 language 파라미터 설정
            }
        });
        let result = response.data.results;
        for (let i = 0; i < result.length; i++) {
            console.log((i + 1) + '번 장소 주소: ' + result[i].formatted_address);
            console.log((i + 1) + '번 장소 이름: ' + result[i].name);
            console.log((i + 1) + '번 장소 별점: ' + result[i].rating);
            console.log((i + 1) + '번 장소 타입: ' + result[i].types);
            console.log((i + 1) + '번 장소 위도: ' + result[i].geometry.location.lat)
            console.log((i + 1) + '번 장소 경도: ' + result[i].geometry.location.lng)
            console.log(" ");
        }

        // 요청이 성공했을 때 응답
        if (response.data.status === 'OK') {
            // 검색된 결과를 한 번만 JSON 형식으로 반환
            res.json(response.data.results);
        } else {
            // 요청 실패 시 오류 응답 전송
            res.status(500).json({ error: '장소 검색 실패', status: response.data.status });
        }
    } catch (error) {
        // 예외 발생 시 서버 오류 응답 전송
        console.error('Error occurred while fetching place details:', error);
        res.status(500).json({ error: '서버 에러 발생' });
    }
});

// 서버 실행
app.listen(3001, () => {
    console.log('서버가 http://localhost:3001 에서 실행 중입니다');
});
