const express = require('express');
const db = require('../db')

const router = express.Router();
const authenticateJWT = require('../config/authenticateJWT');

// 유저 정보 조회
router.get('/load', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;
    console.log("유저 정보 조회 : ",  userId)

    const sql = `
        SELECT User.userName, User.userAge, User.userGender, User_survey.*
        FROM User
        LEFT JOIN User_survey ON User.userId = User_survey.userId;
        WHERE User.userId = ?
    `;
    
    try {
        db.query(sql, [userId], async (err, result) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            console.log("결과: ",  result)
            return res.status(201).json(result);
        });

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'error' });
    }

})

// 유저 정보 업데이트
router.post('/load', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;
    console.log("유저 정보 업데이트",req.body)

    const User_update = `
      UPDATE User
      SET userName = ?, userAge = ?, userGender = ?
      WHERE userId = ?;
    `;

    // const User_survey_update = `
    // UPDATE User_survey
    // SET userName = ?, userAge = ?, userGender = ?
    // WHERE userId = ?;
    // `;
    
    try {
        db.query(sql, [userId], async (err, result) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            console.log("결과: ",  result)
            return res.status(201).json(result);
        });

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'error' });
    }

})

module.exports = router;