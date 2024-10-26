const express = require('express');
const router = express.Router();
const db = require('../db')

const axios = require('axios');

const apiKey = process.env.GOOGLE_API_KEY;


router.get('/', async (req, res) => {
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

        return res.status(200).json(formattedResult); // Return the modified result
    });
});



router.post('/plan', async (req, res) => {
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
        return res.status(201).json({ msg: 'success', planId: result.insertId });
    });
});


router.get('/plans/recent', async (req, res) => {
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


router.post('/plan/town_update', async (req, res) => {
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


router.post('/plan/update', async (req, res) => {
    const { userId, schedule } = req.body;
    const { planId, dateKey, endDate, planName, town } = schedule;
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



router.post('/plan/place', (req, res) => {
    // SQL INSERT 쿼리
    console.log('place get')
    const { planId } = req.body;

    const sql = `
      SELECT Plan.town
      FROM Plan
      WHERE Plan.planId = ?;
      `

    const sql_location = `
      SELECT Plan_Location.memo, Plan_Location.l_priority, Plan_Location.place, Plan_Location.placeId, Plan_Location.place_name
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

            res.status(201).json( result_location );
        });
    });
});


router.delete('/plan/place', (req, res) => {
    console.log('place delete')
    const { placeId } = req.query;
    console.log(req.body)
    console.log(req.query)
    
    if (!placeId){
        return res.status(400).json({ error: 'placeId 없음!' });
    }

    const sql = `
      DELETE FROM Plan_Location 
      WHERE placeId = ?;
    `;

    const values = [placeId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json( {msg: 'success'});

    });
});


router.post('/plan/delete', async (req, res) => {
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
        return res.status(200).json({ msg: 'success' });
    });
});


router.post('/plan/addPlace', async (req, res) => {
    const { userId, planId, memo, place } = req.body;

    // Check if required parameters are provided
    if (!userId | !planId) {
        return res.status(400).json({ error: 'userId or planId are required' });
    }

    const sql = `
        INSERT INTO Plan_Location (planId, l_priority, memo, place, place_name)
        SELECT ?, IFNULL(MAX(l_priority), 0) + 1, ?, ?, ?
        FROM Plan_Location
        WHERE planId = ?;
    `;

    const values = [planId, memo, place.address_name, place.place_name, planId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        console.log(result)
        return res.status(200).json({ msg: 'success' });
    });
});



router.post('/plan/recommend_place', async (req, res) => {
    const { userId, planId, memo, place } = req.body;

    console.log('장소추천요청')
    console.log(req.body)

    // // Check if required parameters are provided
    // if (!userId | !planId) {
    //     return res.status(400).json({ error: 'userId or planId are required' });
    // }

    const values = ['갈라파꼬치']

    return res.status(200).json({ msg: 'success', recommend: values });

    

    // const values = [planId, memo, place.address_name, planId];

    // db.query(sql, values, (err, result) => {
    //     if (err) {
    //         console.error('Error inserting data:', err);
    //         return res.status(500).json({ error: 'Database error' });
    //     }

    //     console.log(result)
    //     return res.status(200).json({ msg: '갈라파꼬치' });
    // });
});

router.post('/plan/place_distance', async (req, res) => {
    const { origin, destination } = req.body.params;

    // 각 좌표를 "lat,lng" 형식으로 변환
    const origins = origin.map(point => `${point.lat},${point.lng}`).join('|');
    const destinations = destination.map(point => `${point.lat},${point.lng}`).join('|');
    
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
            params: {
                origins,
                destinations,
                key: apiKey
            }
        });

        console.log(response.data);
       
        const distances = response.data.rows.map(row =>
            row.elements.map(element => ({
                distance: element.distance ? element.distance.text : 'N/A',
                duration: element.duration ? element.duration.text : 'N/A',
            }))
        );
        
        console.log(distances);
        res.json(distances);        
     

    } catch (error) {
        console.error(error);
        res.status(500).send('API 요청에 실패했습니다.');
    }
});


module.exports = router;