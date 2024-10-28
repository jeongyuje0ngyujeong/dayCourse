// import React from 'react';
import styled from 'styled-components';
import Message from "./Message";
import React, { useState, useEffect } from 'react';

const ChatContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column-reverse;
    width: auto%;
    margin: 0.5rem 0;
   
    color: white;
    overflow: auto; 
    
    &::-webkit-scrollbar {
        display: none; 
    }
`;


export default function Messages({ messages, name }) {
    useEffect(() => {
        console.log('전체 메세지: ', messages);
      }, [messages]);

    return (
        <ChatContent>
            {messages.map((message, i) => {
                return <div key={i}><Message message={message} name={name}/></div>
            })}
        </ChatContent>
    );
}