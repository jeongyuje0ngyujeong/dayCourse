const axios = require('axios');
const db = require('../db')

//s3연결
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-2' });
const s3 = new AWS.S3({ apiVersion: "2024-10-18" });
const bucketName = 'daycourseimage';


async function fetchImagesWithLimit(planIds, limit) {
    const imagesData = [];
    const queue = [...planIds]; // 복사본 사용

    const promises = Array(limit).fill(null).map(() => processQueue(queue, imagesData));
    await Promise.all(promises);

    return imagesData;
}


async function processQueue(queue, imagesData) {
    while (queue.length > 0) {
        const planId = queue.shift();
        const params = { Bucket: bucketName, Prefix: `plans/${planId}/` };

        try {
            const data = await s3.listObjectsV2(params).promise();
            if (!data.Contents || data.Contents.length === 0) continue;

            for (const item of data.Contents) {
                const imageUrl = `https://${bucketName}.s3.amazonaws.com/${item.Key}`;
                const metadata = await s3.headObject({ Bucket: bucketName, Key: item.Key }).promise();
                const newMetadata = Object.values(metadata.Metadata);

                imagesData.push({
                    url: imageUrl,
                    planId: planId,
                    metadata: newMetadata + "\n"
                });
            }
        } catch (error) {
            console.error("S3 이미지 가져오기 오류:");
        }
    }
}

async function analyzeImage(userId){
    console.log("모먼트 분석 :", userId);

    const sql = `
        SELECT Plan.planId
        FROM groupMembers
        JOIN Plan ON groupMembers.groupId = Plan.groupId
        WHERE groupMembers.userId = ? AND Plan.startDate <= NOW()
        ORDER BY Plan.planId DESC
    `;

    const sql_moment = `
        INSERT INTO moment (imgURL, moment_name, userID, planID, planName)
        SELECT ?, ?, ?, ?, (SELECT planName FROM Plan WHERE planID = ?)
        WHERE NOT EXISTS (SELECT 1 FROM moment WHERE moment_name = ? AND imgURL = ?);
    `;

    // 데이터베이스 쿼리 실행을 비동기적으로 수행
    try {
        const result = await new Promise((resolve, reject) => {
            db.query(sql, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        if (result.length === 0) {
            console.log('이미지 없음');
            return;
        }

        const planIds = result.map(plan => plan.planId);

        try {
            const imagesData = await fetchImagesWithLimit(planIds, 2);

            const response = await axios.post('http://13.124.135.96:5000/cluster', { images: imagesData }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            //console.log(response.data);

            let resultData = []


            for (const clusterKey in response.data.clusters) {
                const cluster = response.data.clusters[clusterKey];
                const coreTag = cluster.core_tag;
            
                // 각 cluster 내의 object들을 순회
                cluster.objects.forEach(obj => {
                    const { url, planId } = obj;
                    const moment_name = coreTag; // core_tag를 moment_name으로 사용
            
                    // SQL 실행
                    values_moment = [url, moment_name, userId, planId, planId, moment_name, url]
                    

                    db.query(sql_moment, values_moment, (err, result) => {
                        if (err) {
                            console.error('Error inserting data:');
                        }

                        resultData.push(result)          
                    });
                });
            }
        } catch (err) {
            console.error('모먼트 분석 이미지 오류:');
        }
    } catch (err) {
        console.error('모먼트 분석 데이터 오류:');
    }
}