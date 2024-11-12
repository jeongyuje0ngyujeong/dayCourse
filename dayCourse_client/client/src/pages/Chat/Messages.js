// import React from 'react';
import styled from 'styled-components';
import Message from "./Message";
import React, { useEffect, useState } from 'react';

const ChatContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column-reverse;
    width: 100%;
    margin: 2vh 0;
    padding: 1vh;
   
    color: white;
    overflow: auto; 
    
    &::-webkit-scrollbar {
        display: none; 
    }
`;


export default function Messages({ messages, name }) {
    
    // const latestMessageIndex = 0;
    const [highlightMessageIndex, setHighlightMessageIndex] = useState(0); 
    
    useEffect(() => {
        setHighlightMessageIndex(0);

        const timer = setTimeout(() => {
            setHighlightMessageIndex(null); // 2초 후 강조 제거
          }, 500); // 2초 후 강조 제거
    
          return () => clearTimeout(timer); // cleanup
      }, [messages]);
    return (
        <ChatContent>
            {messages.length>0 && messages.map((message, index) => (
                <div key={index}>
                    <Message user={message.user} text={message.text} name={name} isNewMessage={index === highlightMessageIndex}/>
                </div>
            ))}
        </ChatContent>
    );
}