import React, {useState} from 'react';
import styled from 'styled-components';
// import {Button} from '../../Button';
import {ExistGroup, NewGroup} from './tapcontents'
import {getFriends} from '../Friends/SearchFriend';

const TabContainer = styled.div`
    margin-top: 1rem;
    display: flex;
    ${'' /* border-bottom: 1px solid #ccc; */}
`;

const Tab = styled.button`
    flex: 1;
    padding: 8px 20px;
    cursor: pointer;
    border: none;
    outline: none;
    border-radius: 0;
    ${'' /* background-color: ${({ isActive }) => (isActive ? '#eee' : 'white')}; */}
    border-bottom: ${({ isActive }) => (isActive ? '1px solid black' : 'none')};
    color: black;
    &:hover {
        background-color: #f9f9f9;
    }
`;

const Content = styled.div`
    display: flex;
    top: -10px;
    padding: 20px 0;
    border: 1px solid #eee;
    border-top: none;
    max-height: 20rem;
`;

export default function Group({setSelectedGroup}) {
    const [activeTab, setActiveTab] = useState('Tab1');
    const [friendsList, setFriendsList ] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);

    const handleTab1Click = (e,tab) => {
        e.preventDefault();
        setActiveTab(tab);
    };

    const handleTab2Click = async (e,tab) => {
        e.preventDefault();
        setActiveTab(tab);
        try {
            const response = await getFriends(); 
            setFriendsList(response.friendList); // 가져온 친구 목록을 friends 상태로 업데이트
        } catch (error) {
            console.error('친구 목록을 불러오는 데 실패했습니다:', error);
        }
    };

    return (
        <div>
            <TabContainer>
                <Tab isActive={activeTab === 'Tab1'} onClick={(e) => handleTab1Click(e,'Tab1')}>기존 그룹</Tab>
                <Tab isActive={activeTab === 'Tab2'} onClick={(e) => handleTab2Click(e,'Tab2')}>새 그룹</Tab>
            </TabContainer>
            
            <Content>
                {activeTab === 'Tab1' && <ExistGroup setSelectedGroup={setSelectedGroup}/>}
                {activeTab === 'Tab2' && <NewGroup friendsList={friendsList} selectedFriends={selectedFriends} setSelectedFriends={setSelectedFriends} />}
            </Content>
        </div>
    );
}

        
