const express = require('express');
const router = express.Router();
const express = require('express');
const router = express.Router();
const db = require('../db')
const axios = require('axios');
const multer = require('multer'); // 1. multer 추가 (파일 업로드 처리)
const FormData = require('form-data');

const fs = require('fs'); //파일 저장용
const path = require('path');

const authenticateJWT = require('../config/authenticateJWT');

const APP_KEY = process.env.TMAP_APP_KEY;


//s3연결
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-2' });
const s3 = new AWS.S3();
const bucketName = 'daycourseimage';

// 1. 메모리 스토리지 설정 (파일을 메모리에 저장)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // 메모리 기반 저장소 사용

router.get('/', authenticateJWT, async (req, res) => {
    console.log('home 일정 가져옴');
    const { startDate } = req.query;
    const userId = req.user.userId;

    // Check if required parameters are provided
    if (!startDate) {
        return res.status(400).json({ error: 'userId and startDate are required' });
    }

    //   AND Plan.startDate BETWEEN DATE_FORMAT(?, '%Y-%m-01') AND LAST_DAY(?)

    const sql = `
        SELECT Plan.planId, Plan.startDate, Plan.planName, groupMembers.groupId, Plan.start_userId, Plan.town
        FROM groupMembers
        JOIN Plan ON groupMembers.groupId = Plan.groupId
        WHERE groupMembers.userId = ?
        AND Plan.startDate BETWEEN DATE_SUB(?, INTERVAL 1 MONTH) AND DATE_ADD(?, INTERVAL 1 MONTH)
    `;

    const values = [userId, startDate, startDate];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Convert each result's startDate to KST (UTC + 9)
        const formattedResult = result.map(plan => {
            const utcDate = new Date(plan.startDate); // Parse the original UTC date
            const koreaTime = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // Convert to KST
            const formattedStartDate = koreaTime.toISOString().split('T')[0]; // Extract YYYY-MM-DD

            const { startDate, ...rest } = plan;

            // Return the modified object with the KST startDate
            return {
                ...rest,
                dateKey: formattedStartDate // Replace original startDate with the KST formatted date
            };
        });

        return res.status(200).json(formattedResult); // Return the modified result
    });
});

router.post('/plan', authenticateJWT, async (req, res) => {
    console.log("req.user:", JSON.stringify(req.user, null, 2));

    const userId = req.user.userId;
    const { dateKey, startDateTime, planName, town, groupId } = req.body;

    console.log('일정등록요청')

    // Check if required parameters are provided
    if (!dateKey) {
        return res.status(400).json({ error: 'userId or startDate are required' });
    }

    let newplanName = planName

    if (!planName) {
        newplanName = dateKey
    }

    const sql = `
      INSERT INTO Plan (start_userId, startDate, endDate, planName, town, groupId)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    // groupId 잠시 주석,, 나중에 그룹이 만들어지면 추가할 것
    //const values = [userId, dateKey, dateKey, newplanName, town];
    const values = [userId, dateKey, dateKey, newplanName, town, groupId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        const sql_pu = `
            INSERT INTO Plan_User (userId, planId)
            VALUES (?, ?)
        `;

        const values_pu = [userId, result.insertId];

        db.query(sql_pu, values_pu, (err, result_pu) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: 'Database error' });
            }

        });

        return res.status(201).json({ msg: 'success', planId: result.insertId });
    });
});


router.get('/plans/recent', authenticateJWT, async (req, res) => {
    console.log('home/plans/recent');
    const userId = req.user.userId;

    const sql = `
      SELECT Plan.planId, Plan.startDate, Plan.planName, Plan.groupId
      FROM groupMembers
      JOIN Plan ON groupMembers.groupId = Plan.groupId
      WHERE groupMembers.userId = ? AND Plan.startDate <= NOW()
      ORDER BY Plan.startDate DESC
    `;

    const values = [userId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Convert each result's startDate to KST (UTC + 9)
        const formattedResult = result.map(plan => {
            const utcDate = new Date(plan.startDate); // Parse the original UTC date
            const koreaTime = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // Convert to KST
            const formattedStartDate = koreaTime.toISOString().split('T')[0]; // Extract YYYY-MM-DD

            const { startDate, ...rest } = plan;

            // Return the modified object with the KST startDate
            return {
                ...rest,
                dateKey: formattedStartDate // Replace original startDate with the KST formatted date
            };
        });

        res.status(200).json(formattedResult); // Return the modified result
    });
});


router.post('/plan/town_update', authenticateJWT, async (req, res) => {
    const { destination, planId } = req.body;
    const userId = req.user.userId;
    console.log("지역 업데이트")

    // Check if required parameters are provided
    if (!planId) {
        return res.status(400).json({ error: 'userId or planId are required' });
    }

    const sql = `
      UPDATE Plan
      SET town = ?
      WHERE  planId = ? AND start_userId = ?;
    `;

    const values = [destination, planId, userId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }


        res.status(201).json({ msg: 'success' });
    });
});


router.post('/plan/update', authenticateJWT, async (req, res) => {
    const { schedule } = req.body;
    const userId = req.user.userId;

    const { planId, dateKey, endDate, planName, town } = schedule;
    console.log('계획수정')

    // Check if required parameters are provided
    if (!planId) {
        return res.status(400).json({ error: 'userId or planId are required' });
    }

    let endDate_new = endDate

    if (!endDate) {
        endDate_new = dateKey
    }

    const sql = `
      UPDATE Plan
      SET planName = ?, startDate = ?, endDate = ?, town = ?
      WHERE  planId = ? AND start_userId = ?;
    `;

    const values = [planName, dateKey, endDate_new, town, planId, userId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({ msg: 'success' });
    });
});



router.post('/plan/place', authenticateJWT, (req, res) => {
    console.log('place get');
    const { planId } = req.body;

    const sql = `
      SELECT Plan.town
      FROM Plan
      WHERE Plan.planId = ?;
    `;

    const sql_location = `
      SELECT 
        Plan_Location.memo, 
        Plan_Location.l_priority, 
        Plan_Location.place, 
        Plan_Location.placeId, 
        Plan_Location.place_name, 
        Plan_Location.version, 
        ST_AsText(Plan_Location.coordinates) as coordinates
      FROM Plan_Location
      WHERE Plan_Location.planId = ?;
    `;

    const values = [planId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error fetching town data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        db.query(sql_location, values, (err, result_location) => {
            if (err) {
                console.error('Error fetching location data:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            // 좌표 파싱
            const formattedResult = result_location.map(location => {
                const coordinatesText = location.coordinates; // "POINT(X Y)" 형태
                let x = null, y = null;

                if (coordinatesText) {
                    // 좌표 텍스트에서 X, Y 추출
                    const match = coordinatesText.match(/POINT\(([^ ]+) ([^ ]+)\)/);
                    if (match) {
                        x = parseFloat(match[1]);
                        y = parseFloat(match[2]);
                    }
                }

                return {
                    ...location,
                    X: x,
                    Y: y
                };
            });

            res.status(201).json(formattedResult);
        });
    });
});



router.delete('/plan/place', authenticateJWT, (req, res) => {
    console.log('place delete');
    const { placeId } = req.query;

    if (!placeId) {
        return res.status(400).json({ error: 'placeId 없음!' });
    }

    const sqlDelete = `
      DELETE FROM Plan_Location 
      WHERE placeId = ?;
    `;

    const sqlPlanId = `
      SELECT planId FROM Plan_Location WHERE placeId = ?;
    `;

    const sqlSet = `SET @new_seq = 0;`;

    const sqlUpdate = `
      UPDATE Plan_Location
      SET l_priority = (@new_seq := @new_seq + 1)
      WHERE planId = ?
      ORDER BY l_priority;
    `;

    // 1. planId를 먼저 조회
    db.query(sqlPlanId, [placeId], (err, result) => {
        if (err) {
            console.error('Error retrieving planId:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'planId not found' });
        }

        const planId = result[0].planId;

        // 2. 데이터 삭제 쿼리 실행
        db.query(sqlDelete, [placeId], (err, result) => {
            if (err) {
                console.error('Error deleting data:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            // 3. 순서 초기화 변수 설정
            db.query(sqlSet, (err) => {
                if (err) {
                    console.error("Error setting variable:", err);
                    return res.status(500).send("Database error");
                }

                // 4. 순서 업데이트 쿼리 실행
                db.query(sqlUpdate, [planId], (err, results) => {
                    if (err) {
                        console.error("Error updating data:", err);
                        return res.status(500).send("Database error");
                    }

                    return res.status(201).json({ msg: 'success' });
                });
            });
        });
    });
});


router.post('/plan/delete', authenticateJWT, async (req, res) => {
    const { planId } = req.body;
    const userId = req.user.userId;

    console.log('일정 삭제');

    // 필수 파라미터 확인
    if (!planId) {
        return res.status(400).json({ error: 'planId는 필수입니다.' });
    }

    const sql_pu = `
      DELETE FROM Plan_User 
      WHERE planId = ?;
    `;

    const sql_pl = `
      DELETE FROM Plan_Location 
      WHERE planId = ?;
    `;

    const sql = `
      DELETE FROM Plan 
      WHERE planId = ? AND start_userId = ?;
    `;

    const values = [planId, userId];

    try {
        // 첫 번째 쿼리 실행
        await db.promise().query(sql_pu, [planId]);
        await db.promise().query(sql_pl, [planId]);

        // 두 번째 쿼리 실행
        await db.promise().query(sql, values);

        // 성공적인 응답 전송
        return res.status(200).json({ msg: 'success' });
    } catch (err) {
        console.error('데이터베이스 오류:', err);
        return res.status(500).json({ error: '데이터베이스 오류' });
    }
});


router.post('/plan/addPlace', authenticateJWT, async (req, res) => {
    const { planId, memo, place } = req.body;
    const userId = req.user.userId;

    console.log("일정장소추가")

    const x = parseFloat(place.x);
    const y = parseFloat(place.y);

    // Check if required parameters are provided
    if (!planId) {
        return res.status(400).json({ error: 'userId or planId are required' });
    }

    const sql = `
        INSERT INTO Plan_Location (planId, l_priority, memo, place, place_name, coordinates, version)
        SELECT ?, IFNULL(MAX(l_priority), 0) + 1, ?, ?, ?, ST_GeomFromText('POINT(${x} ${y})'), ?
        FROM Plan_Location
        WHERE planId = ?;
    `;

    const values = [planId, memo, place.address_name, place.place_name, 1, planId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        return res.status(200).json({ msg: 'success' });
    });
});



router.post('/plan/addRecommendedPlace', authenticateJWT, async (req, res) => {
    const { planId, memo, place_name, address_name, l_priority, x, y } = req.body;
    const userId = req.user.userId;

    console.log("일정장소추가/추천장소")

    const xx = parseFloat(x);
    const yy = parseFloat(y);

    // Check if required parameters are provided
    if (!planId) {
        return res.status(400).json({ error: 'userId or planId are required' });
    }

    const sql = `
        INSERT INTO Plan_Location (planId, l_priority, memo, place, place_name, coordinates, version)
        SELECT ?, IFNULL(MAX(l_priority), 0) + 1, ?, ?, ?, ST_GeomFromText('POINT(${xx} ${yy})'), ?
        FROM Plan_Location
        WHERE planId = ?;
    `;

    const values = [planId, memo, address_name, place_name, 1, planId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        return res.status(200).json({ msg: 'success' });
    });
});

router.post('/plan/place/priority', async (req, res) => {
    const { placeId, priority, version } = req.body;

    console.log('장소순서변경 :' + version)

    const sql_select = `
      SELECT version
      FROM Plan_Location
      WHERE placeId = ?
    `;

    const sql = `
      UPDATE Plan_Location
      SET l_priority = ?, version = ?
      WHERE placeId = ?;
    `;

    const values = [priority, (version + 1), placeId]

    db.query(sql_select, placeId, (err, place_ver) => {
        if (version < place_ver) {
            return res.status(200).json({ msg: '버전이 더 낮음' });
        }
    })

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        return res.status(200).json({ msg: 'success' });
    });
});



const getPlaces = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

router.post('/plan/place_distance', authenticateJWT, async (req, res) => {
    console.log("장소 간 거리 계산");
    const { planId } = req.body;

    if (!planId) {
        return res.status(400).json({ error: 'planId is required' });
    }

    const sql = `
      SELECT
        ST_X(coordinates) AS lon,
        ST_Y(coordinates) AS lat
      FROM Plan_Location
      WHERE Plan_Location.planId = ?
      ORDER BY Plan_Location.l_priority ASC;
    `;

    try {
        const places = await getPlaces(sql, [planId]);

        if (places.length === 0) {
            return res.json({ result: 'failure', message: 'Invalid planId' });
        }

        // place의 값 문자열 형태로 수정
        const stringifiedPlaces = places.map(place => ({
            lon: place.lon.toString(),
            lat: place.lat.toString()
        }));

        const origins = stringifiedPlaces.slice(0, -1)
        const destinations = stringifiedPlaces.slice(1)

        console.log('origins:', JSON.stringify(origins, null, 2));
        console.log('destinations:', JSON.stringify(destinations, null, 2));

        const data = {
            "origins": origins,
            "destinations": destinations,
            "transportMode": "pedestrian"
        };
        // 요청 초과 예외처리용
        // const response = null;

        // 오픈 api 요청
        const response = await axios.post('https://apis.openapi.sk.com/tmap/matrix?version=1',
            data, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'appKey': APP_KEY
            }
        });

        // 요청 초과 예외처리용
        if (response != null) {
            console.log("Response Data: ", response.data);

            const distances = [];
            let checkIdx = 0;
            // 계속 api 요청하지말고 그냥 테스트용으로 한번 받은 데이터를 가지고 체크 하게 (open api 한계)
            const matrixRoutes = response?.data?.matrixRoutes;
            for (let i = 0; i < matrixRoutes.length; i++) {
                // console.log("for문 실행");
                const originIdx = matrixRoutes[i].originIndex;
                const destinationIdx = matrixRoutes[i].destinationIndex;

                if (originIdx === destinationIdx && destinationIdx == checkIdx) {
                    // console.log("idx 비교문 실행");
                    distances.push(matrixRoutes[i].distance);
                    checkIdx++;
                }
            }

            console.log('distances: ' + distances);
            return res.status(200).json({ msg: 'success', distances });

            // 요청 초과 예외처리용
        } else {
            return res.status(429).json({ msg: 'api 요청 초과', distances });
        }

    } catch (error) {
        console.error('오류 응답 데이터:', error.response?.data);
        res.status(500).send('API 요청에 실패했습니다.');
    }
});


router.post('/plan/:enCategory/:enKeyword?', async (req, res) => {
    console.log("카테고리조회");
    const { enCategory, enKeyword } = req.params;

    const sql_category = `
        SELECT placeAddr, placeName, placeId, placeLat, placeLng
        WHERE placeType = ?
        ORDER BY placeRate DESC;
    `;

    const sql_keyword = `
        SELECT placeAddr, placeName, placeId, placeLat, placeLng
        FROM place_data
        WHERE placeKeyWord = ?
        ORDER BY placeRate DESC;
    `;

    const sql_all = `
        SELECT placeAddr, placeName, placeId, placeLat, placeLng
        FROM place_data
        ORDER BY placeRate DESC;
    `;

    let rows = [];

    if (enKeyword && enKeyword !== "랜덤") {
        // 키워드가 있을 때
        console.log("키워드 있음");
        let key = enKeyword;

        if (enKeyword === "쇼핑몰") key = "쇼핑";
        else if (enKeyword === "전시회") key = "전시";

        //const [result] = db.query(sql_keyword, [key]);
        console.log("쿼리 실행");
        const [result] = await db.promise().query(sql_keyword, [key]);
        rows = result;

    } else {
        // 키워드가 없을 때
        console.log("키워드 없음");
        let sql = sql_category;
        let values = "";

        if (enCategory === "음식점") values = "restaurant";
        else if (enCategory === "카페") values = "cafe";
        else {
            sql = sql_all;
            values = [];
        }

        console.log("쿼리 실행");
        const [result] = await db.promise().query(sql, [values]);
        rows = result;
    }

    // 필드 재명명하기
    const renamedUsers = rows.map(row => ({
        id: "0000",
        place_name: row.placeName,
        address_name: row.placeAddr,
        x: row.placeLng,
        y: row.placeLat,
        road_address_name: "12345", // 임시값
        phone: "01000000000" //필드없음
    }));

    console.log(renamedUsers);
    return res.status(200).json({ msg: 'success', place: renamedUsers });
});



// 이미지 목록을 가져오는 엔드포인트
router.get('/plan/:planId/images', async (req, res) => {
    console.log("사진가져옴")
    const planId = req.params.planId;

    try {
        const params = { Bucket: bucketName, Prefix: `plans/${planId}/` };

        // S3에서 객체 목록 가져오기
        s3.listObjects(params, (err, data) => {
            if (err) {
                console.error('Error retrieving images', err);
                return res.status(500).send('Error retrieving images');
            }

            // 이미지 URL을 반환하기 위해 S3 URL 생성
            const imageUrls = data.Contents.map(item => `https://${bucketName}.s3.amazonaws.com/${item.Key}`);

            // 이미지 URL 목록을 JSON 형식으로 전송
            console.log("전달");
            console.log(imageUrls);
            res.json(imageUrls);
        });
    } catch (err) {
        console.error('Error retrieving images', err);
        res.status(500).send('Error retrieving images');
    }
});





router.post('/plan/upload/:planId/images', upload.array('image'), async (req, res) => {
    console.log("사진 등록");

    try {
        const planId = req.params.planId;

        // 파일이 없을 경우 처리
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('파일이 없습니다');
        }

        // 업로드 결과를 저장할 배열
        const uploadResults = [];

        // 모든 파일에 대해 반복
        for (const file of req.files) {
            const imgNAME = path.basename(file.originalname);

            // S3 업로드 파라미터 설정
            const uploadParams = {
                Bucket: bucketName,
                Key: `plans/${planId}/${imgNAME}`,
                Body: file.buffer,
                ContentType: file.mimetype,
                Metadata: {}
            };

            // 이미지 파일 확장자 확인
            const ext = path.extname(file.originalname).toLowerCase();
            const allowedImageExtensions = ['.jpg', '.jpeg', '.png'];
            const isImage = allowedImageExtensions.includes(ext);

            // S3에 이미지 업로드
            const data = await new Promise((resolve, reject) => {
                s3.upload(uploadParams, (err, data) => {
                    if (err) {
                        console.log("Error", err);
                        reject('S3 업로드 중 오류 발생');
                    } else {
                        console.log("Upload Success", data.Location);
                        resolve(data);
                    }
                });
            });

            // 업로드된 위치를 결과 배열에 추가
            uploadResults.push({ msg: "성공", location: data.Location });
        }

        // 모든 파일의 업로드 결과를 사용자에게 반환
        res.json(uploadResults);

       // 사진 분석 요청 (비동기 작업)
       for (const file of req.files) {
        const imgNAME = path.basename(file.originalname);
        const s3ImageUrl = uploadResults.find(result => result.location.endsWith(imgNAME)).location; // S3 URL 가져오기

        // 이미지 분석 요청
        const form = new FormData();
        form.append('imageUrl', s3ImageUrl); // data.Location을 전달

        try {
            const response = await axios.post('http://13.124.135.96:5000/analyze', form, {
                headers: {
                    ...form.getHeaders(),
                },
            });

            const tags = response.data.Tags;

            // S3 메타데이터 업데이트를 위한 파라미터 설정
            const uploadParams = {
                Bucket: bucketName,
                Key: `plans/${planId}/${imgNAME}`,
                Metadata: {}
            };

            // 태그 메타데이터 추가
            tags.forEach((tag, index) => {
                uploadParams.Metadata[`tag${index + 1}`] = tag.name;
            });

            // S3 메타데이터 업데이트
            await s3.copyObject({
                Bucket: bucketName,
                CopySource: `${bucketName}/plans/${planId}/${imgNAME}`,
                Key: `plans/${planId}/${imgNAME}`,
                MetadataDirective: 'REPLACE', // 기존 메타데이터를 교체
                Metadata: uploadParams.Metadata // 새 메타데이터 추가
            }).promise();

            console.log(`메타데이터가 ${imgNAME}에 대해 업데이트되었습니다.`);

        } catch (error) {
            console.error('이미지 분석 중 오류 발생:', error);
        }
    }

    } catch (err) {
        console.error('이미지 처리 중 오류 발생', err);
        res.status(500).send('이미지 처리 중 오류 발생');
    }
});


router.get('/plan/moment', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;
    console.log("모먼트 가져옴");

    const sql = `
          SELECT Plan.planId
          FROM groupMembers
          JOIN Plan ON groupMembers.groupId = Plan.groupId
          WHERE groupMembers.userId = ? AND Plan.startDate <= NOW()
          ORDER BY Plan.startDate DESC
        `;

    db.query(sql, [userId], async (err, result) => {
        if (err) {
            console.error('데이터 가져오기 오류:', err);
            return res.status(500).json({ error: '데이터베이스 오류' });
        }

        console.log("조회한 일정 : ", result);
        if (result.length === 0) {
            return res.status(200).send('플랜이 없습니다'); // 플랜이 없는 경우
        }

        const planIds = result.map(plan => plan.planId);
        const imagesData = [];

        console.log("S3 에서 가져올거임");

        try {
            for (const planId of planIds) {
                const params = { Bucket: bucketName, Prefix: `plans/${planId}/` };
                const data = await s3.listObjectsV2(params).promise();

                if (!data.Contents || data.Contents.length === 0) {
                    continue;
                }

                for (const item of data.Contents) {
                    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${item.Key}`;
                    const metadata = await s3.headObject({ Bucket: bucketName, Key: item.Key }).promise();
                    const newMetadata = Object.values(metadata.Metadata);

                    imagesData.push({
                        url: imageUrl,
                        metadata: newMetadata + "\n"
                    });
                }
            }

            console.log("분석 폼 데이터 준비");

            const response = await axios.post('http://13.124.135.96:5000/cluster', { images: imagesData }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            const transformedData = { clusters: {} };

            for (const key in response.data.clusters) {
                const cluster = response.data.clusters[key];
                const { core_tag, object_ids } = cluster;

                if (!transformedData.clusters[core_tag]) {
                    transformedData.clusters[core_tag] = [];
                }

                transformedData.clusters[core_tag] = transformedData.clusters[core_tag].concat(object_ids);
            }

            console.log("모먼트 반환 완료");
            return res.json(transformedData.clusters); // 여기서 응답을 보냄
        } catch (err) {
            console.error('이미지 가져오기 오류:', err);
            return res.status(500).send('이미지 가져오기 오류'); // 오류 발생 시 응답
        }
    });
});




module.exports = router;