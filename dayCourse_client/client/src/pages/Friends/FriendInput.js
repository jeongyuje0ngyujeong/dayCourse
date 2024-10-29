import React from 'react';
import styled from 'styled-components';
import {Button} from '../../Button';


const ChatInputBar = styled.form`
    display: flex;
    align-items: center;
`

const ChatInput = styled.input`
    flex: 1;
    height: 100%;
    padding: 10px;
    ${'' /* margin-bottom: 10px; */}
    border: 1px solid #ced4da;
    border-radius: 4px;
`;


export default function FriendInput({value, setValue, setKeyword}) {
    const handleOnClick = (e) => {
        e.preventDefault(); 
        setKeyword(value);
    };

    return(
        <ChatInputBar>
            <ChatInput 
                type="text"
                placeholder="친구의 ID를 입력해주세요" 
                value={value}
                onChange={({ target: { value } }) => setValue(value)}
            >
            </ChatInput>
            <Button type='submit' onClick={e => {handleOnClick(e)}} style={{height:'2.7rem',width:'3rem'}}>검색</Button>
        </ChatInputBar>
    )
}

        
