import styled from 'styled-components';
import {Button} from '../../Button';
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
    height: 90%;
`;

const ChatName = styled.div`
    flex: 0 0 10%;
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

const ENDPOINT = 'http://localhost:5000';
let socket;

export default function Chat({userId, planId}) {
    const [name, setName] = useState(sessionStorage.getItem('userId'));
    const [room, setRoom] = useState('hello');
    const [users, setUsers] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // const {name, room} = queryString.parse(window.location.search);
        console.log(name, room);
        
        socket = io(ENDPOINT);
        setName(name);
        setRoom(room);
        socket.emit('join', {name, room}, (err) => {
          if (err) {
            alert(err);
          }
        });
        return () => {
          socket.emit();
          socket.off();
        }
    }, [ENDPOINT, window.location.search]);

    useEffect(() => {
        socket.on('message', (message) => {
          setMessages((prevMessages) => [message, ...prevMessages]);
        });
        socket.on('roomData', ({users}) => {
          setUsers(users);
        });
      }, []);
    
    const sendMessage = (event) => {
        event.preventDefault();
        if (message) {
            socket.emit('sendMessage', message, () => setMessage(''));
        }
    }

    return (
    <ChatContainer>
        <ChatName>채팅방: {planId}</ChatName>
        <Messages messages={messages} name={name}/>
        <Input message={message} setMessage={setMessage} sendMessage={sendMessage}/>
        {/* <ChatInputBar>
            <ChatInput placeholder="메시지 입력" message={message} setMessage={setMessage} sendMessage={sendMessage}></ChatInput>
            <Button style={{height:'100%',width:'3rem',border:'none'}}>전송</Button>
        </ChatInputBar> */}
    </ChatContainer>
    )
}