import axios from 'axios';
import styled from 'styled-components';
import FriendList from '../Friends/FriendList';
const BASE_URL = process.env.REACT_APP_BASE_URL; 

const FriendsContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    margin: 0 10px;
    padding: 0px 10px 10px 10px;
    background: #eee;
`;
const GroupContainer = styled.div`
    margin: 0 10px;
    padding: 0px 10px 10px 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
`;

const TextButton = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export function NewGroup({friendsList, selectedFriends ,setSelectedFriends, setSelectedGroup}) {
    return(
        <>
        <FriendsContainer>
            <h4>친구 목록</h4>
            <FriendList friendsList={friendsList} setSelectedFriends={setSelectedFriends} flag={true}/>
        </FriendsContainer>
        
        <GroupContainer>
            <TextButton>
                <h4>그룹명</h4>
                <button 
                    style={{ height: '2.5rem' }} 
                    onClick={(e) => {
                        e.preventDefault();
                        setSelectedGroup(selectedFriends);
                    }}
                >그룹 생성
                </button>
            </TextButton>
            <input  name="groupName" placeholder='그룹명을 입력해주세요'/>
            <h4>선택한 친구</h4>
            <FriendList friendsList={selectedFriends} setSelectedFriends={setSelectedFriends} flag={false}/>
        </GroupContainer>
        </>
    )
}

export function ExistGroup() {
    return(
        <>
        {/* <FriendList/> */}
        </>
    )
}