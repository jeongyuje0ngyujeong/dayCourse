// src/pages/Chat/Chat.js
import React, { useState, useContext } from 'react';
import styled from 'styled-components';
// import {Button} from '../../Button';
import io from 'socket.io-client';
import Messages from './Messages';
import Input from './Input';
import React, { useState, useEffect } from 'react';

export async function action() {
    return null;
}
  
export async function loader() {
    return null;
}

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 85%;
`;

// const ChatName = styled.div`
//     flex: 0 0 5%;
//     display: flex;
//     width: 100%;
//     height: 10%;
//     border-top: 1px solid;
//     border-bottom: 1px solid;
//     border-color: #ced4da;
//     align-items: center;
// `;

export default function Chat({ userId, planInfo }) {
    const { messages, sendMessage } = useContext(SocketContext); // 소켓 컨텍스트에서 메시지 및 함수 가져오기
    // const [name, setName] = useState(userId);
    // const [room, setRoom] = useState(planInfo.planId);
    const [message, setMessage] = useState('');
    // const [userNames, setUserNames] = useState('');

    // useEffect(() => {
    //     setUserNames(users.length > 0 ? users.map((item) => item.name).join(', ') : '');
    // }, [users]);

        return () => {
          socket.emit();
          socket.off();
        }
    }, [name, room]);
    // [ENDPOINT, window.location.search]

    useEffect(() => {
      socket.on('message', (incomingMessages) => {
        console.log('받은 메시지:', incomingMessages); // 수신된 메시지 로그
        
        // 수신된 메시지가 배열인 경우
        if (Array.isArray(incomingMessages)) {
            setMessages(incomingMessages.reverse()); // 기존 메시지와 합침
        } 
        // 수신된 메시지가 객체인 경우
        else if (typeof incomingMessages === 'object') {
            setMessages((prevMessages) => [incomingMessages, ...prevMessages, ]); // 기존 메시지에 추가
        } 
        else {
            console.error('수신된 메시지가 배열이나 객체가 아닙니다:', incomingMessages); // 오류 로그
        }
      });
  
      socket.on('roomData', ({ users }) => {
          setUsers(users);
          setUserNames(users.length > 0 ? users.map((item) => item.name).join(', ') : '');
      });

      return () => {
          socket.off('message'); 
          socket.off('roomData'); 
      };
  }, []); 

    useEffect(() => {
      setUserNames(users.length > 0 ? users.map((item) => item.name).join(', ') : '');
    }, [users]);
    
    const sendMessage = (event) => {
        event.preventDefault();
        if (message) {
            socket.emit('sendMessage', message, () => setMessage(''));
        }
    }

    return (
        <ChatContainer>
            {/* <ChatName>채팅방: {userNames}</ChatName> */}
            <Messages messages={messages} name={userId} />
            <Input message={message} setMessage={setMessage} sendMessage={handleSendMessage} />
        </ChatContainer>
    );
}