const express = require('express');
const axios = require('axios');
const app = express();

const db = require('../db')

const dotenv = require('dotenv');

dotenv.config();

const getPlaces = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// router.post('/plan/place_distance', async (req, res) => {
app.get('/distance', async (req, res) => {
    const planId = 10;

    if (!planId) {
        return res.status(400).json({ error: 'planId is required' });
    }

    const sql = `
      SELECT CONCAT(ST_Y(coordinates), ',', ST_X(coordinates)) AS coordinates
      FROM Plan_Location
      WHERE Plan_Location.planId = ?
      ORDER BY Plan_Location.l_priority ASC;
    `;

    try {
        const places = await getPlaces(sql, [planId]);

        if (places.length === 0) {
            return res.json({ result: 'failure', message: 'Invalid planId' });
        }

        places.forEach((place, index) => console.log(`Place ${index}: ${place.coordinates}`));

        const origins = places.slice(0, -1).map(point => point.coordinates).join('|');
        const destinations = places.slice(1).map(point => point.coordinates).join('|');

        console.log('origins: ' + origins);
        console.log('destinations: ' + destinations);

        const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
            params: {
                origins,
                destinations,
                key: 'AIzaSyDKWY8E-Qjx_Bt7mgOGh7bUKIoFgmEwo6E'
            }
        });

        console.log("Response Data: ", response.data);

        response.data.rows.forEach((row, rowIndex) => {
            console.log(`Row ${rowIndex}:`);
            row.elements.forEach((element, elementIndex) => {
              console.log(`  Element ${elementIndex}: ${JSON.stringify(element, null, 2)}`);
            });
          });          
        
        const distances = response.data.rows.map(row => 
            row.elements[0].distance ? row.elements[0].distance.text : 'N/A'
        );
        

        // const distances = response.data.rows.map((row, i) =>
        //     row.elements[i].distance ? row.elements[i].distance.text : 'N/A'
        // );

        console.log('distances: ' + distances);
        return res.status(200).json({ msg: 'success', distances });

    } catch (error) {
        console.error(error);
        res.status(500).send('API 요청에 실패했습니다.');
    }
});

// app.get('/distance', async (req, res) => {
//     // 임의의 테스트 데이터
//     const origin = [
//         { lat: 37.298, lng: 127.044 },
//         { lat: 37.299, lng: 127.045 }
//     ];
//     const destination = [
//         { lat: 37.299, lng: 127.045 },
//         { lat: 37.299, lng: 127.042 }
//     ];

//     // 각 좌표를 "lat,lng" 형식으로 변환
//     const origins = origin.map(point => `${point.lat},${point.lng}`).join('|');
//     const destinations = destination.map(point => `${point.lat},${point.lng}`).join('|');
//     console.log("test 진행중..");
//     try {
//         const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
//             params: {
//                 origins,
//                 destinations,
//                 key: 'AIzaSyDKWY8E-Qjx_Bt7mgOGh7bUKIoFgmEwo6E'
//             }
//         });

//         console.log(response);
       
//         const distances = response.data.rows.map(row =>
//             row.elements.map(element => ({
//                 distance: element.distance ? element.distance.text : 'N/A',
//                 duration: element.duration ? element.duration.text : 'N/A',
//             }))
//         );
        
//         console.log(distances);
//         res.json(distances);        
     

//     } catch (error) {
//         console.error(error);
//         res.status(500).send('API 요청에 실패했습니다.');
//     }
// });

app.listen(3002, () => {
    console.log('Server is running on port 3002');
});