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
            console.log('전체 메세지: ', messages);
        }
      }, [messages]);

    return (
        <ChatContent>
            {messages.length>0 && messages.map((message, i) => (
                <div key={i}><Message user={message.user} text={message.text} name={name}/></div>
            ))}
        </ChatContent>
    );
}