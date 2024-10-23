const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

//서버-클라이언트 연결 테스트
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 처리


const db = mysql.createConnection({
    host: '13.124.161.75',
    user: 'daycourse',
    password: 'Gowh241017*',
    database: 'daycourse'
});

// 데이터베이스 연결
db.connect(err => {
    if (err) {
        console.error('DB connection failed:', err);
        return;
    }
    console.log('DB connected');
});

//s3연결
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-2' });
const s3 = new AWS.S3();
const bucketName = 'daycourseimage';

//파일 저장용
//const fs = require('fs');
const path = require('path');

const multer = require('multer'); // 1. multer 추가 (파일 업로드 처리)
// 1. 메모리 스토리지 설정 (파일을 메모리에 저장)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // 메모리 기반 저장소 사용


app.use((req, res) => {
    res.status(404).json({ message: '찾을 수 없는 페이지입니다.' });
});

// 이미지 목록을 가져오는 엔드포인트
app.get('/images', async (req, res) => {

    const userId = req.query.name;

    try {
        const params = { Bucket: bucketName, Prefix: `users/${userId}/` };

        //Prefix: 'x-amz-meta-username/user1/' 



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

app.post('/images', upload.single('image'), async (req, res) => {
    try {
        console.log(req.body);
        const userId = req.body.userId;

        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const file = req.file;
        const imgNAME = path.basename(file.originalname);

        // S3에서 객체 목록 가져오기
        var uploadParams = {
            Bucket: bucketName,
            Key: `users/${userId}/${imgNAME}`,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        // call S3 to retrieve upload
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                console.log("Error", err);
            }
            if (data) {
                console.log("Upload Success", data.Location);
            }
        });
    } catch (err) {
        console.error('Error retrieving images', err);
        res.status(500).send('Error retrieving images');
    }
});

app.get('/home', async (req, res) => {
    console.log('home');
    const { userId, startDate } = req.query;

    // Check if required parameters are provided
    if (!userId || !startDate) {
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

        res.status(200).json(formattedResult); // Return the modified result
    });
});


app.post('/home/plan', async (req, res) => {
    const { userId, dateKey, startDateTime, planName, town, groupId } = req.body;

    console.log('일정등록요청')
    console.log(req.body)

    // Check if required parameters are provided
    if (!userId | !dateKey) {
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
        return res.status(201).json({ msg: 'success', plan: values });
    });
});


app.get('/home/plans/recent', async (req, res) => {
    console.log('home/plans/recent');
    const { userId } = req.query;

    // Check if required parameters are provided
    if (!userId) {
        return res.status(400).json({ error: 'userId are required' });
    }

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



app.post('/home/plan/town_update', async (req, res) => {
    const { userId, destination, planId } = req.body;
    // Check if required parameters are provided
    if (!userId | !planId) {
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


app.post('/home/plan/update', async (req, res) => {
    const { userId, schedule } = req.body;
    const { planId, dateKey, endDate, planName } = schedule;
    console.log('계획수정')
    console.log(req.body)
    // Check if required parameters are provided
    if (!userId | !planId) {
        return res.status(400).json({ error: 'userId or planId are required' });
    }

    let endDate_new = endDate

    if (!endDate) {
        endDate_new = dateKey
    }

    const sql = `
      UPDATE Plan
      SET planName = ?, startDate = ?, endDate = ?
      WHERE  planId = ? AND start_userId = ?;
    `;

    const values = [planName, dateKey, endDate_new, planId, userId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({ msg: 'success' });
    });
});

app.get('/home/plan/place', (req, res) => {
    // SQL INSERT 쿼리
    console.log('test')
    const { planId } = req.query;

    const sql = `
      SELECT Plan.town
      FROM Plan
      WHERE Plan.planId = ?;
      `
    const values = [planId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(result);
    });
});


app.post('/home/plan/delete', async (req, res) => {
    const { userId, planId } = req.body;

    console.log('일정삭제')
    console.log(req.body)

    // Check if required parameters are provided
    if (!userId | !planId) {
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

        console.log(values)
        return res.status(201).json({ msg: 'success' });
    });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});