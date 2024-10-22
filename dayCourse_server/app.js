const express = require('express');
const cors = require('cors');
const app = express();

// server.js
const PORT = 5000;

app.use(cors());

const requestListener = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET' && req.url === '/home') {
        res.writeHead(200);
        res.end(JSON.stringify({ message: '서버와 클라이언트 통신이 성공했습니다!' }));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: '찾을 수 없는 페이지입니다.' }));
    }
};

const server = http.createServer(requestListener);

server.listen(PORT, () => {
    console.log(`서버가 ${PORT}에서 실행 중입니다.`);
});