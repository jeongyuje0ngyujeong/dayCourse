const express = require('express');
const axios = require('axios');
const app = express();

const dotenv = require('dotenv');

dotenv.config();

app.get('/distance', async (req, res) => {
    // 임의의 테스트 데이터
    const origin = [
        { lat: 37.298, lng: 127.044 },
        { lat: 37.299, lng: 127.045 }
    ];
    const destination = [
        { lat: 37.299, lng: 127.045 },
        { lat: 37.299, lng: 127.042 }
    ];

    // 각 좌표를 "lat,lng" 형식으로 변환
    const origins = origin.map(point => `${point.lat},${point.lng}`).join('|');
    const destinations = destination.map(point => `${point.lat},${point.lng}`).join('|');
    console.log("test 진행중..");
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
            params: {
                origins,
                destinations,
                key: 'AIzaSyDKWY8E-Qjx_Bt7mgOGh7bUKIoFgmEwo6E'
            }
        });

        console.log(response);
       
        const distances = response.data.rows.map(row =>
            row.elements.map(element => ({
                distance: element.distance ? element.distance.text : 'N/A',
                duration: element.duration ? element.duration.text : 'N/A',
            }))
        );
        
        console.log(distances);
        res.json(distances);        
     

    } catch (error) {
        console.error(error);
        res.status(500).send('API 요청에 실패했습니다.');
    }
});

app.listen(3002, () => {
    console.log('Server is running on port 3002');
});