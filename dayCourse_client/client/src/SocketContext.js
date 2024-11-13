// src/SocketContext.js
import React, { createContext, useEffect, useState, useRef, useCallback  } from 'react';
import socket from './socket';

const SocketContext = createContext();

const chatSound = new Audio('/chatSound_copy.wav');

export const SocketProvider = ({ children, userId }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const currentRoom = useRef(null);
    const [isSoundEnabled, setIsSoundEnabled] = useState(false); // 사운드 활성화 상태

    const enableSound = () => setIsSoundEnabled(true); // 외부에서 호출 가능

    useEffect(() => {
        socket.connect();

        socket.on('connect', () => {
            console.log('소켓 연결됨');
            // 초기에는 방에 참여하지 않음
        });

        socket.on('message', (incomingMessages) => {
            if (isSoundEnabled) { // 사운드가 활성화된 경우에만 재생
                chatSound.play().catch((error) => console.error("Sound playback failed:", error));
            }
            
            if (Array.isArray(incomingMessages)) {
                setMessages(incomingMessages.reverse());
            } else if (typeof incomingMessages === 'object') {
                setMessages((prevMessages) => [incomingMessages, ...prevMessages]);
            } else {
                console.error('수신된 메시지가 배열이나 객체가 아닙니다:', incomingMessages);
            }
        });

        socket.on('roomData', ({ users }) => {
            setUsers(users);
        });

        socket.on('disconnect', () => {
            console.log('소켓 연결 끊어짐');
        });

        // 기타 전역 이벤트 리스너 추가 가능

        return () => {
            console.log('SocketProvider: 소켓 연결 해제');
            socket.disconnect();
        };
        // eslint-disable-next-line
    }, [userId]);

    const leaveRoom = useCallback(() => {
        if (currentRoom.current) {
            socket.emit('leave', { userId, room: currentRoom.current });
            currentRoom.current = null;
        }
    }, [userId]);

    const joinRoom = useCallback((planId) => {
        if (currentRoom.current) {
            leaveRoom(); // 기존 방을 나감
        }
        socket.emit('join', { userId, name: `${userId}`, room: planId }, (error) => {
            if (error) {
                alert(error.error);
            }
        });
        currentRoom.current = planId;
    }, [userId, leaveRoom]);



    const sendMessage = useCallback((message, callback) => {
        socket.emit('sendMessage', message, () => callback());
    }, []);


    return (
        <SocketContext.Provider value={{ socket:socket, messages, users, sendMessage, joinRoom, leaveRoom, enableSound }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;