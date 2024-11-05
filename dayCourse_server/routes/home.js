const express = require('express');
const router = express.Router();
const db = require('../db')
const axios = require('axios');

const authenticateJWT = require('../config/authenticateJWT');

const APP_KEY = process.env.TMAP_APP_KEY;


router.get('/', authenticateJWT, async (req, res) => {
    console.log('home');
    const { startDate } = req.query;
    const userId = req.user.userId;


    // Check if required parameters are provided
    if (!startDate) {
        return res.status(400).json({ error: 'userId and startDate are required' });
    }

    const sql = `
      SELECT Plan.planId, Plan.startDate, Plan.planName, Plan.groupId
      FROM Plan_User
      JOIN Plan ON Plan_User.planId = Plan.planId
      WHERE Plan_User.userId = ?
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
    console.log(req.body)
    console.log('userId check: ' + userId);

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

    // const values = [userId, dateKey, dateKey, newplanName, town, groupId];

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

            // Successful insertion response
        });

        console.log(values)
        return res.status(201).json({ msg: 'success', planId: result.insertId });
    });
});


router.get('/plans/recent', authenticateJWT, async (req, res) => {
    console.log('home/plans/recent');
    const userId = req.user.userId;

    // Check if required parameters are provided
    // if (!userId) {
    //     return res.status(400).json({ error: 'userId are required' });
    // }


    const sql = `
      SELECT Plan.planId, Plan.startDate, Plan.planName, Plan.groupId
      FROM Plan_User
      JOIN Plan ON Plan_User.planId = Plan.planId
      WHERE Plan_User.userId = ? AND Plan.startDate <= NOW()
      ORDER BY Plan.startDate DESC 
      LIMIT 3
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
    console.log(req.body)

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
    // SQL INSERT 쿼리
    console.log('place get')
    const { planId } = req.body;

    const sql = `
      SELECT Plan.town
      FROM Plan
      WHERE Plan.planId = ?;
      `

    const sql_location = `
      SELECT Plan_Location.memo, Plan_Location.l_priority, Plan_Location.place, Plan_Location.placeId, Plan_Location.place_name, Plan_Location.version
      FROM Plan_Location
      WHERE Plan_Location.planId = ?;
      `

    const values = [planId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        db.query(sql_location, values, (err, result_location) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            console.log("place get :" + JSON.stringify(result_location));

            res.status(201).json( result_location );
        });
    });
});


router.delete('/plan/place', authenticateJWT, (req, res) => {
    console.log('place delete');
    const { placeId } = req.query;
    console.log(req.body);
    console.log(req.query);

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

    console.log('일정삭제')
    console.log(req.body)

    // Check if required parameters are provided
    if (!planId) {
        return res.status(400).json({ error: 'userId or planId are required' });
    }

    const sql_pu = `
      DELETE FROM Plan_User 
      WHERE planId = ? AND userId = ?;
      `;

    const sql = `
      DELETE FROM Plan 
      WHERE planId = ? AND start_userId = ?;
    `;

    const values = [planId, userId];

    db.query(sql_pu, values, (err, result_pu) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }



        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            // Successful insertion response
        });


        return res.status(200).json({ msg: 'success' });
    });
});


router.post('/plan/addPlace', authenticateJWT, async (req, res) => {
    const { planId, memo, place } = req.body;
    const userId = req.user.userId;

    console.log("일정장소추가")
    //console.log(place)

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



router.post('/plan/recommend_place', authenticateJWT, async (req, res) => {
    const { planId, memo, place } = req.body;
    const userId = req.user.userId;

    console.log('장소추천요청')
    console.log(req.body)

    const values = ['갈라파꼬치']

    return res.status(200).json({ msg: 'success', recommend: values });



});

router.post('/plan/place/priority', async (req, res) => {
    const { placeId, priority, version } = req.body;

    console.log('장소순서변경 :' + version)
    console.log(req.body)

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

    console.log(values)

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

        console.log(result)
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

        const origins = places.slice(0, -1)
        const destinations = places.slice(1)

        console.log('origins:', JSON.stringify(origins, null, 2));
        console.log('destinations:', JSON.stringify(destinations, null, 2));
        
        const data = {
            "origins": origins,
            "destinations": destinations,
            "transportMode": "pedestrian"
          };          
        // 요청 초과 예외처리용
        const response = null;
        // const response = await axios.post('https://apis.openapi.sk.com/tmap/matrix?version=1', 
        //     data, {
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json',
        //         'appKey': APP_KEY
        //       }
        //     });

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

// 쿼리문과 planId로 DB에서 주소를 가져옴
const getAddrNameId = (sql, values) => {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// 시작점과 도착점 임의로 줄 때, 인덱스번호 체킹
function checkIdx(idx, size) {
    if (idx < size) {
        return idx;
    }

    return idx - size;
}

// planId로 Locations 테이블에 접근하여 LocationID 리스트 반환
function getLocationIdsByPlanId(planId) {
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

// 카테고리 파악
function getCategoryStats(planId) {
    // getLocationIdsByPlnaId는 비동기 작업이므로 해당 작업이 끝난 후 카테고리를 찾는 작업을 진행할 수 있음 => then 체인으로 연결하여 진행
    return getLocationIdsByPlanId(planId).then(locationIds => {
        const findCategory = `
            SELECT Locations.category
            FROM Locations
            WHERE Locations.LocationID = ?
        `;

        let category = [0, 0, 0];

        const queries = locationIds.map((locationId) => {
            return new Promise((resolve, reject) => {
                db.query(findCategory, [locationId], (err, category_result) => {
                    if (err) return reject(err);
                    if (category_result.length === 0) return reject(new Error("Category not found for LocationID"));

                    const categoryType = category_result[0].category;

                    if (categoryType === "restaurant") category[0]++;
                    else if (categoryType === "cafe") category[1]++;
                    else category[2]++;

                    resolve();
                });
            });
        });

        return Promise.all(queries)
                      .then(() => category);
                      .catch((err) => reject(err));
    });
}

// 음식점 locationId 수집
function getRestaurantLocations(planId) {
    return getLocationIdsByPlanId(planId).then(locationIds => {
        const findCategory = `
            SELECT Locations.category
            FROM Locations
            WHERE Locations.LocationID = ?
        `;

        let restaurants = [];

        const queries = locationIds.map((locationId) => {
            return new Promise((resolve, reject) => {
                db.query(findCategory, [locationId], (err, category_result) => {
                    if (err) return reject(err);
                    if (category_result.length === 0) return reject(new Error("Category not found for LocationID"));

                    const categoryType = category_result[0].category;

                    if (categoryType === "restaurant") {
                        restaurants.push(locationId);
                    }
                    resolve();
                });
            });
        });

        return Promise.all(queries)
                      .then(() => restaurants);
                      .catch((err) => reject(err));
    });
}

// 카페 키워드 파악
function getCafeStats (planId) {
    return getLocationIdsByPlanId(planId).then(locationIds => {
        const findKeyword = `
            SELECT Locations.keyword
            FROM Locations
            WHERE Locations.LocationID = ?
        `;
        // coffee, desert, bakery, mood, study, pet 순
        let keywords = [0, 0, 0, 0, 0, 0];

        const queries = locationIds.map((locationId) => {
            return new Promise((resolve, reject) => {
                db.query(findKeyword, [locationId], (err, keyword_result) => {
                    if (err) return reject(err);
                    if (keyword_result.length === 0) return reject(new Error("Keyword not found for LocationID"));

                    const keywordType = keyword_result[0].keyword;

                    if (keywordType === "coffee") keywords[0]++;
                    else if (keywordType === "dessert") keywords[1]++;
                    else if (keywordType === "bakery") keywords[2]++;
                    else if (keywordType === "mood") keywords[3]++;
                    else if (keywordType === "study") keywords[4]++;
                    else keywords[5]++;

                    resolve();
                });
            });
        });

        return Promise.all(queries)
                      .then(() => keywords);
                      .catch((err) => reject(err));
    });
}

// cafe 내 같은 keyword를 가진 locationId 집합 반환
function getCafeLocations(planId) {
    return getLocationIdsByPlanId(planId).then(locationIds => {
        const findKeyword = `
            SELECT Locations.keyword
            FROM Locations
            WHERE Locations.LocationID = ?
        `;

        let cafes = [[], [], [], [], [], []];

        const queries = locationIds.map((locationId) => {
            return new Promise((resolve, reject) => {
                db.query(findKeyword, [locationId], (err, keyword_result) => {
                    if (err) return reject(err);
                    if (keyword_result.length === 0) return reject(new Error("Keyword not found for LocationID"));

                    const keywordType = keyword_result[0].keyword;
                    
                    if (keywordType === "coffee") {
                        cafes[0].push(locationId);
                    } else if (keywordType === "dessert") {
                        cafes[1].push(locationId);
                    } else if (keywordType === "bakery") {
                        cafes[2].push(locationId);
                    }else if (keywordType === "mood") {
                        cafes[3].push(locationId);
                    }else if (keywordType === "study") {
                        cafes[4].push(locationId);
                    } else {
                        cafes[5].push(locationId);
                    }
                    resolve();
                });
            });
        });

        return Promise.all(queries)
                      .then(() => cafes);
                      .catch((err) => reject(err));
    });
}

// 중복없는 숫자뽑기
function getRandomNum(min, max) {
    // min~max 숫자 배열 생성
    const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    // Fisher-Yates Shuffle 알고리즘 활용, numbers 숫자 무작위로 섞기
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]]; // Swap
    }

    // 섞인 배열에서 하나씩 뽑아 반환할 함수
    return function() {
        if (numbers.length === 0) {
            throw new Error("더 이상 선택할 숫자가 없습니다.");
        }
        return numbers.pop();
    };
}

router.post('/plan/recommend_routes', authenticateJWT, async (req, res) => {
    console.log("루트 추천");
    const { planId, recommendCnt } = req.body;

    if (!planId || !recommendCnt) {
        return res.status(400).json({ error: 'planId or recommendCnt are required' });
    }

    const findAddrName = `
      SELECT Plan_Location.place, Plan_Location.place_name, Plan_Location.locationId
      FROM Plan_Location
      WHERE Plan_Location.planId = ?
      ORDER BY Plan_Location.l_priority ASC;
    `;

    try {
        // Plan_Location에서 planId를 기준으로 사용자가 선택한 순서대로 주소 값 받아옴
        const places = await getAddrNameId(findAddrName, [planId]);

        if (places.length === 0) {
            return res.json({ result: 'failure', message: 'Invalid planId' });
        }

        const size = places.length;

        // 출발지, 도착지 인덱스 번호 임의로 지정
        let firstPlace = checkIdx(size - 1 + recommendCnt, size);
        let lastPlace = checkIdx(0 + recommendCnt, size);

        if (size <= 2) 
            return res.json([places[firstPlace], places[lastPlace]]);
        
        let findCategory = getCategoryStats (planId);
        let restaurants = [];
        if (findCategory[0] >= 2) {
            restaurants = getRestaurantLocations(planId);
        }
        
        let cafeKeywords = [];
        let cafeLocations = [];
        if (categories[1] >= 2) {
            cafeKeywords = getCafeStats (planId);
            if (cafeKeywords.some(num => num >= 2)) {
                cafeLocations = getCafeLocations (planId);
            }
        }
        
        // 무작위 알고리즘과 경로 최적화 api를 더한 루트 추천
        // 겹쳐서 루트 추천해주면 안되는 것들 체킹 (음식점이 2곳 이상, 같은 키워드가 2개 이상인 카페)
        if findCategory[0] >= 2 {
            if cafeLocations.length != 0 {
                
            }
        }

    } catch (error) {
        console.error('오류 응답 데이터:', error.response?.data);
        res.status(500).send('API 요청에 실패했습니다.');
    }
});


module.exports = router;