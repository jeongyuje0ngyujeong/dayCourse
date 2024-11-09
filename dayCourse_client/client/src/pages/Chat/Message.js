// src/pages/Chat/Message.js
import React from 'react';
import styled from 'styled-components';

const ChatMessage = styled.div`
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 0.5rem;
    background: #ccc;
    color: black;
    border-radius: 5px;
    max-width: 70%;
    word-wrap: break-word;
`;

const ChatMessage2 = styled.div`
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 0.5rem;
    background: #90B54C;
    color: white;
    border-radius: 5px;
    max-width: 70%;
    word-wrap: break-word;
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

function Message({ user, text, name }) {
  const isSentByCurrentUser = user.trim().toLowerCase() === name.trim().toLowerCase();

  return (
      <MessageContainer style={{ alignItems: isSentByCurrentUser? 'flex-end' : 'flex-start' }}>
          <p style={{ color: 'black' }}>{isSentByCurrentUser? name : user}</p>
          {isSentByCurrentUser? (
              <ChatMessage2>
                  {text}
              </ChatMessage2>
          ) : (
              <ChatMessage>
                  {text}
              </ChatMessage>
          )}
      </MessageContainer>
  );
}

export default Message;
