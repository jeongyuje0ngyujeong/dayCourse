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

//메모리 스토리지 설정 (파일을 메모리에 저장)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // 메모리 기반 저장소 사용

router.get('/', authenticateJWT, async (req, res) => {
    const { startDate } = req.query;
    const userId = req.user.userId;
    console.log('home 일정 가져옴 :', startDate);

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

        // 날짜시간 한국식 변환 >> KST (UTC + 9)
        const formattedResult = result.map(plan => {
            const utcDate = new Date(plan.startDate); //original UTC date
            const koreaTime = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // Convert to KST
            const formattedStartDate = koreaTime.toISOString().split('T')[0]; // Extract YYYY-MM-DD

            const { startDate, ...rest } = plan;

            return {
                ...rest,
                dateKey: formattedStartDate
            };
        });

        return res.status(200).json(formattedResult);
    });
});

router.post('/plan', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;
    const { dateKey, startDateTime, planName, town, groupId } = req.body;

    console.log('일정등록요청 user: ', userId, "dateKey :", dateKey, "groupId :", groupId)

    if (!dateKey) {
        return res.status(400).json({ error: 'dateKey 가 없습니다.' });
    }

    let newplanName = planName

    if (!planName) {
        newplanName = dateKey
    }

    const sql = `
      INSERT INTO Plan (start_userId, startDate, endDate, planName, town, groupId)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

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

        // 날짜시간 한국식 변환 >> KST (UTC + 9)
        const formattedResult = result.map(plan => {
            const utcDate = new Date(plan.startDate); // original UTC date
            const koreaTime = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // Convert to KST
            const formattedStartDate = koreaTime.toISOString().split('T')[0]; // Extract YYYY-MM-DD

            const { startDate, ...rest } = plan;

            // 날짜 넘겨줌
            return {
                ...rest,
                dateKey: formattedStartDate
            };
        });

        res.status(200).json(formattedResult);
    });
});


router.post('/plan/town_update', authenticateJWT, async (req, res) => {
    const { destination, planId } = req.body;
    const userId = req.user.userId;
    console.log("지역 업데이트")

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
    console.log('계획 수정 planId :', planId)

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
      SELECT memo, l_priority, place, placeId, place_name, version, 
      ST_AsText(coordinates) as coordinates
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
    const { placeId } = req.query;
    console.log('일정 상세 장소 삭제 placeId :', placeId);

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

    console.log('일정 삭제 planId:', planId);

    // 필수 파라미터 확인
    if (!planId) {
        return res.status(400).json({ error: 'planId가 없습니다.' });
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



function translateKeyword(Keyword) {
    switch (Keyword) {
        // 음식 관련
        case '랜덤': return 'random';
        case '한식': return 'korean';
        case '중식': return 'chinese';
        case '일식': return 'japanese';
        case '양식': return 'western';
        case '아시안': return 'asian';

        // 카페 관련
        case '로스팅': return 'coffee';
        case '디저트': return 'desert';
        case '감성카페': return 'mood';
        case '카공': return 'study';
        case '베이커리': return 'bakery';
        case '애견카페': return 'pet';

        // 액티비티 관련
        case '공방': return 'studio';
        case '서점': return 'book_store';
        case '방탈출': return 'escape_room';
        case '만화카페': return 'cartoonCafe';
        //case '영화관': return 'Cinema';
        case '공원': return 'park';
        case '쇼핑몰': return 'shopping';
        //case '전시회': return 'Exhibition';

        // 기본 값
        default: return 'random';
    }
}

function translateCategory(Category) {
    switch (Category) {
        // 음식 관련
        case '랜덤': return 'Random';
        case '음식점': return 'restaurant';
        case '카페': return 'cafe';
        case '문화생활': return 'activities';

        // 기본 값
        default: return 'random';
    }
}


router.post('/plan/:enCategory/:enKeyword?', authenticateJWT, async (req, res) => {
    console.log("카테고리조회");
    const userId = req.user.userId;
    const { enCategory, enKeyword } = req.params;

    //여기에 기존.............과거..........방문기록....가져오기
    //가져와서 태그 모음?
    //핵심 태그 몇가지 뽑아둠.
    //일단은 2번 거칠거임. 1.모든 플랜의 장소 조회 > 2.일치하는 Location 찾기.

    const sql_plan = `
        SELECT Plan.planId
        FROM groupMembers
        JOIN Plan ON groupMembers.groupId = Plan.groupId
        WHERE groupMembers.userId = ?
        ORDER BY Plan.startDate DESC
    `;

    const [plans] = await db.promise().query(sql_plan, [userId]);
    const planIds = plans.map(plan => plan.planId);

    const sql_plan_location = `
        SELECT place, place_name
        FROM Plan_Location 
        WHERE planId IN (?);
    `
    const [plan_locations] = await db.promise().query(sql_plan_location, [planIds]);

    const locationsPromises = plan_locations.map(async (planLocation) => {
        try {
            const sql_locations = `
                SELECT Locations.*
                FROM Locations
                WHERE LocationName = ? AND addressFull = ?;
            `;

            const [locations] = await db.promise().query(sql_locations, [planLocation.place_name, planLocation.place]);
            if (locations.length > 0) {
                return locations;
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    });

    await Promise.all(locationsPromises);

    if (locationsPromises) {
        console.log(locationsPromises)
        return res.status(200).json({ msg: 'success' });
    } else {
        console.log("기존문구 시작");
        const sql_category = `
        SELECT addressFull, LocationName, LocationID, latitude, longitude
        FROM Locations
        WHERE category = ?
        LIMIT 10;
    `;

        const sql_keyword = `
        SELECT addressFull, LocationName, LocationID, latitude, longitude
        FROM Locations
        WHERE keyword = ?
        LIMIT 10;
    `;

        const sql_all = `
        SELECT addressFull, LocationName, LocationID, latitude, longitude
        FROM Locations
        LIMIT 10;
    `;

        let key = translateKeyword(enKeyword);
        let Cate = translateCategory(enCategory)

        let rows = [];

        if (key !== "random") {
            // 키워드가 있을 때
            //console.log("키워드 있음");

            //const [result] = db.query(sql_keyword, [key]);
            //console.log("쿼리 실행");
            const [result] = await db.promise().query(sql_keyword, [key]);
            rows = result;

        } else {
            // 키워드가 없을 때
            //console.log("키워드 없음");
            let sql = sql_category;

            if (Cate === "random") {
                sql = sql_all;
                Cate = ""
            }

            //console.log("쿼리 실행");
            const [result] = await db.promise().query(sql, [Cate]);
            rows = result;
        }

        // 필드 재명명하기
        const renamedUsers = rows.map(row => ({
            id: row.LocationID,
            place_name: row.LocationName,
            address_name: row.addressFull,
            x: row.longitude,
            y: row.latitude,
            road_address_name: "12345", // 임시값
            phone: "01000000000" //필드없음
        }));

        console.log(renamedUsers);
        return res.status(200).json({ msg: 'success', place: renamedUsers });
    }
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
            //console.log("전달");
            //console.log(imageUrls);
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

        // 업로드 결과를 클라이언트에 먼저 반환
        res.json(uploadResults);

        // 비동기 사진 분석 요청 (백그라운드 작업)
        for (const file of req.files) {
            const imgNAME = path.basename(file.originalname);
            const s3ImageUrl = uploadResults.find(result => result.location.endsWith(imgNAME)).location;

            // 비동기 처리 내부 함수 정의
            (async () => {
                try {
                    // 이미지 분석 요청
                    const form = new FormData();
                    form.append('imageUrl', s3ImageUrl);

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
            })();
        }

    } catch (err) {
        console.error('이미지 처리 중 오류 발생', err);
        // 오류가 발생한 경우 응답이 이미 전송되지 않았다면 에러를 반환
        if (!res.headersSent) {
            res.status(500).send('이미지 처리 중 오류 발생');
        }
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

        //console.log("조회한 일정 : ", result);
        if (result.length === 0) {
            return res.status(200).send('플랜이 없습니다'); // 플랜이 없는 경우
        }

        const planIds = result.map(plan => plan.planId);
        const imagesData = [];

        //console.log("S3 에서 가져올거임");

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