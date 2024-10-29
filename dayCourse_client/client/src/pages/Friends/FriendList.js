import {useState} from 'react';
import styled from 'styled-components';
import {getFriends} from './SearchFriend';
import {Button} from '../../Button';

const ResultContainer = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    height: 15rem;  
    ${'' /* overflow-y: auto; */}
    overflow: auto; 
    
    &::-webkit-scrollbar {
        display: none; 
    }
    gap: 0.5rem;
`

const ItemContainer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0 0 0 5px;
    background: white;
    border-radius: 5px;
    align-items: center;
`

export default function FriendList({friendsList, setSelectedFriends, flag}) {
    const handleAdd = (e, friend) => {
        e.preventDefault();
        setSelectedFriends((prevSelectedFriends) => {
            if (prevSelectedFriends.some((selectedFriend) => selectedFriend === friend)) {
                return prevSelectedFriends; 
            }
            return [...prevSelectedFriends, friend]; 
        });
    };
  
    const handleDelete = (e, friend) => {
        e.preventDefault();
        setSelectedFriends((prevSelectedFriends) =>
            prevSelectedFriends.filter((selectedFriend) => selectedFriend !== friend)
        );
    };
    console.log('here: ', friendsList);

    return(
        <>
        <ResultContainer id="search-result">
            {friendsList.length === 0 ? (   
                    flag ? (<p className="result-text">친구를 추가해보세요.</p>):(<p className="result-text">그룹을 생성할 친구를 추가해보세요.</p>) 
            ):
            <>
            {friendsList.map((friend, index) => (
                <ItemContainer
                    key={index} 
                    onClick={() => {
                        // selectedFriend(friend);
                    }} 
                    style={{ cursor: 'pointer' }}
                >
                    <p>{friend.friendName} | {friend.friendId}</p>
                    {flag ? 
                    <button onClick={(e) => handleAdd(e, friend)}>추가</button>
                    :<Button onClick={(e) => handleDelete(e, friend)} $border='none'>X</Button>}
                </ItemContainer>
            ))}
            </>
            }
        </ResultContainer>
        </>
    )
}