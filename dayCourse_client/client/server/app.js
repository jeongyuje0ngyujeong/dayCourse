const express = require('express')
const socketio = require('socket.io')
const http = require('http')

const cors = require('cors')
const router = require('./router')

const PORT = process.env.PORT || 5000

const app = express();
const server = http.createServer(app)
const io = socketio(server, {
    cors: {
      origin: 'http://localhost:3000',  // React 클라이언트 허용
      methods: ['GET', 'POST'],         // 허용할 메서드
      credentials: true                 // 쿠키 사용 허용
    }
  });

app.use(cors({
    origin: 'http://localhost:3000',  // 허용할 도메인 (React 앱)
    methods: ['GET', 'POST'],         // 허용할 HTTP 메서드

  }))
app.use(router)
io.on('connection', (socket) => {
  console.log('새로운 유저가 접속했습니다.')
  socket.on('join', ({name, room}, callback) => {})
  socket.on('disconnect', () => {
    console.log('유저가 나갔습니다.')
  })
})

server.listen(PORT,()=>console.log(`서버가 ${PORT} 에서 시작되었어요`))