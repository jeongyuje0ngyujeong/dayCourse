const express = require('express');
const cors = require('cors');
const app = express();

//서버-클라이언트 연결 테스트
app.use(cors());
app.use(express.json());

app.get('/home', (req, res) => {
    res.status(200).json({ message: '서버와 클라이언트 통신이 성공했습니다!' });
});

app.use((req, res) => {
    res.status(404).json({ message: '찾을 수 없는 페이지입니다.' });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});