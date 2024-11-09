const express = require('express')
const socketio = require('socket.io')


const cors = require('cors')
const router = require('./router')
const db = require('./db'); // db.js 파일 경로 확인

const PORT = process.env.PORT || 5001

const app = express();

app.use(cors({
  origin: '*', // 필요한 경우 특정 도메인만 허용
  credentials: true,
}));

app.use(express.json());

app.get('/stores-within', async (req, res) => {
  try {
    // x, y 및 반경을 쿼리 파라미터로 받습니다.
    const { x, y, radius } = req.query;

    if (!x || !y || !radius) {
      return res.status(400).json({ error: 'x, y, and radius are required parameters' });
    }

    const longitude = parseFloat(x); // 경도
    const latitude = parseFloat(y);  // 위도
    const distanceInMeters = parseFloat(radius);

    // 공간 쿼리 실행
    const [rows] = await db.query(
      `
      SELECT 상권번호, 상권명
      FROM store_zone
      WHERE ST_Intersects(
        ST_Buffer(
          ST_GeomFromText('POINT(? ?)'),
          ? / 111320  -- 경도와 위도를 미터로 변환
        ),
        coordinates
      )
      `,
      [longitude, latitude, distanceInMeters]  // 쿼리 파라미터 순서
    );

    // 결과 반환
    res.status(200).json({ stores: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`서버가 ${PORT} 에서 시작되었어요`))