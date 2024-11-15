const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcrypt');
const db = require('../db')
const { analyzeImage } = require('./moment');

const router = express.Router();

// 유저 정보 조회
router.get('/load', authenticateJWT, async (req, res) => {

    const userId = req.user.userId;

    const sql = `
        SELECT User.*, User_survey.*
        FROM User
        INNER JOIN User_survey ON User.userId = User_survey.userId
        WHERE User.userId = ?
    `;

    try {
        db.query(sql, [userId], async (err, result) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            return res.status(201).json(result);
        });

    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'error' });
    }

})

module.exports = router;