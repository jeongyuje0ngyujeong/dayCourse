// import axios from 'axios';
import styled from 'styled-components';
import FriendList, {GroupList} from '../Friends/FriendList';
// import {addGroup} from '../Friends/SearchFriend';
// import React, {useState} from 'react';
// const BASE_URL = process.env.REACT_APP_BASE_URL; 

const FriendsContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    ${'' /* margin: 0 10px; */}
    padding: 0px 10px 10px 10px;
    ${'' /* background: #eee; */}
`;
// const GroupContainer = styled.div`
//     margin: 0 10px;
//     ${'' /* padding: 0px 10px 10px 10px; */}
//     flex: 1;
//     display: flex;
//     justify-content: center;
//     flex-direction: column;
// `;

// const TextButton = styled.div`
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
// `;

export function NewGroup({friendsList, selectedFriends ,setSelectedFriends}) {

    return(
        <>
        <FriendsContainer>
            {/* <h4>친구 목록</h4> */}
            <FriendList friendsList={friendsList} setSelectedFriends={setSelectedFriends} flag={true}/>
        </FriendsContainer>
        </>
    )
}

export function ExistGroup({groupsList, setSelectedGroup}) {

    return(
        <>
        <FriendsContainer>
            <GroupList groupsList={groupsList} setSelectedGroup={setSelectedGroup} flag={true}/>
        </FriendsContainer>
        </>
    )
}