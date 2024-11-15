const express = require('express');
const router = express.Router();
const db = require('../db')
const axios = require('axios');
const multer = require('multer'); // 1. multer 추가 (파일 업로드 처리)
const FormData = require('form-data');
const { analyzeImage } = require('./moment');

const fs = require('fs'); //파일 저장용
const path = require('path');
const sharp = require('sharp');
// const heicConvert = require('heic-convert');
const { v4: uuidv4 } = require('uuid');

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
        SELECT Plan.planId, Plan.startDate, Plan.planName, groupMembers.groupId, Plan.start_userId, Plan.town, Plan.town_code
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

router.get('/survey', authenticateJWT, async (req, res) => {
    console.log("서베이 작성 여부 확인");

    const userId = req.user.userId;
    const sql = `
      SELECT EXISTS (
        SELECT 1 
        FROM User_survey 
        WHERE userId = ?
      ) AS isExists;
    `;

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (result[0].isExists === 1) {
            return res.status(201).json({ dataPresence: true });
        }
        return res.status(201).json({ dataPresence: false });
    });

});

router.post('/survey', authenticateJWT, async (req, res) => {
    console.log("서베이 저장");

    const userId = req.user.userId;
    const { interest1, interest2, interest3, interest4, interest5 } = req.body;

    const sql = `
      INSERT INTO User_survey (userId, UserInterest1, UserInterest2, UserInterest3, UserInterest4, UserInterest5)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const userInterest1 = interest1 || null;
    const userInterest2 = interest2 || null;
    const userInterest3 = interest3 || null;
    const userInterest4 = interest4 || null;
    const userInterest5 = interest5 || null;

    const values = [userId, userInterest1, userInterest2, userInterest3, userInterest4, userInterest5]

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        return res.status(201).json({ msg: 'success' });
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

    const sql_username = `
      SELECT userName
      FROM User
      WHERE userId = ?
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

        db.query(sql_username, userId, (err, result2) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            return res.status(200).json({ plans: formattedResult, userName: result2 });
        });
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
    console.log("req.body: ", req.body);
    const { schedule } = req.body;
    const userId = req.user.userId;

    console.log("schedule: ", schedule);

    const { planId, dateKey, endDate, planName, town, town_code } = schedule;
    console.log('계획 수정 planId :', planId)
    console.log('계획 수정 dateKey :', dateKey)

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
      SET planName = ?, startDate = ?, endDate = ?, town = ?, town_code = ?
      WHERE  planId = ? AND start_userId = ?;
    `;

    console.log("town_code: ", town_code);

    const values = [planName, dateKey, endDate_new, town, town_code, planId, userId];

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

    const sql_chat = `
      DELETE FROM Chat 
      WHERE planID = ?;
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
        await db.promise().query(sql_chat, [planId]);

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
    const { planId, memo, place, locationId } = req.body;
    const userId = req.user.userId;

    console.log("일정장소추가")
    console.log(locationId)
    console.log(place)

    const x = parseFloat(place.x);
    const y = parseFloat(place.y);

    // Check if required parameters are provided
    if (!planId) {
        return res.status(400).json({ error: 'userId or planId are required' });
    }

    const sql = `
        INSERT INTO Plan_Location (planId, l_priority, memo, place, place_name, coordinates, version, locationId)
        SELECT ?, IFNULL(MAX(l_priority), 0) + 1, ?, ?, ?, ST_GeomFromText('POINT(${x} ${y})'), ?, ?
        FROM Plan_Location
        WHERE planId = ?;
    `;

    const values = [planId, memo, place.address_name, place.place_name, 1, locationId, planId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        return res.status(200).json({ msg: 'success' });
    });
});



router.post('/plan/addRecommendedPlace', authenticateJWT, async (req, res) => {
    const { planId, memo, place_name, address_name, l_priority, x, y, locationId } = req.body;
    const userId = req.user.userId;

    console.log("일정장소추가/추천장소")
    console.log(x, y)


    const xx = parseFloat(x);
    const yy = parseFloat(y);
    console.log(xx, yy)

    // Check if required parameters are provided
    if (!planId) {
        return res.status(400).json({ error: 'userId or planId are required' });
    }

    const sql = `
        INSERT INTO Plan_Location (planId, l_priority, memo, place, place_name, coordinates, version, locationId)
        SELECT ?, IFNULL(MAX(l_priority), 0) + 1, ?, ?, ?, ST_GeomFromText('POINT(${xx} ${yy})'), ?, ?
        FROM Plan_Location
        WHERE planId = ?;
    `;

    const values = [planId, memo, address_name, place_name, 1, locationId, planId];

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



const getPlaces = (sql, values) => {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, results) => {
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

// planId로 Locations 테이블에 접근하여 LocationID 리스트 반환
function getLocationIdsByPlanId(planId) {
    console.log("getLocationIdsByPlanId 실행");
    return new Promise((resolve, reject) => {
        const findLocationId = `
            SELECT Plan_Location.LocationID
            FROM Plan_Location
            WHERE Plan_Location.planId = ?
            ORDER BY Plan_Location.l_priority ASC;
        `;

        db.query(findLocationId, [planId], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return reject(new Error("No locations found for the given planId"));

            // LocationID 목록만 추출
            const locationIds = results.map(result => result.LocationID);
            resolve(locationIds);
        });
    });
}

// planId로 Locations 테이블에 접근하여 장소 관련 정보들 모두 반환하는 함수
function getAllLocationsByPlanId(planId) {
    console.log("getAllLocationsByPlanId 실행");
    return getLocationIdsByPlanId(planId).then(locationIds => {
        const findLocationDetails = `
            SELECT Locations.LocationID, Locations.category, Locations.keyword, Plan_Location.place_name, Plan_Location.place, Plan_Location.placeId
            FROM Locations
            JOIN Plan_Location ON Locations.LocationID = Plan_Location.LocationID
            WHERE Locations.LocationID = ?
        `;

        console.log("planId", planId);
        console.log("locationIds", locationIds);

        const queries = locationIds
            .filter(locationId => locationId !== null) // LocationID가 null이 아닌 경우만 필터링
            .map(locationId => {
                return new Promise((resolve, reject) => {
                    db.query(findLocationDetails, [locationId], (err, results) => {
                        if (err) return reject(err);
                        if (results.length === 0) return reject(new Error("Location not found for LocationID"));
                        console.log(results[0].placeId);
                        resolve(results[0]);
                    });
                });
            });
        
        return Promise.all(queries);
    });
}

// 장소를 카테고리 별로 그룹화
function classifyLocations(locations) {
    console.log("classifyLocations 실행");
    const restaurants = [];
    const cafesByKeyword = {};
    const others = [];

    locations.forEach(location => {
        if (location.category === 'restaurant') {
            restaurants.push(location);
        } else if (location.category === 'cafe') {
            if (!cafesByKeyword[location.keyword]) {
                cafesByKeyword[location.keyword] = [];
            }
            cafesByKeyword[location.keyword].push(location);
        } else {
            others.push(location);
        }
    });
    console.log("restaurants: ", restaurants);
    console.log("cafesByKeyword: ", cafesByKeyword);
    console.log("others: ", others);
    return { restaurants, cafesByKeyword, others };
}

// 음식점과 같은 키워드의 카페들이 연속으로 루트 추천되지 않도록 재배치
async function arrangeLocations(restaurants, cafesByKeyword, others, planId) {
    console.log("arrangeLocations 실행");
    const result = [];
    let previousCategory = null;
    let previousKeyword = null;

    let allLocations = []
    let restaurantsCheck = false;
    let cafeKeywordsCheck = false;


    if (restaurants != null && cafesByKeyword != null && others != null) {
        // 모든 장소를 합친 배열 생성
        console.log("여기에 안 들어오면 망한거임");
        allLocations = [
            ...restaurants,
            ...Object.values(cafesByKeyword).flat(),
            ...others
        ];
        restaurantsCheck = restaurants.length >= 2;
        const cafeKeywordsCheckCnt = Object.keys(cafesByKeyword)
            .filter(keyword => cafesByKeyword[keyword].length >= 2);
        cafeKeywordsCheck = cafeKeywordsCheckCnt.length > 0;
    }

    if (planId > 0) {
        const findAllLocations = `
        SELECT Plan_Location.place, Plan_Location.place_name, Plan_Location.placeId
        FROM Plan_Location
        WHERE Plan_Location.planId = ?
        `

        // 비동기니까 꼭 promise 사용해서 진행해야함..
        const queryResults = await new Promise((resolve, reject) => {
            db.query(findAllLocations, [planId], (err, results) => {
                if (err) {
                    console.error("Error executing query:", err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        queryResults.forEach(result => {
            const isItInLocations = allLocations.some(location => location.placeId === result.placeId);
            if (!isItInLocations) {
                allLocations.push(result);
                console.log("allLocations 배열에 추가한 값: ", result);
            }
        });
    }

    let num = 0;

    // 장소 순서를 조건에 맞게 재배치
    while (allLocations.length > 0) {
        let candidates = allLocations.filter(location => {
            console.log(num + "번째");
            console.log("previousCategory: ",previousCategory);
            console.log("location.category: ",location.category);

            // 검색해서 카테고리를 모르는 경우엔 무조건 true로 return
            if (!location.category) {
                return true;
            }
            // 이전 장소가 음식점인 경우, 음식점 제외
            if (restaurantsCheck && location.category === previousCategory && location.category === 'restaurant') {
                console.log("이전 장소가 음식점인 경우, 음식점 제외");
                return false;
            }
            // 이전 장소가 동일 키워드의 카페인 경우 제외
            if (cafeKeywordsCheck && location.category === previousCategory && location.category === 'cafe' && location.keyword === previousKeyword) {
                console.log("이전 장소가 동일 키워드의 카페인 경우 제외");
                return false;
            }
            return true;
            
        });
        console.log("재배치 중 로케이션: ", candidates);

        // 후보가 없을 경우 조건을 완화하여 모든 장소를 후보로 설정
        if (candidates.length === 0) {
            candidates = allLocations;
            // console.log("후보지 로케이션 완화: ", candidates)
        }

        // 무작위로 장소 선택
        const randomIndex = Math.floor(Math.random() * candidates.length);
        const nextLocation = candidates[randomIndex];

        // 결과에 추가
        result.push(nextLocation);
        // console.log("결과값에 추가된 장소들: ", result)

        // 선택된 장소를 전체 목록에서 제거
        allLocations.splice(allLocations.indexOf(nextLocation), 1);

        // 이전 카테고리와 키워드 업데이트
        previousCategory = nextLocation.category;
        previousKeyword = nextLocation.keyword;
        num++;
    }

    return result;
}

router.post('/plan/recommend_routes', authenticateJWT, async (req, res) => {
    console.log("루트 추천");
    const { planId, version } = req.body;

    if (!planId || !version) {
        return res.status(400).json({ error: 'planId, version are required' });
    }

    try {
        // Plan_Location에서 planId를 기준으로 사용자가 선택한 순서대로 주소 값 받아옴
        const locations = await getAllLocationsByPlanId(planId);
        
        console.log("locations: ", locations);
        console.log("locations length: ", locations.length);

        let arrangedLocations = []

        if (locations.length != 0) {
            const { restaurants, cafesByKeyword, others } = classifyLocations(locations);
            arrangedLocations = await arrangeLocations(restaurants, cafesByKeyword, others, planId);

        } else {
            arrangedLocations = await arrangeLocations(null, null, null, planId);
        }


        // const startLocation = arrangedLocations[0];
        // const endLocation = arrangedLocations[arrangedLocations.length - 1];
        // const waypoints = arrangedLocations.slice(1, -1);


        // priority 업데이트
        const setLocationPriority = `
            UPDATE Plan_Location
            SET l_priority = ?, version = ?
            WHERE placeId = ?;
        `;

        for (let i = 0; i < arrangedLocations.length; i++) {
            let placeId = arrangedLocations[i].placeId;
            let values = [i + 1, (version + 1), placeId];

            db.query(setLocationPriority, values, (err, result) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                console.log("priority update success, count: ", i + 1);
            });
        }

        // 최종 결과 반환
        res.json({
            result: 'success',
            locationInfo: arrangedLocations.map(location => ({
                placeId: location.placeId,
                placeName: location.place_name,
                placeAddr: location.place
            }))
        });

    } catch (error) {
        console.error('오류:', error);
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
        case '디저트': return 'dessert';
        case '감성카페': return 'mood';
        case '스터디카페': return 'study';
        case '베이커리': return 'bakery';
        case '애견카페': return 'pet';

        // 액티비티 관련
        case '공방': return 'studio';
        case '서점': return 'book_store';
        case '방탈출': return 'escape_room';
        case '만화카페': return 'cartoonCafe';
        case '영화관': return 'cinema';
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
        case '랜덤': return 'random';
        case '음식점': return 'restaurant';
        case '카페': return 'cafe';
        case '문화생활': return 'activities';

        // 기본 값
        default: return 'random';
    }
}


function translateCategory2(Category) {
    switch (Category) {
        case 'restaurant': return '음식점';
        case 'cafe': return '카페';
        case 'activities': return '문화생활';

        // 기본 값
        default: return '미분류';
    }
}

function translateKeyword2(Keyword) {
    switch (Keyword) {
        // 음식 관련
        case 'random': return '랜덤';
        case 'korean': return '한식';
        case 'chinese': return '중식';
        case 'japanese': return '일식';
        case 'western': return '양식';
        case 'asian': return '아시안';

        // 카페 관련
        case 'coffee': return '로스팅';
        case 'dessert': return '디저트';
        case 'mood': return '감성카페';
        case 'study': return '스터디카페';
        case 'bakery': return '베이커리';
        case 'pet': return '애견카페';

        // 액티비티 관련
        case 'studio': return '공방';
        case 'book_store': return '서점';
        case 'escape_room': return '방탈출';
        case 'cartoonCafe': return '만화카페';
        case 'cinema': return '영화관';
        case 'park': return '공원';
        case 'shopping': return '쇼핑몰';
        //case '전시회': return 'Exhibition';

        // 기본 값
        default: return '랜덤';
    }
}

async function SpotSuggest(locations, Cate, key){

    if (locations.length > 0) {
        //console.log("보내는값", locations)
        let text = ""

        if (key !== "random") {
            text = "k"
        } else {
            text = "c"
            if (Cate === "random") {
                text = "a"
            }
        }

        const response = await axios.post('http://13.124.135.96:5000/SpotSuggest', { locations: locations, text: text }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        // console.log("응답1 : ", response.data)
        const renamedUsers = response.data.map(row => ({
            id: row.LocationID,
            place_name: row.LocationName,
            address_name: row.addressFull,
            x: parseFloat(row.longitude),
            y: parseFloat(row.latitude),
			l_priority: 1,
            keyword: row.keyword,
			category: row.category,
            road_address_name: "12345", // 임시값
            phone: "01000000000" //필드없음
        }));

        const slicedArr = renamedUsers.slice(0, 10);

        //console.log("응답2 : ", slicedArr)

        return slicedArr
    } else {

        console.log("기존문구 시작");
        const sql_category = `
            SELECT *
            FROM Locations
            WHERE category = ?
            LIMIT 10;
        `;

        const sql_keyword = `
			SELECT *
			FROM Locations
            WHERE keyword = ?
            LIMIT 10;
        `;

        const sql_all = `
			SELECT *
			FROM Locations
            LIMIT 10;
        `;

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
            x: parseFloat(row.longitude),
            y: parseFloat(row.latitude),
			l_priority: 1,
            keyword: row.keyword,
			category: row.category,
            road_address_name: "12345", // 임시값
            phone: "01000000000" //필드없음
        }));

        //console.log(renamedUsers);
        return renamedUsers
    }

}


router.get('/plan/fullCourse', authenticateJWT, async (req, res) => {
    console.log("완전랜덤추천");
    const userId = req.user.userId;
    const l_num = 5;

    const sql_plan = `
        SELECT Plan.planId
        FROM groupMembers
        JOIN Plan ON groupMembers.groupId = Plan.groupId
        WHERE groupMembers.userId = ?
        ORDER BY Plan.startDate DESC
    `;

    const sql_plan_location = `
        SELECT place, place_name
        FROM Plan_Location 
        WHERE planId IN (?);
    `;

    const sql_locations_restaurant = `
        SELECT Locations.*
        FROM Locations
        WHERE LocationName = ? AND addressFull = ? AND category = 'restaurant'
        LIMIT 10;
    `;

    const sql_locations_cafe = `
        SELECT Locations.*
		FROM Locations
        WHERE LocationName = ? AND addressFull = ? AND category = 'cafe'
        LIMIT 10;
   `;

    const sql_locations_a = `
        SELECT Locations.*
        FROM Locations
        WHERE LocationName = ? AND addressFull = ? AND category = 'activities'
        LIMIT 10;
    `;

    const [plans] = await db.promise().query(sql_plan, [userId]);
    const planIds = plans.map(plan => plan.planId);
    const [plan_locations] = await db.promise().query(sql_plan_location, [planIds]);

    const locationsPromises = plan_locations.map(async (planLocation) => {
        try {
            const [result] = await db.promise().query(sql_locations_a, [planLocation.place_name, planLocation.place]);
            if (result.length > 0) {
                return result;
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    });

    let locations = await Promise.all(locationsPromises)
        .then((results) => {
            // 결과 배열에서 undefined 값을 제거
            const filteredResults = results.filter(location => location !== undefined);
            return filteredResults
        })
        .catch(error => {
            console.error("Error in processing locations:", error);
        });

    const restaurantPromises = plan_locations.map(async (planLocation) => {
        try {
            const [result] = await db.promise().query(sql_locations_restaurant, [planLocation.place_name, planLocation.place]);
            if (result.length > 0) {
               return result;
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    });
    
    let restaurantss = await Promise.all(restaurantPromises)
        .then((results) => {
            const filteredResults = results.filter(location => location !== undefined);
            return filteredResults
        })
        .catch(error => {
           console.error("Error in processing locations:", error);
        });

    const cafePromises = plan_locations.map(async (planLocation) => {
        try {
            const [result] = await db.promise().query(sql_locations_cafe, [planLocation.place_name, planLocation.place]);
            if (result.length > 0) {
                return result;
                }
            } catch (error) {
                console.error("Error fetching locations:", error);
            }
        });
        
    let cafes = await Promise.all(cafePromises)
        .then((results) => {
            const filteredResults = results.filter(location => location !== undefined);
            return filteredResults
        })
        .catch(error => {
            console.error("Error in processing locations:", error);
        });

    locations = locations.flat();
    restaurantss = restaurantss.flat();
    cafes = cafes.flat();

    const promise1 = SpotSuggest(locations, "activities", "random").catch(error => ({ error }));
    const promise2 = SpotSuggest(restaurantss, "restaurant", "random").catch(error => ({ error }));
    const promise3 = SpotSuggest(cafes, "cate", "random").catch(error => ({ error }));
        
    // 모든 Promise가 완료될 때까지 기다림
    const [place_1, place_2, place_3] = await Promise.all([promise1, promise2, promise3]);

    let newArr = []

    //야외 하나
    let randomIndex = Math.floor(Math.random() * place_1.length); // 랜덤 인덱스 생성
    newArr.push(place_1[randomIndex]);
    place_1.splice(randomIndex, 1);

    //식당 두개
    randomIndex = Math.floor(Math.random() * place_2.length);
    newArr.push(place_2[randomIndex]);
    place_2.splice(randomIndex, 1);

    randomIndex = Math.floor(Math.random() * place_2.length);
    newArr.push(place_2[randomIndex]);

    //카페 하나
    randomIndex = Math.floor(Math.random() * place_3.length);
    newArr.push(place_3[randomIndex]);
    place_3.splice(randomIndex, 1);

    // 활동이랑 카페 합쳐서 하나 뽑음
    let tempArr = []
    tempArr = [...place_1, ...place_3];

    randomIndex = Math.floor(Math.random() * tempArr.length); // 랜덤 인덱스 생성
    newArr.push(tempArr[randomIndex]); // 랜덤으로 선택된 값 추가

	//console.log(newArr)

    // 장소 분류
    const { restaurants, cafesByKeyword, others } = classifyLocations(newArr);

    // 장소 재배치
    const arrangedLocations = await arrangeLocations(restaurants, cafesByKeyword, others, -1);

	for (let i = 0; i < arrangedLocations.length; i++) {
		arrangedLocations[i].l_priority = i + 1
	}

    const locationInfos = arrangedLocations.map(location => ({
        ...location,
        placeName: location.place_name,
        placeAddr: location.address_name,
        category: translateCategory2(location.category),
        keyword: translateKeyword2(location.keyword),
    }))

    console.log(locationInfos)

    // 최종 결과 반환
    return res.status(200).json({
        result: 'success',
        locationInfo: locationInfos
    });
});

router.post('/plan/:enCategory/:enKeyword?', authenticateJWT, async (req, res) => {
    console.log("카테고리조회");
    const userId = req.user.userId;
    const { enCategory, enKeyword } = req.params;

	let key = "random";

	if (enKeyword){
		key = translateKeyword(enKeyword);
	}

	let Cate = translateCategory(enCategory)

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
    `;
    const [plan_locations] = await db.promise().query(sql_plan_location, [planIds]);

    const locationsPromises = plan_locations.map(async (planLocation) => {
        try {
            const sql_locations_c = `
                SELECT Locations.*
                FROM Locations
                WHERE LocationName = ? AND addressFull = ? AND category = ?
                LIMIT 1;
            `;

            const sql_locations_k = `
                SELECT Locations.*
                FROM Locations
                WHERE LocationName = ? AND addressFull = ? AND keyword = ?
                LIMIT 1;
            `;

            const sql_locations_a = `
                SELECT Locations.*
                FROM Locations
                WHERE LocationName = ? AND addressFull = ?
                LIMIT 1;
            `;

            let locations = []

            if (key !== "random") {
                const [result] = await db.promise().query(sql_locations_k, [planLocation.place_name, planLocation.place, key]);
                locations = result;
            } else {
                let sql = sql_locations_c;
                if (Cate === "random") {
                    sql = sql_locations_a;
                    Cate = ""
                }
                const [result] = await db.promise().query(sql, [planLocation.place_name, planLocation.place, Cate]);
                locations = result;
            }

            if (locations.length > 0) {
                return locations;
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    });

    let locations = await Promise.all(locationsPromises)
        .then((results) => {
            // 결과 배열에서 undefined 값을 제거
            const filteredResults = results.filter(location => location !== undefined);
            return filteredResults
        })
        .catch(error => {
            console.error("Error in processing locations:", error);
        });

    locations = locations.flat();

    // console.log(locations)
    console.log("확인", key, Cate)

    const places = await SpotSuggest(locations, Cate, key)

    res.status(200).json({ msg: 'success', place: places });

    
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

router.post('/plan/upload/:planId/images', upload.array('image'), authenticateJWT, async (req, res) => {
    console.log("사진 등록");
    const userId = req.user.userId;

    const promises = [];

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
            const fileExtension = path.extname(file.originalname);
			let imgNAME = `${uuidv4()}${fileExtension}`;
            let type = file.mimetype

			//console.log("이름: ", imgNAME)

            // // 이미지 파일 확장자 확인
            const ext = path.extname(file.originalname).toLowerCase();
            if (ext === '.heic') {
                imgNAME = imgNAME.replace(/\.heic$/i, '.jpg');  // 파일 이름 확장자 변경
                // buffer = fs.readFileSync(inputFilePath);  // HEIC -> JPG 변환
                type = 'image/jpeg';  // MIME 타입 변경
            }

			const outputBuffer = await sharp(file.buffer)
				.resize(800) // 너비 800px로 조정
				.jpeg({ quality: 50 }) // JPEG 품질 80%로 압축
				.toBuffer();

            // S3 업로드 파라미터 설정
            const uploadParams = {
                Bucket: bucketName,
                Key: `plans/${planId}/${imgNAME}`,
                Body: outputBuffer,
                ContentType: type,
                Metadata: {}
            };


            //console.log(uploadParams)

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
			uploadResults.push({ name: imgNAME, type: ext, location: data.Location, retries: 0 });
        }

        // 업로드 결과를 클라이언트에 먼저 반환
        res.json({mag: "성공"});

        // const fileQueue = [...req.files];
        const fileQueue = uploadResults
        const allowedImageExtensions = ['.jpg', '.jpeg', '.png'];

		//console.log(uploadResults)

        // 비동기 사진 분석 요청 (백그라운드 작업)
        while (fileQueue.length > 0) {
            // const file = fileQueue.shift();
			
            const { name, type, location, retries } = fileQueue.shift();
            const imgNAME = name;
            const ext2 = type;
            const s3ImageUrl = location;
			const isImage = allowedImageExtensions.includes(ext2);

            if (!isImage) {
                continue;
            }

            console.log("이미지 분석 :", s3ImageUrl)

            // 비동기 처리 내부 함수 정의
            const promise = (async () => {
                try {
                    // 이미지 분석 요청
                    const form = new FormData();
                    form.append('imageUrl', s3ImageUrl);

                    const response = await axios.post('http://13.124.135.96:5000/analyze', form, {
                        headers: {
                            ...form.getHeaders(),
                        },
                    });

                    


                    // S3 메타데이터 업데이트를 위한 파라미터 설정
                    const uploadParams = {
                        Bucket: bucketName,
                        Key: `plans/${planId}/${imgNAME}`,
                        Metadata: {}
                    };

                    // 태그 메타데이터 추가
                    const tags = response.data.Tags;
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
                    console.error('이미지 분석 중 오류 발생:', imgNAME);
                    if (retries < 3) {
                        console.error(`${imgNAME} 파일 분석 실패. 재시도.`);
                        fileQueue.push({ name: name, type: type, location: location, retries: retries+1 });
                    } else {
                        console.error(`${imgNAME} 파일의 최대 재시도 횟수 초과`);
                    }
                }
            })();

            promises.push(promise);
        }

        await Promise.all(promises);
        analyzeImage(userId);

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
          SELECT moment_name, imgURL, planID , planName
          FROM moment
          WHERE userID = ?
        `;

    db.query(sql, [userId], async (err, result) => {
        if (err) {
            console.error('데이터 가져오기 오류:', err);
            return res.status(500).json({ error: '데이터베이스 오류' });
        }

        const formattedResults = {};

        // 입력 배열을 순회하면서 변환
        result.forEach(row => {
            // 각 moment_name에 해당하는 배열을 초기화하거나 기존 배열에 푸시
            if (!formattedResults[row.moment_name]) {
                formattedResults[row.moment_name] = [];
            }
            formattedResults[row.moment_name].push({
                imgURL: row.imgURL,
                planID: row.planID,
                planName: row.planName
            });
        });

        // console.log("모먼트")
        // console.log(formattedResults)

        return res.status(200).json(formattedResults);

    });
});

router.get('/stores-within', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;
    console.log("지역 추천 시작");

    try {
      // x, y 및 반경을 쿼리 파라미터로 받습니다.
      const { x, y, radius } = req.query;
  
      if (!x || !y || !radius) {
        return res.status(400).json({ error: 'x, y, and radius are required parameters' });
      }
  
      const longitude = parseFloat(x); // 경도
      const latitude = parseFloat(y);  // 위도
      const distanceInMeters = parseFloat(radius);
  
      // 공간 쿼리 실행
      const [rows] = await db.promise().query (
        `
        SELECT 상권번호, 상권명, ST_X(ST_Centroid(coordinates)) AS centroid_x, ST_Y(ST_Centroid(coordinates)) AS centroid_y
        FROM store_zone
        WHERE ST_Intersects(
          ST_Buffer(
            ST_GeomFromText('POINT(? ?)'),
            ? / 111320  -- 경도와 위도를 미터로 변환
          ),
          coordinates
        )
        `,
        [longitude, latitude, distanceInMeters]  // 쿼리 파라미터 순서
      );

      // console.log("rows 체크: ", rows);
  
      // 결과 반환
      res.status(200).json({ stores: rows });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


module.exports = router;