const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcrypt');
const db = require('../db')
const { analyzeImage } = require('./moment');

const redisClient = require('../config/redisClient'); 

const router = express.Router();

//s3연결
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-2' });
const s3 = new AWS.S3({ apiVersion: "2024-10-18" });
const bucketName = 'daycourseimage';

// 회원가입 여부 확인
router.post('/signup/id', async (req, res) => {
    console.log('signup id');
    const { userId } = req.body.params;
    console.log('userId: ' + userId);
    // Check if required parameters are provided
    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    const sql = `
      SELECT User.id
      FROM User
      WHERE User.id = ?
      `;
        
    try {
        db.query(sql, [userId], (err, result) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            // Check if any records were found
            if (result.length > 0) {
                return res.json({ result: 'failure', message: '이미 존재하는 아이디입니다.' });
            }

            return res.json({ result: 'success', message: '사용 가능한 아이디입니다.'  });
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'Unexpected error' });
    }
});

// 회원가입
router.post('/signup', async (req, res) => {
    console.log('signup');
    const { userId, pw, userName, userGender, userAge } = req.body.params;
    console.log('userId: ' + userId + ", userName: " + userName + ", userGender: " + userGender + ", userAge: " + userAge);

    // Check if required parameters are provided
    if (!userId || !pw || !userName || !userGender || !userAge) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = `
    INSERT INTO User (id, pw, userName, userGender, userAge)
    VALUES (?, ?, ?, ?, ?)
    `;

    const hashedPw =  await bcrypt.hash(pw, 10);
    const values = [userId, hashedPw, userName, userGender, userAge];
      
    try {
      db.query(sql, values, (err, result) => {
          if (err) {
              console.error('Error fetching data:', err);
              return res.status(500).json({ error: 'Database error' });
          }
        //   console.log(values)
          return res.status(201).json({ msg: 'success'});
      });

    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'Unexpected error' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
    console.log('login');
    const { userId, pw } = req.body.params;
    console.log('userId: ' + userId);
    // Check if required parameters are provided
    if (!userId || !pw) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // WHERE에서
    const sql = `
        SELECT User.id, User.pw, User.userId, User.userName
        FROM User
        WHERE User.id = ?
        `;

    try {
        db.query(sql, [userId], async (err, result) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            // 사용자 아이디 확인
            if (result.length === 0) {
                return res.json({ result: 'failure', message: '존재하지 않는 아이디입니다.' });
            }
            // 사용자 아이디 기반 정보 확인
            const user = result[0];
            // console.log(user);

            // 비밀번호 확인
            const isMatch = await bcrypt.compare(pw, user.pw);


            if (isMatch) {
                const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
                // console.log("로그인 시 주어진 token: " + token);
                analyzeImage(user.userId)
                return res.json({ result: 'success', access_token: token, id: user.userId, userName: user.userName });
            } else {
                return res.json({ result: 'failure', message: '비밀번호가 틀렸습니다. 다시 입력해 주세요' });
            }
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'Unexpected error' });
    }
});

// 로그아웃
router.post('/logout', async(req, res) => {
    // const token = req.headers.authorization;
    const token = req.headers["authorization"]?.split(" ")[1];
    console.log(token);

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // 토큰 복호화
        const decoded = jwt.decode(token);
        if(!decoded) {
            return res.status(403).json({ error: 'Token is not valid' });
        }
    
        // 토큰 만료시간 확인
        const expireTime = decoded.exp - Math.floor(Date.now()/1000);
    
        // redis 블랙리스트에 토큰 추가 
        await redisClient.set(token, 'blacklisted', { EX: expireTime });
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ error: 'Logout failed' });
    }
});





module.exports = router;