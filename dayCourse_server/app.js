const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

//서버-클라이언트 연결 테스트
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 처리

// DB 정보
const db = mysql.createConnection({
    host: '13.124.161.75',
    user: 'daycourse',
    password: 'Gowh241017*',
    database: 'daycourse'
});

// 데이터베이스 연결
db.connect(err => {
    if (err) {
        console.error('DB connection failed:', err);
        return;
    }
    console.log('DB connected');
});

//s3연결
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-2' });
const s3 = new AWS.S3();
const bucketName = 'daycourseimage';

//파일 저장용
//const fs = require('fs');
const path = require('path');

const multer = require('multer'); // 1. multer 추가 (파일 업로드 처리)
// 1. 메모리 스토리지 설정 (파일을 메모리에 저장)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // 메모리 기반 저장소 사용

// 회원가입, 로그인 라우터 변수 지정 및 라우터 설정
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

app.use((req, res) => {
    res.status(404).json({ message: '찾을 수 없는 페이지입니다.' });
});

// 3000번 포트로 서버 실행
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});