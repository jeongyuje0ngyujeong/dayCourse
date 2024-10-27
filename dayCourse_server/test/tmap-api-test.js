const express = require('express');
const axios = require('axios');
const app = express();

const db = require('../db')
const dotenv = require('dotenv');

dotenv.config();

const APP_KEY = process.env.TMAP_APP_KEY;

app.get('/matrix', async (req, res) => {
  console.log('matrix 실행중');

  const data = {
    "origins": [
      { 
        "lon": "127.045634274933",
        "lat": "37.2994227148801"  
      },
      { 
        "lon": "127.044720111248",
        "lat": "37.2984499441159" 
      } 
    ],
    "destinations": [
      { 
        "lon": "127.044720111248",
        "lat": "37.2984499441159"
      },
      { 
        "lon": "127.041939658366",
        "lat": "37.2998290076309" 
      }
    ],
    "transportMode": "pedestrian"
  };

  try {
    const response = await axios.post('https://apis.openapi.sk.com/tmap/matrix?version=1', 
      data, {
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'appKey': 'XxXWTihaLS9axB3B0rqq84pGH854BTXhhYDtVX10'
        }
      });

    console.log('Response Data:', response.data);

    const routes = [];
    let checkIdx = 0;
    const matrixRoutes = response?.data?.matrixRoutes;
    for (let i = 0; i < matrixRoutes.length; i++) {
      // console.log("for문 실행");
      const originIdx = matrixRoutes[i].originIndex;
      const destinationIdx = matrixRoutes[i].destinationIndex;

      if (originIdx === destinationIdx && destinationIdx == checkIdx) {
        // console.log("idx 비교문 실행");
        routes.push(matrixRoutes[i].distance);
        checkIdx++;
      }
    }

    console.log(routes);

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).send('T-map API 요청에 실패했습니다.');
  }
});

// 서버 실행
app.listen(3001, () => {
  console.log('서버가 http://localhost:3001 에서 실행 중입니다');
});
