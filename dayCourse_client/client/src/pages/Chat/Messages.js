// src/pages/Chat/Messages.js
import styled from 'styled-components';
import Message from "./Message";
import React, { useEffect, useState } from 'react';

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

export default function Messages({ messages, name, chatSound }) {
    // const previousMessagesCountRef = useRef(messages.length);
    // const [messagesWithStatus, setMessagesWithStatus] = useState([]);
    const [highlightMessageIndex, setHighlightMessageIndex] = useState(0);

    // useEffect(() => {
    //     if (messages.length > previousMessagesCountRef.current) {
    //         chatSound.play().catch((error) => {
    //             console.error("Sound playback failed:", error);
    //         });

    //         const updatedMessages = messages.map((message, index) => ({
    //             ...message,
    //             isNewMessage: index >= previousMessagesCountRef.current
    //         }));

    //         setMessagesWithStatus(updatedMessages);
    //         previousMessagesCountRef.current = messages.length;
    //     } else {
    //         setMessagesWithStatus(messages.map(message => ({ ...message, isNewMessage: false })));
    //     }
    // }, [messages, chatSound]);

    useEffect(() => {
        setHighlightMessageIndex(0);

        const timer = setTimeout(() => {
            setHighlightMessageIndex(null); // 2초 후 강조 제거
          }, 300); // 2초 후 강조 제거
    
          return () => clearTimeout(timer); // cleanup
      }, [messages]);

    return (
        <ChatContent>
            {messages.map((message, index) => (
                <div key={index}>
                    <Message 
                        user={message.user} 
                        text={message.text} 
                        name={name} 
                        isNewMessage={index === highlightMessageIndex}
                        color={message.color} 
                    />
                </div>
            ))}
        </ChatContent>
    );
}