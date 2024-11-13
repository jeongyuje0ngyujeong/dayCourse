// src/pages/Chat/Chat.js
import React, { useState, useContext, useEffect } from 'react';
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

const chatSound = new Audio('/chatSound_copy.wav');

export default function Chat({ userId, planInfo }) {
    const { messages, sendMessage, enableSound } = useContext(SocketContext); // 소켓 컨텍스트에서 메시지 및 함수 가져오기
    // const [name, setName] = useState(userId);
    // const [room, setRoom] = useState(planInfo.planId);
    const [message, setMessage] = useState('');
    // const [userNames, setUserNames] = useState('');
    const [previousMessagesCount, setPreviousMessagesCount] = useState(0); // 이전 메시지 수 상태 추가

    // useEffect(() => {
    //     setUserNames(users.length > 0 ? users.map((item) => item.name).join(', ') : '');
    // }, [users]);

    useEffect(() => {
        if (messages.length > previousMessagesCount) { // 새로운 메시지가 도착했는지 확인
            chatSound.play();
        }
        setPreviousMessagesCount(messages.length); // 현재 메시지 수를 상태에 저장
    }, [messages, previousMessagesCount]);


    const handleSendMessage = (event) => {
        event.preventDefault();
        if (message) {
            sendMessage(message, () => setMessage(''));
        }
    };
    // useEffect(() => {
    //     enableSound(); // 첫 번째 상호작용 이후 소리 활성화
    // }, [enableSound]);


    return (
        <ChatContainer>
            {/* <ChatName>채팅방: {userNames}</ChatName> */}
            <Messages messages={messages} name={userId} />
            <Input message={message} setMessage={setMessage} sendMessage={handleSendMessage} />
        </ChatContainer>
    );
}