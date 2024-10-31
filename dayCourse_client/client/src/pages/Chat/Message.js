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
    width: fit-content;
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

  if(user === trimmedName) {
    isSentByCurrentUser = true;
  }

  return isSentByCurrentUser ? (
    <div style={{justifyContent: isSentByCurrentUser ? 'flex-end' : 'flex-start'}}>
        <p style={{color: 'black'}}>{trimmedName}</p>
        <ChatMessage>
            {text}
        </ChatMessage>
    </div>
  ) : (
    <div style={{justifyContent: isSentByCurrentUser ? 'flex-end' : 'flex-start'}}>
        <p style={{color: 'black'}}>{user}</p>
        <ChatMessage2>
            {text}
        </ChatMessage2>
    </div>
  )
}

export default Message;