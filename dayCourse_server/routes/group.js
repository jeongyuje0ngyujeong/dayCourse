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


// 그룹 추가
router.post('/add', authenticateJWT, async (req, res) => {
    const userId = req.user.userId; // 현재 사용자의 ID
    const { groupName, groupMembers } = req.body;

    console.log('그룹 추가');
    console.log(groupName);
    console.log(groupMembers);

    const sqlInsertGroup = `
      INSERT INTO day_Group (groupName)
      VALUES (?)
    `;

    const sqlSelectUserIds = `
      SELECT userId, userName
      FROM User
      WHERE userId IN (?)
    `;

    const sqlInsertGroupMember = `
      INSERT INTO groupMembers (groupId, userId, userName)
      VALUES (?, ?, ?)
    `;

    const sqlCheckMemberExists = `
      SELECT * FROM groupMembers WHERE groupId = ? AND userId IN (?)
    `;

    try {
        // 그룹을 먼저 삽입합니다.
        console.log('그룹 삽입');
        const result_groupId = await new Promise((resolve, reject) => {
            db.query(sqlInsertGroup, [groupName], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        const groupId = result_groupId.insertId; // 삽입한 그룹의 ID

        // 모든 친구의 userId를 가져옵니다.
        const friendIds = groupMembers.map(member => member.friendId);

        console.log("친구찾기")
        console.log(friendIds)
        
        // 현재 사용자와 친구들의 userId를 조회합니다.
        const allUserIds = [...friendIds, userId];
        
        // 사용자들의 userId와 userName을 조회합니다.
        const results = await new Promise((resolve, reject) => {
            db.query(sqlSelectUserIds, [allUserIds], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // 조회한 사용자 정보 (userId와 userName)를 매핑하여 저장합니다.
        const allUserData = results.map(result => ({ userId: result.userId, userName: result.userName }));

        // 중복 여부 확인
        const existsResults = await new Promise((resolve, reject) => {
            db.query(sqlCheckMemberExists, [groupId, allUserIds], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        const existingUserIds = new Set(existsResults.map(row => row.userId)); // 이미 존재하는 사용자 ID 세트

        // 멤버 추가 쿼리 실행
        console.log('멤버추가');
        for (const user of allUserData) {
            if (!existingUserIds.has(user.userId)) {
                await new Promise((resolve, reject) => {
                    db.query(sqlInsertGroupMember, [groupId, user.userId, user.userName], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            }
        }

        // 모든 작업이 완료되면 성공 메시지를 반환합니다.
        return res.status(200).json({ msg: "그룹 생성 성공" });
    } catch (err) {
        console.error('오류 발생:', err);
        return res.status(500).json({ error: '데이터베이스 오류' });
    }
});



// 그룹 조회
router.get('/get', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;

    try {
        // 1. 사용자에 대한 그룹 ID 조회
        const sql_G_id = `
          SELECT groupId
          FROM groupMembers
          WHERE userId = ?
        `;

        const G_id_result = await new Promise((resolve, reject) => {
            db.query(sql_G_id, [userId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // 사용자가 속한 그룹이 없는 경우 처리
        if (G_id_result.length === 0) {
            return res.status(404).json({ message: '이 사용자에게 속한 그룹이 없습니다.' });
        }

        // 2. 그룹 ID를 사용하여 그룹 이름 조회 준비
        const groupIds = G_id_result.map(group => group.groupId);
        const sql_G_name = `
          SELECT groupName, groupId, userName
          FROM day_Group
          WHERE groupId IN (?)
        `;

        // 3. 조회한 그룹 ID를 기반으로 그룹 이름을 조회
        const groupNames_result = await new Promise((resolve, reject) => {
            db.query(sql_G_name, [groupIds], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // 4. 그룹 ID와 이름을 응답으로 반환
        return res.json(groupNames_result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: '내부 서버 오류' });
    }
});





module.exports = router;