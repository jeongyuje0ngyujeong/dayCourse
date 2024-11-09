// src/SocketContext.js
import React, { createContext, useEffect, useState, useRef, useCallback  } from 'react';
import socket from './socket';

const SocketContext = createContext();

export const SocketProvider = ({ children, userId }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const currentRoom = useRef(null);

    useEffect(() => {
        socket.connect();

        socket.on('connect', () => {
            console.log('소켓 연결됨');
            // 초기에는 방에 참여하지 않음
        });

        socket.on('message', (incomingMessages) => {
            console.log('받은 메시지:', incomingMessages);
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
        <SocketContext.Provider value={{ socket:socket, messages, users, sendMessage, joinRoom, leaveRoom }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;