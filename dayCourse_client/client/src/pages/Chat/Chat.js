// src/pages/Chat/Chat.js
import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import SocketContext from '../../SocketContext';
import Messages from './Messages';
import Input from './Input';

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

    const handleSendMessage = (event) => {
        event.preventDefault();
        if (message) {
            sendMessage(message, () => setMessage(''));
        }
    };

    return (
        <ChatContainer>
            {/* <ChatName>채팅방: {userNames}</ChatName> */}
            <Messages messages={messages} name={userId} />
            <Input message={message} setMessage={setMessage} sendMessage={handleSendMessage} />
        </ChatContainer>
    );
}