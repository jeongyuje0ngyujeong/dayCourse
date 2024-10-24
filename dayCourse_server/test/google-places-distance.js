const express = require('express');
var axios = require('axios');
const app = express();

//수정중이었음

app.get('/distance', async (req, res) => {
    const start_place = '광교';
    const end_place = ;
    const placeName = region + " " + keyWord; // 검색할 장소
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;

    try {
        // Google Places API에 요청 보내기
        const response = await axios.get(url, {
            params: {
                query: placeName,
                key: process.env.GOOGLE_API_KEY,
                language: 'ko' // 응답을 한글로 받기 위해 language 파라미터 설정
            }
        });

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

const getDistance = async (req, res) => {
    const origins = '37.259,127.036';  // 출발지 좌표
    const destinations = '37.540,126.978';  // 목적지 좌표
    const apiKey = 'YOUR_GOOGLE_API_KEY';  // 구글 API 키
    
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
            params: {
                origins,
                destinations,
                key: apiKey,
            }
        });

        // Google Maps API 응답 결과를 프론트엔드에 전달
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('API 요청에 실패했습니다.');
    }
};

module.exports = { getDistance };