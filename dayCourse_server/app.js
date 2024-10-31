const express = require('express');
const db = require('./db.js');
const apiHome = require('./routes/home.js');
const groupRoutes = require('./routes/group.js');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const http = require('http')

const socketio = require('socket.io')

const app = express();
dotenv.config();

//서버-클라이언트 연결 테스트
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 처리


const authenticateJWT = require('./config/authenticateJWT');

// passport 초기화 및 설정
require('./config/passport')(passport);
app.use(passport.initialize());

//웹소켓 관련
const server = http.createServer(app)
const io = socketio(server, {
  cors: {
    origin: '*',  // React 클라이언트 허용
    methods: ['GET', 'POST'],         // 허용할 메서드
    credentials: true                 // 쿠키 사용 허용
  }
});


// /home 경로에 있는 모든 라우트에 인증 미들웨어 적용
app.use('/home', authenticateJWT, apiHome);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);
app.use("/home", apiHome);
app.use("/group", groupRoutes);

app.get('/', (req, res) => {
  res.send('테스트')
})


io.on('connection', (socket) => {
  console.log('새로운 유저가 접속했습니다.')
  
  socket.on('join', ({name, room}, callback) => {
    console.log('name:', name, 'room:', room);
    const { error, user } = addUser({ id: socket.id, name, room })
    if (error) callback({error : '에러가 발생했습니다.'})

    socket.emit('message', {
      user: 'admin',
      text: `${user.name}님, 환영합니다.`,
    })

    io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      })

    socket.join(user.room)
    callback()
  })

  socket.on('sendMessage', (message, callback) => {
    // console.log('socket.id:', socket.id);
    const user = getUser(socket.id)
    // console.log('getUser result:', user);
    // console.log(typeof message, message)
    io.to(user.room).emit('message', {
      user: user.name,
      text: message,
    })
    callback()
  })


  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if (user) {
        io.to(user.room).emit('message', {
        user: 'admin',
        text: `${user.name}님이 퇴장하셨습니다.`,
        })
        io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
        })
    }
    console.log('유저가 나갔습니다.')
  })
})


const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});