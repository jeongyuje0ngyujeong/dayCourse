const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcrypt');

const db = require('../db')

const router = express.Router();

// 회원가입 여부 확인
router.post('/signup/id', async (req, res) => {
    const { userId } = req.body;

    // Check if required parameters are provided
    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    const sql = `
      SELECT User.id
      WHERE User.userId = ?
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

            return res.json({ result: 'success' });
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'Unexpected error' });
    }
});

// 회원가입
router.post('/signup', async (req, res) => {
    const { userId, pw, userName, userGender, userAge } = req.body;

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
    const { userId, pw } = req.body;

    // Check if required parameters are provided
    if (!userId || !pw) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = `
        SELECT User.id, User.pw
        WHERE User.userId
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
            // 비밀번호 확인
            const isMatch = await bcrypt.compare(pw, user.pw);

            if (isMatch) {
                const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                return res.json({ msg: 'Login successful', token });
            } else {
                return res.json({ result: 'failure', message: '비밀번호가 틀렸습니다. 다시 입력해 주세요' });
            }
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'Unexpected error' });
    }
});

module.exports = router;