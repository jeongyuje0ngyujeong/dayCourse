const express = require('express');
const router = express.Router();
const db = require('../db')
const axios = require('axios');

const authenticateJWT = require('../config/authenticateJWT');


router.post('/friend', authenticateJWT, async (req, res) => {
    console.log("req.user:", JSON.stringify(req.user, null, 2));

    const userId = req.user.userId;
    console.log('usderId: ' + userId);

    const { searchId } = req.body;
    console.log('req.body: ' + req.body);

    console.log('친구 검색')
    // console.log(req.body)
    // console.log('userId check: ' + userId);

    // Check if required parameters are provided
    if (!searchId) {
        return res.status(400).json({ error: 'searchId is required' });
    }

    const find_sql = `
      SELECT User.userId, User.userName
      FROM User
      WHERE User.id = ?
    `;

    db.query(find_sql, [searchId], (err, find_result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (find_result.length > 0) {
            const friendUserId = find_result[0];
            
            const inser_sql = `
              INSERT INTO friend (userId, friendUserId)
              VALUES (?, ?)
            `;
            
            const values = [userId, friendUserId];

            db.query(inser_sql, values, (err, insert_result) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
    
                return res.status(201).json({ success: true, friendName: insert_result[1] });
            });
        } else {
            return res.status(404).json({ success: false, error: 'No user found with the provided searchId' });
        }
    });
});