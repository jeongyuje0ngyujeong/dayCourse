// import React from 'react';
import styled from 'styled-components';
import Message from "./Message";
import React, { useEffect } from 'react';

const ChatContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column-reverse;
    width: 100%;
    margin: 0.5rem 0;
   
    color: white;
    overflow: auto; 
    
    &::-webkit-scrollbar {
        display: none; 
    }
`;


export default function Messages({ messages, name }) {

    useEffect(() => {
        if (messages) {
            console.log('Messages component - 전체 메시지:', messages);
            messages.forEach((msg, index) => {
                console.log(`Message at index ${index} - color:`, msg.color);
            });
        }
    }, [messages]);

    return (
        <ChatContent>
            {messages.length>0 && messages.map((message, index) => (
                <div key={index}>
                    <Message user={message.user} text={message.text} name={name} color={message.color}/>
                  
                </div>
            ))}
        </ChatContent>
    );
}