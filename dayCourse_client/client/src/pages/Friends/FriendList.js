// import {useState} from 'react';
import styled from 'styled-components';
// import {getFriends} from './SearchFriend';
import {Button} from '../../Button';

const ResultContainer = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    height: 33vh;  
    ${'' /* overflow-y: auto; */}
    overflow: auto; 
    

    ${'' /* border:1px solid; */}
    &::-webkit-scrollbar {
        display: none; 
    }
    gap: 0.5rem;
`

const ItemContainer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0 0 0 3vh;
    background: white;
    border-radius: 10px;
    align-items: center;
    border: 1px solid #ddd;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    
    ${'' /* background: #eee; */}
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

    // console.log(friendsList);
    return(
        <>
        <ResultContainer id="search-result">
            {friendsList && friendsList.length === 0 ? (   
                    flag ? (<p className="result-text">친구를 추가해보세요.</p>):(<p className="result-text">그룹을 생성할 친구를 추가해보세요.</p>) 
            ):(friendsList &&
            <>
            {friendsList.map((friend, index) => (
                <ItemContainer
                    key={index} 
                    onClick={() => {
                        // selectedFriend(friend);
                    }} 
                    style={{ cursor: 'pointer' }}
                >
                    <div style={{display:'flex', justifyContent:'space-between',  alignItems:'center',}}>
                        <h4 style={{width:'15vh'}}>{friend.friendName}</h4>
                        <p> | {friend.friendId}</p>
                    </div>
                    {flag ? 
                    <button onClick={(e) => handleAdd(e, friend)}>추가</button>
                    :<Button onClick={(e) => handleDelete(e, friend)} $border='none'>X</Button>}
                </ItemContainer>
            ))}
            </>)
            }
        </ResultContainer>
        </>
    )
}

export function GroupList({groupsList, setSelectedGroup, flag}) {
    const handleSelect = (e, group) => {
        e.preventDefault();
        setSelectedGroup(group);
    };
  
    console.log(groupsList);
    return(
        <>
        <ResultContainer id="search-result">
            {groupsList && groupsList.length === 0 ? (   
                    <p className="result-text">그룹을 추가해보세요.</p> 
            ):(groupsList &&
            <>
            {groupsList.map((group, index) => (
                <ItemContainer
                    key={index} 
                    onClick={() => {
                        // selectedFriend(friend);
                    }} 
                    style={{ cursor: 'pointer', gap:'1rem' }}
                >
                    <div style={{display:'flex', justifyContent:'space-between', width:'80%', alignItems:'center',}}>
                        <h4>{group.groupName}</h4>
                        {/* <p>{group.userNames}</p> */}
                        <p>{group.userNames.map((item) => item).join(', ')}</p>
                    </div>
                    <button onClick={(e) => handleSelect(e, group)}>선택</button>
                    {/* {flag ? 
                    <button onClick={(e) => handleAdd(e, friend)}>추가</button>
                    :<Button onClick={(e) => handleDelete(e, friend)} $border='none'>X</Button>} */}
                </ItemContainer>
            ))}
            </>)
            }
        </ResultContainer>
        </>
    )
}
