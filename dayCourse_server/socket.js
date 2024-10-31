const express = require('express')
const socketio = require('socket.io')
const http = require('http')

const cors = require('cors')
const router = require('./router')
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
app.use(router)
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
    const user = getUser(socket.id)
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

server.listen(PORT,()=>console.log(`서버가 ${PORT} 에서 시작되었어요`))