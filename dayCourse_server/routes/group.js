const express = require('express');
const router = express.Router();
const db = require('../db')
const axios = require('axios');

const authenticateJWT = require('../config/authenticateJWT');

// 친구 찾기
router.post('/friend', authenticateJWT, async (req, res) => {
    console.log("req.user:", JSON.stringify(req.user, null, 2));
    
    const userId = req.user.userId;
    console.log('usderId: ' + userId);
    
    const { searchId } = req.body;
    
    console.log('친구 검색')
    
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
            console.log("find friend", JSON.stringify(find_result, null, 2));
            
            const friendUserId = find_result[0].userId;
            const friendUserName = find_result[0].userName;
            console.log('찾은 친구의 userId: ' + friendUserId);
            
            console.log("친구 찾기 성공!")
            return res.status(201).json({ success: true, friendName: friendUserName });
            
        } else {
            return res.status(404).json({ success: false, error: 'No user found with the provided searchId' });
        }
    });
});

// 친구 추가
router.post('/friend/add', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;
    console.log('usderId: ' + userId);

    // 요청 받은 것
    const { friendId } = req.body;

    console.log('친구 추가')

    // Check if required parameters are provided
    if (!friendId) {
        return res.status(400).json({ error: 'searchId is required' });
    }

    const find_sql = `
      SELECT User.userId, User.id, User.userName
      FROM User
      WHERE User.id = ?
    `;

    db.query(find_sql, [friendId], (err, find_result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (find_result.length > 0) {
            console.log("find friend: ", JSON.stringify(find_result, null, 2));
            const friendUserId = find_result[0].userId;
            const friendId = find_result[0].id;
            const friendName = find_result[0].userName;

            console.log("friendUserId: ", friendUserId);

            const inser_sql = `
                INSERT IGNORE INTO friend (userId, friendUserId, friendName, friendId)
                VALUES (?, ?, ?, ?)
            `;
            
            const values = [userId, friendUserId, friendName, friendId];

            db.query(inser_sql, values, (err, insert_result) => {
                console.log("insert_result: ", JSON.stringify(insert_result, null, 2));
                if (err) {
                    console.error('Error inserting data:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                if (insert_result.affectedRows > 0) { 
                    console.log("친구 추가 성공!")
                    return res.status(201).json({ success: true, message: '성공적으로 친구 추가 되었습니다.' });
                    
                } else {
                    return res.json({ success: false, message: '이미 친구로 추가된 사용자입니다.' });
                }
            });

        } else {
            return res.status(404).json({ success: false,  message: '해당 ID와 일치하는 회원이 존재하지 않습니다.' });
        }
    });
});

// 친구 리스트
router.get('/friend/list', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;
    console.log('usderId: ' + userId);

    console.log('친구 리스트')

    const sql = `
      SELECT friendName, friendId
      FROM friend
      WHERE friend.userId = ?
      ORDER BY friend.friendName ASC
    `;

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (result.length > 0) {
            console.log("find friend result: ", JSON.stringify(result, null, 2));
            res.status(200).json({ success: true, friendList: result });

        } else {
            return res.status(404).json({ success: false });
        }
    });
});

module.exports = router;