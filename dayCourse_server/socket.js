const express = require('express')
const socketio = require('socket.io')
const db = require('./db.js');
const http = require('http')

const cors = require('cors')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')

const PORT = 3030

const app = express();
const server = http.createServer(app)
const io = socketio(server, {
  cors: {
    origin: '*',  // React 클라이언트 허용
    methods: ['GET', 'POST'],         // 허용할 메서드
    credentials: true                 // 쿠키 사용 허용
  }
});

app.use(cors())

app.get('/', (req, res) => {
  res.send({ response: "접속 테스트" }).status(200)
})

io.on('connection', (socket) => {
  console.log('새로운 유저가 접속했습니다.')

  socket.on('join', ({ userId, name, room }, callback) => {
    console.log('userId', userId, 'name:', name, 'room:', room);
    const { error, user } = addUser({ id: socket.id, userId, name, room })
    if (error) callback({ error: '에러가 발생했습니다.' })

    const query = `
      SELECT userName, message
      FROM Chat
      WHERE planID = ?
      ORDER BY timestamp ASC;
    `;

    db.query(query, [room], (error, results) => {
      if (error) {
        console.error('메시지 조회 중 오류 발생:', error);
        return callback(error);
      }

      const messages = results.map(result => ({
        user: result.userName,
        text: result.message
      }));

      // 사용자 환영 메시지를 추가합니다.
      messages.push({
        user: 'admin',
        text: `${user.name}님, 환영합니다.`
      });

      socket.emit('message', messages);

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      })

      console.log(messages)

      socket.join(user.room)
      callback(); // 콜백 호출
    });

  })

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    // 메시지를 DB에 저장
    const query = `INSERT INTO Chat (planID, userID, userName, message) VALUES (?, ?, ?, ?)`;
    const values = [user.room, user.userId, user.name, message]; // planID를 room으로, userID를 user.id로 가정

    db.query(query, values, (error, results) => {
      if (error) {
        console.error('메시지 저장 중 오류 발생:', error);
        return callback(error);
      }

      // 저장이 완료되면 클라이언트로 메시지 전송
      io.to(user.room).emit('message', {
        user: user.name,
        text: message,
      });

      callback(); // 콜백 호출
    });
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

server.listen(PORT, () => console.log(`서버가 ${PORT} 에서 시작되었어요`))