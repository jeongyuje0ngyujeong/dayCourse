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

const ChatName = styled.div`
    flex: 0 0 5%;
    display: flex;
    width: 100%;
    height: 10%;
    border-top: 1px solid;
    border-bottom: 1px solid;
    border-color: #ced4da;
    align-items: center;
`;

// const ChatInputBar = styled.div`
//     flex:0;
//     display: flex;
// `

// const ChatInput = styled.input`
//     flex: 1;
//     height: 100%;
//     padding: 10px;
//     margin-bottom: 10px;
//     border: 1px solid #ced4da;
//     border-radius: 4px;
// `;

const ENDPOINT = 'http://13.125.236.177:3030';
// const ENDPOINT = 'http://localhost:5000';
let socket;

export default function Chat({userId, planInfo}) {
    const planId = planInfo.planId;
    const [name, setName] = useState(userId);
    const [room, setRoom] = useState(planId);
    const [users, setUsers] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [userNames, setUserNames] = useState('');

    useEffect(() => {
        // const {name, room} = queryString.parse(window.location.search);
        
        socket = io(ENDPOINT);
        setName(name);
        setRoom(room);
        socket.emit('join', {
          userId: sessionStorage.getItem('id'), 
          name: name, 
          room: room
        }, (err) => {
          if (err) {
            alert(err);
          }
        });

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
        <ChatName>채팅방: {userNames}</ChatName>
        <Messages messages={messages} name={name}/>
        <Input message={message} setMessage={setMessage} sendMessage={sendMessage}/>
        {/* <ChatInputBar>
            <ChatInput placeholder="메시지 입력" message={message} setMessage={setMessage} sendMessage={sendMessage}></ChatInput>
            <Button style={{height:'100%',width:'3rem',border:'none'}}>전송</Button>
        </ChatInputBar> */}
    </ChatContainer>
    )
}