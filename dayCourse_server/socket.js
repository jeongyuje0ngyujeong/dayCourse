const express = require('express')
const socketio = require('socket.io')
const db = require('./db.js');
const http = require('http')
const { v4: uuidv4 } = require('uuid');

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

    console.log(user)
    console.log(error)

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

      //console.log(results)

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
      
      socket.join(user.room)
      
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      })

      //console.log(messages)

      callback(); // 콜백 호출
    });

  })

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    // 메시지를 DB에 저장
    const query = `INSERT INTO Chat (planID, userID, userName, message) VALUES (?, ?, ?, ?)`;
    console.log(user)
    const values = [user.room, user.userId, user.name, message]; // planID를 room으로, userID를 user.id로 가정

    db.query(query, values, (error, results) => {
      if (error) {
        console.error('메시지 저장 중 오류 발생:', error);
        return callback(error);
      }

      // 저장이 완료되면 클라이언트로 메시지 전송
      io.to(user.room).emit('message', {
		id: uuidv4(),
        user: user.name,
        text: message,
        color: user.color,
		timestamp: Date.now()
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

  socket.on('mouse-move', ({ room, x, y }) => {
    const user = getUser(socket.id);
    if (user) {
      user.cursor = { x, y };
      socket.to(user.room).emit('user-mouse-move', {
        userId: user.userId,
        name: user.name,
        cursor: { x, y }
      });
      //console.log(`마우스 이동 이벤트 전송: userId=${user.userId}, x=${x}, y=${y}`);
    }
  });

  socket.on('update-places', ({room, places}) => {
    socket.to(room).emit('places-updated', places);
  });

  // 루트 추천 결과 수신 및 브로드캐스트
  socket.on('route-recommended', ({ room, updatedPlaces }) => {
    // 해당 방의 다른 사용자들에게 이벤트 전송
    socket.to(room).emit('route-recommended', { updatedPlaces });
  });

  // 코스 추천 결과 수신 및 브로드캐스트
  socket.on('course-recommended', ({ room, updatedPlaces }) => {
    // 해당 방의 다른 사용자들에게 이벤트 전송
    socket.to(room).emit('course-recommended', { updatedPlaces });
  });

   // 드래그 시작 이벤트 처리
   socket.on('drag-start', ({ room, draggableId }) => {
	socket.to(room).emit('drag-start', { draggableId });
});

	// 드래그 종료 이벤트 처리
	socket.on('drag-end', ({ room, updatedPlaces }) => {
		socket.to(room).emit('places-updated', updatedPlaces);
	});

	//클라이언트가 'notification' 이벤트를 보낼 때 이를 같은 방에 있는 모든 사용자에게 전송
    socket.on('notification', ({ room, message }) => {
        console.log(`Sending notification to room ${room}:`, message);
        
        // 같은 방에 있는 다른 사용자에게 알림 전송
        socket.to(room).emit('notification', { message });
    });
  
})

server.listen(PORT, () => console.log(`서버가 ${PORT} 에서 시작되었어요`))