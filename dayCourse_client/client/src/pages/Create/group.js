import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
// import {Button} from '../../Button';
import {ExistGroup, NewGroup} from './tapcontents'
import {getFriends, getGroups} from '../Friends/SearchFriend';

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
    flex: 1;
    ${'' /* height: 100%; */}
    ${'' /* padding: 0 50px; */}
    align-items: center;
    justify-content: center;
    border: 1px solid #ced4da;
    border-radius: 10px;
    min-width:15.7rem;
    height: 100%;
    ${'' /* margin-top: 1rem; */}
`

const NewContainer = styled.div`
    display: flex;
    width: 100%;
    flex-direction: column;
    height: 100%;
    ${'' /* padding: 0 50px; */}
    align-items: center;
    ${'' /* justify-content: center; */}
    border-radius: 10px;
    padding: 0 0.5rem;
    ${'' /* margin-top: 1rem; */}
`

const TextButton = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
`;

// const GroupContainer = styled.div`
//     margin: 0 10px;
//     ${'' /* padding: 0px 10px 10px 10px; */}
//     flex: 1;
//     display: flex;
//     justify-content: center;
//     flex-direction: column;
// `;

export default function Group({group}) {
    const [activeTab, setActiveTab] = useState('Tab1');
    const [friendsList, setFriendsList ] = useState([]);
    const [groupsList, setGroupsList ] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await getGroups(); 
                setGroupsList(response);
                console.log('GroupsList: ',response);
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

    return (
        <>
        <PageTitle>함께하는 사람</PageTitle>
        {/* users.length > 0 ? users.map((item) => item.name).join(', ') : '' */}
        <div style={{display:'flex', gap:'1rem',height:'40vh'}}>
            { activeTab === 'Tab1' ? (
                <>
                {selectedGroup? (  

                    <ResultContainer>
                        <h4>{selectedGroup.groupName}</h4>
                        <p>{selectedGroup.userNames.map((item) => item).join(', ')}</p>  
                        <Button onClick={(e) => {handleDelete(e)}} $border='none'>X</Button>
                    </ResultContainer>
                    
                ) : (
                    <ResultContainer>선택한 그룹이 없습니다.</ResultContainer>
                )}  
                </>
            ):(
                <>
                <ResultContainer>
                <NewContainer>
                    <TextButton>
                    <PageTitle>그룹명</PageTitle>
                        <Button 
                            style={{ height: '2rem', width: '5rem'}} 
                            onClick={(e) => {handleOnClick(e)}}
                        >그룹 생성
                        </Button>
                    </TextButton>
                    <input name="groupName" style={{width:'100%'}} value = {groupName} onChange={(e) => setGroupName(e.target.value)}  placeholder='그룹명을 입력해주세요'/>
                    <TextButton>
                        <PageTitle>선택한 친구</PageTitle>
                        <h4>{selectedFriends.length}명</h4>
                    </TextButton>            
                    {selectedFriends.length > 0 && 
                        <FriendList friendsList={selectedFriends} setSelectedFriends={setSelectedFriends} flag={false}/>
                    }  
                </NewContainer>
                </ResultContainer>
                </>
            )
            }
            <div style={{flex:'2', border:'1px solid #eee', borderRadius:'10px'}}>
                <TabContainer>
                    <Tab isActive={activeTab === 'Tab1'} onClick={(e) => handleTab1Click(e,'Tab1')}>기존 그룹</Tab>
                    <Tab isActive={activeTab === 'Tab2'} onClick={(e) => handleTab2Click(e,'Tab2')}>새 그룹</Tab>
                </TabContainer>
                
                <Content>
                    {activeTab === 'Tab1' && <ExistGroup groupsList={groupsList} setSelectedGroup={setSelectedGroup}/>}
                    {activeTab === 'Tab2' && <NewGroup friendsList={friendsList} selectedFriends={selectedFriends} setSelectedFriends={setSelectedFriends} />}
                </Content>
            </div>
        </div>
    );
}

        
