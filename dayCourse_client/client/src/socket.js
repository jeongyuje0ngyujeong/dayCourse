// src/socket.js
import { io } from 'socket.io-client';

const ENDPOINT =  process.env.REACT_APP_BASE_URLSS;
const socket = io(ENDPOINT, {
    autoConnect: false, // 자동 연결 방지
    transports: ['websocket'], // 필요한 경우 설정
});

export default socket;