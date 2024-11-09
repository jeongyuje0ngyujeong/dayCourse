import React from 'react';
import styled from 'styled-components';
import {Button} from '../../Button';

const ChatInputBar = styled.form`
    flex:0;
    display: flex;
`

const ChatInput = styled.input`
    flex: 1;
    height: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
`;


export default function Input({ setMessage, sendMessage, message }) {
    return(
        <ChatInputBar>
            <ChatInput 
                type="text"
                placeholder="메시지 입력" 
                value={message}
                onChange={({ target: { value } }) => setMessage(value)}
                onKeyPress={event => event.key === 'Enter' ? sendMessage(event) : null}
            >
            </ChatInput>
            <Button type='submit' onClick={e => sendMessage(e)} style={{height:'100%',width:'3rem',border:'none'}}>전송</Button>
        </ChatInputBar>
    )
}