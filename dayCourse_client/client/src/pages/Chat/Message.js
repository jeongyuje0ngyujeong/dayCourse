import React from 'react';
import styled from 'styled-components';

const ChatMessage = styled.div`
    display: inline-flex;
    align-items: center;
    height:auto; 
    padding: 0.5rem 0.5rem;
    background: #90B54C;
    border-radius: 5px;
    ${'' /* margin: 0.5rem 0; */}
    ${'' /* margin-top: 0; */}
    width: fit-content;
    word-wrap: break-word;
    position: relative;
`;

function Message({  user, text, name  }) {
  // console.log(text);
  let isSentByCurrentUser = false;  
  
  const trimmedName = name.trim().toLowerCase();

  if(user === trimmedName) {
    isSentByCurrentUser = true;
  }

  return isSentByCurrentUser ? (
    <div>
        <p style={{color: 'black'}}>{trimmedName}</p>
        <ChatMessage>
            {text}
        </ChatMessage>
    </div>
    
    // <div className='messageContainer justifyEnd'>
    //   <p className='sentText pr-10'>{trimmedName}</p>
    //   <div className='messageBox backgroundBlue'>
    //     <p className='messageText colorWhite'>{text}</p>
    //   </div>
    // </div>
  ) : (
    <div>
        <p style={{color: 'red'}}>{user}</p>
        <ChatMessage>
            {text}
        </ChatMessage>
    </div>
    /* <div className='messageContainer justifyStart'>
      <div className='messageBox backgroundLight'>
        <p className='messageText colorDark'>{text}</p>
      </div>
      <p className='sentText pl-10 '>{user}</p>
    </div> */
  )
}

export default Message;