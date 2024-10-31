const express = require('express');
const db = require('./db.js');
const apiHome = require('./routes/home.js');
const groupRoutes = require('./routes/group.js');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');

const app = express();
dotenv.config();

//서버-클라이언트 연결 테스트
app.use(cors({
    origin: '*', // 필요한 경우 특정 도메인만 허용
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 처리


const authenticateJWT = require('./config/authenticateJWT');

// passport 초기화 및 설정
require('./config/passport')(passport);
app.use(passport.initialize());


// /home 경로에 있는 모든 라우트에 인증 미들웨어 적용
app.use('/home', authenticateJWT, apiHome);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);
app.use("/home", apiHome);
app.use("/group", groupRoutes);

app.get('/', (req, res) => {
  res.send('테스트')
})


const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});