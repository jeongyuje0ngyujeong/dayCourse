import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
// import {Button} from '../../Button';
import {ExistGroup, NewGroup} from './tapcontents'
import {getFriends, getGroups} from '../Friends/SearchFriend';
import {Button} from '../../Button';

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

const ResultContainer = styled.div`
    display: flex;
    width: 100%;
    height: 15%;
    padding: 5px 50px;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #ced4da;
    border-radius: 4px;
    min-height: 3rem;
    margin-top: 1rem;
`

export default function Group({group}) {
    const [activeTab, setActiveTab] = useState('Tab1');
    const [friendsList, setFriendsList ] = useState([]);
    const [groupsList, setGroupsList ] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await getGroups(); 
                setGroupsList(response);
                if (group) {
                    setSelectedGroup(response.find(g => g.groupId === group));
                }
                
            } catch (error) {
                console.error('그룹 목록을 불러오는 데 실패했습니다:', error);
            }
        };

        fetchGroups(); 
    }, [group]);

    const handleTab1Click = async (e,tab) => {
        e.preventDefault();
        setActiveTab(tab);
        try {
            const response = await getGroups(); 
            setGroupsList(response); 
        } catch (error) {
            console.error('친구 목록을 불러오는 데 실패했습니다:', error);
        }
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

    const handleDelete = (e) => {
        e.preventDefault(); 
        setSelectedGroup('');
    };

    return (
        <>
        <span>그룹</span>
        {/* users.length > 0 ? users.map((item) => item.name).join(', ') : '' */}
        {selectedGroup? (  
            <ResultContainer>
            <h4>{selectedGroup.groupName}</h4>
            <p>{selectedGroup.userNames.map((item) => item).join(', ')}</p>  
            <Button onClick={(e) => {handleDelete(e)}} $border='none'>X</Button>
            </ResultContainer>
        ) : (
            <ResultContainer>선택한 그룹이 없습니다.</ResultContainer>
        )}
        <div>
            <TabContainer>
                <Tab isActive={activeTab === 'Tab1'} onClick={(e) => handleTab1Click(e,'Tab1')}>기존 그룹</Tab>
                <Tab isActive={activeTab === 'Tab2'} onClick={(e) => handleTab2Click(e,'Tab2')}>새 그룹</Tab>
            </TabContainer>
            
            <Content>
                {activeTab === 'Tab1' && <ExistGroup groupsList={groupsList} setSelectedGroup={setSelectedGroup}/>}
                {activeTab === 'Tab2' && <NewGroup friendsList={friendsList} selectedFriends={selectedFriends} setSelectedFriends={setSelectedFriends} />}
            </Content>
        </div>
        <input type="hidden" name="groupId" value={selectedGroup.groupId} />
        </>
    );
}

        
