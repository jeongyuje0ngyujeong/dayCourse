import React from 'react';
import styled from 'styled-components';

const ChatMessage = styled.div`
    display: inline-flex;
    align-items: center;
    height:auto; 
    padding: 0.5rem 0.5rem;
    background: #ccc;
    color: black;
    border-radius: 5px;
    max-width: 80%;
    word-wrap: break-word;
    position: relative;
    margin-left: 0;
`;

const ChatMessage2 = styled.div`
    display: inline-flex;
    align-items: center;
    height:auto; 
    padding: 0.5rem 0.5rem;
    background: #90B54C;
    border-radius: 5px;
    width: fit-content;
    word-wrap: break-word;
    position: relative;
    margin-left: 0;
`;


function Message({  user, text, name  }) {
  // console.log(text);
  let isSentByCurrentUser = false;  
  
  const trimmedName = name.trim().toLowerCase();

  return (
      <MessageContainer style={{ alignItems: isSentByCurrentUser? 'flex-end' : 'flex-start', fontSize:'2vh'}}>
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