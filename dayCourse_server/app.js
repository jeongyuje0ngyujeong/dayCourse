const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/home', (req, res) => {
    res.status(200).json({ message: '서버와 클라이언트 통신이 성공했습니다!' });
});

app.use((req, res) => {
    res.status(404).json({ message: '찾을 수 없는 페이지입니다.' });
});

// 3000번 포트로 서버 실행
const PORT = 3000;
app.listen(PORT, '3.34.40.16', () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});