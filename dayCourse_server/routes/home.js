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
    console.log('home');
    const { startDate } = req.query;
    const userId = req.user.userId;


    // Check if required parameters are provided
    if (!startDate) {
        return res.status(400).json({ error: 'userId and startDate are required' });
    }

    // const sql = `
    //   SELECT Plan.planId, Plan.startDate, Plan.planName, Plan.groupId
    //   FROM Plan_User
    //   JOIN Plan ON Plan_User.planId = Plan.planId
    //   WHERE Plan_User.userId = ?
    //   AND Plan.startDate BETWEEN DATE_FORMAT(?, '%Y-%m-01') AND LAST_DAY(?)
    // `;

    console.log("기준날짜 :", startDate)

    // const sql = `
    //   SELECT Plan.planId, Plan.startDate, Plan.planName, Plan.groupId
    //   FROM Plan_User
    //   JOIN Plan ON Plan_User.planId = Plan.planId
    //   WHERE Plan_User.userId = ?
    //   AND Plan.startDate BETWEEN DATE_SUB(?, INTERVAL 1 MONTH) AND DATE_ADD(?, INTERVAL 1 MONTH)
    // `;

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

            res.status(201).json(result_location);
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

// 이미지 등록 엔드포인트
router.post('/plan/:planId/images', upload.single('image'), async (req, res) => {
    try {
        console.log("사진등록");
        const planId = req.params.planId;

        if (!req.file) {
            return res.status(400).send('파일이 없습니다');
        }

        const file = req.file;
        const imgNAME = path.basename(file.originalname);

        // S3에서 객체 업로드 파라미터 설정
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

        if (isImage) {
            // 이미지 분석을 위한 요청
            const form = new FormData();
            form.append('file', file.buffer, { filename: file.originalname });

            const response = await axios.post('http://13.124.135.96:5000/analyze', form, {
                headers: {
                    ...form.getHeaders(),
                },
            });

            const tags = response.data.Tags;

            // 태그 메타데이터 추가
            tags.forEach((tag, index) => {
                uploadParams.Metadata[`tag${index + 1}`] = tag.name; // 태그 이름 추가
            });

            console.log(uploadParams);
        }

        // S3 업로드
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                console.log("Error", err);
                return res.status(500).send('S3 업로드 중 오류 발생');
            }
            if (data) {
                console.log("Upload Success", data.Location);
                return res.json({ msg: "성공", location: data.Location });
            }
        });

        // 여기에 return 문을 추가하지 않도록 주의하세요.
    } catch (err) {
        console.error('Error retrieving images', err);
        res.status(500).send('Error retrieving images');
    }
});




router.get('/plan/moment', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;

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

        // 결과가 비어 있지 않은지 확인
        if (result.length === 0) {
            return res.status(404).send('플랜이 없습니다');
        }

        const planId = result[0].planId; // 가장 최근의 플랜을 가져옵니다
        const params = { Bucket: bucketName, Prefix: `plans/${planId}/` };

        try {
            // S3에서 객체 목록 가져오기
            const data = await s3.listObjectsV2(params).promise();

            if (!data.Contents || data.Contents.length === 0) {
                return res.status(404).send('이미지가 없습니다');
            }

            const imagesData = [];

            // 각 항목에 대한 메타데이터 가져오기
            for (const item of data.Contents) {
                const imageUrl = `https://${bucketName}.s3.amazonaws.com/${item.Key}`;

                // 객체의 메타데이터 가져오기
                const metadata = await s3.headObject({ Bucket: bucketName, Key: item.Key }).promise();

                // 메타데이터 태그값만 남기기
                const newMetadata = Object.values(metadata.Metadata);

                // URL과 메타데이터를 배열에 저장
                imagesData.push({
                    url: imageUrl,
                    metadata: newMetadata
                });
            }

            // Axios 요청을 위한 폼 데이터 준비
            const form = new FormData();
            form.append('metadata', JSON.stringify(imagesData));

            // 이미지 데이터를 분석 서비스로 전송
            const response = await axios.post('http://13.124.135.96:5001/tt', form, {
                headers: {
                    'Accept': 'application/json',
                    ...form.getHeaders() // FormData의 헤더 추가
                },
            });

            console.log(response.data);
            const limitedResponseData = response.data.slice(0, 3);

            // 이미지 URL과 메타데이터를 응답으로 전송
            res.json(limitedResponseData);
        } catch (err) {
            console.error('이미지 가져오기 오류:', err);
            res.status(500).send('이미지 가져오기 오류');
        }
    });
});





module.exports = router;