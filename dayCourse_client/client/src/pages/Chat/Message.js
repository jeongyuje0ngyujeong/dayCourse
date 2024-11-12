// src/pages/Chat/Message.js
import React from 'react';
import styled from 'styled-components';

const ChatMessage = styled.div`
    display: inline-flex;
    align-items: center;
    padding: 1vh 1vh;
    background: #ccc;
    color: black;
    border-radius: 2vh;
    max-width: 80%;
    word-wrap: break-word;
    font-size: 2vh;

    ${'' /* animation: ${({ isNewMessage }) => isNewMessage && 'highlight 0.3s ease-out forwards'};
    @keyframes highlight {
        0% {
        background-color: #ffeb3b; 
        transform: scale(2);
        }
        100% {
        background-color: #90B54C; 
        transform: scale(1); /
        }
    } */}

    animation: ${({ isNewMessage }) => isNewMessage && 'highlightLeft 0.2s ease-out forwards'};

    @keyframes highlightLeft {
        0% {
      transform: translateY(100%); 
    }
    100% {
      transform: translateY(0); 
    }
    }
`;

const ChatMessage2 = styled.div`
    display: inline-flex;
    align-items: center;
    padding: 1vh 1vh;
    background: #90B54C;
    color: white;
    border-radius: 2vh;
    max-width: 70%;
    word-wrap: break-word;
    font-size: 2vh;

    ${'' /* animation: ${({ isNewMessage }) => isNewMessage && 'highlight 0.3s ease-out forwards'};
    @keyframes highlight {
        0% {
        background-color: #ffeb3b; 
        transform: scale(2);
        }
        100% {
        background-color: #90B54C; 
        transform: scale(1); /
        }
    } */}


    animation: ${({ isNewMessage }) => isNewMessage && 'highlightRight 0.2s ease-out forwards'};
  
    @keyframes highlightRight {
        0% {
      transform: translateY(100%);
    }
    100% {
      transform: translateY(0); 
    }
    }

    
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0vh;
`

  

const Name = styled.p`
    color: black;
    background:white;
    border:1px solid white;
    border-radius:20vh;
    padding:0 1vh;
    margin-bottom:0;

    animation: ${({ isNewMessage }) => isNewMessage && 'highlightRight 0.2s ease-out forwards'};
  
    @keyframes highlightRight {
        0% {
      transform: translateY(100%);
    }
    100% {
      transform: translateY(0); 
    }
    }
`;


function Message({ user, text, name, isNewMessage }) {
  const isSentByCurrentUser = user.trim().toLowerCase() === name.trim().toLowerCase();

  return (
      <MessageContainer style={{ alignItems: isSentByCurrentUser? 'flex-end' : 'flex-start', fontSize:'2vh'}} >
          <Name isNewMessage={isNewMessage}>{isSentByCurrentUser? name : user}</Name>
          {isSentByCurrentUser? (
              <ChatMessage2 isNewMessage={isNewMessage}>
                  {text}
              </ChatMessage2>
          ) : (
              <ChatMessage isNewMessage={isNewMessage}>
                  {text}
              </ChatMessage>
          )}
      </MessageContainer>
  );
}

export default Message;
