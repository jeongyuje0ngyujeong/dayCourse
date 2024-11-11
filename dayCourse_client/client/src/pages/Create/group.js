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

const Tab1 = styled.button`
    flex: 1;
    ${'' /* padding: 8px 20px; */}
    cursor: pointer;
    border: none;
    ${'' /* outline: none; */}
    border-radius: 10px 0 0 0;
    ${'' /* background-color: ${({ isActive }) => (isActive ? '#eee' : 'white')}; */}
    border-bottom: ${({ isActive }) => (isActive ? '1px solid black' : 'none')};
    color: black;
    &:hover {
        background-color: #f9f9f9;
    }
`;
const Tab2 = styled.button`
    flex: 1;
    ${'' /* padding: 8px 20px; */}
    cursor: pointer;
    border: none;
    ${'' /* outline: none; */}
    border-radius: 0 10px 0 0;
    ${'' /* background-color: ${({ isActive }) => (isActive ? '#eee' : 'white')}; */}
    border-bottom: ${({ isActive }) => (isActive ? '1px solid black' : 'none')};
    color: black;
    &:hover {
        background-color: #f9f9f9;
    }
`;

const Content = styled.div`
    display: flex;
    ${'' /* top: -10px; */}
    padding: 15px 0;
    
    ${'' /* border: 1px solid #eee; */}
    ${'' /* border-top: none; */}
    ${'' /* max-height: 20rem; */}
`;

const ResultContainer = styled.div`
    display: flex;
    flex: 1;
    ${'' /* height: 100%; */}
    ${'' /* padding: 0 50px; */}
    align-items: center;
    justify-content: center;
    border: 1px solid #ccc;
    border-radius: 10px;
    min-width:15.7rem;
    height: 100%;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    padding: 1vh
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
const ExistContainer = styled.div`
    display: flex;
    width: 100%;
    flex-direction: column;
    height: 100%;
    padding: 2vh 2vh;
    align-items: center;
    justify-content: space-between;
    border-radius: 10px;
    border: 1px solid #ccc;
    outline-offset: 3px;
    ${'' /* position: relative; */}
    height:'100%'
  
`

const TextButton = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
`;

// const Image = styled.img`
//     ${'' /* width: 200px; */}
//     height: 15vh;
//     margin: 5px;
//     border-radius: 5px;
//     object-fit: cover; 
// `;

// const ImgContainer = styled.div`
//   display: flex;
//   flex-wrap: wrap;
//   gap: 5px; /* 아이템 간격 */
//   width: 200px; /* 부모 컨테이너 너비 설정 */
//   justify-content: center;
// `;

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px; /* 아이템 간의 간격 설정 */
  width: 60%; 
  ${'' /* height:50%; */}
  ${'' /* height: 400px;  */}
  margin-bottom: 1vh;
  justify-content: center;
  
  ${'' /* flex: 0; */}
`;

const ImageItem = styled.div`
  flex: 1 1 calc(50% - 8px); /* 각 아이템을 50% 너비로 설정 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* 이미지가 영역을 벗어날 경우 잘리도록 설정 */
  ${'' /* border: 2px solid #ccc; */}
  border-radius: 20px;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: cover; /* 이미지가 영역에 맞게 조정되도록 설정 */
`;

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
                        <ExistContainer>
                            <div style={{display:'flex', width:'100%', felx: '1', justifyContent:'space-between', alignItems:'center'}}>
                                <PageTitle style={{fontSize:'2vh', width:'10vh', textAlign:'center',marginBottom:'1vh',marginTop:'0', color:'white', borderRadius:'10px', padding:'1vh', background:'#90B54C'}}>{selectedGroup.groupName}</PageTitle>
                                <Button style={{marginBottom:'0'}} onClick={(e) => {handleDelete(e)}} $border='none'>X</Button>
                            </div>
                            <Container>
                                <ImageItem>
                                    <Image src="/profiles/frontTooth.PNG" alt="Item 1" />
                                </ImageItem>
                                <ImageItem>
                                    <Image src="/profiles/glasses.PNG" alt="Item 2" />
                                </ImageItem>
                                <ImageItem>
                                    <Image src="/profiles/shyness.PNG" alt="Item 3" />
                                </ImageItem>
                                <ImageItem>
                                    <Image src="/profiles/twoChin.PNG" alt="Item 4" />
                                </ImageItem>
                            </Container>
                            <div style={{display:'flex', width:'100%', alignItems:'center', borderRadius:'10px', background:'#ccc', textAlign:'center'}}>
                                <PageTitle style={{fontSize:'2vh', width:'100%', }}>{selectedGroup.userNames.map((item) => item).join(', ')}</PageTitle>  
                            </div>
                        </ExistContainer>
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
                            <input name="groupName" style={{width:'100%'}} value = {groupName} onChange={(e) => setGroupName(e.target.value)}  placeholder='그룹명을 입력해주세요' required/>
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
            <div style={{flex:'2', border:'1px solid #ced4da', borderRadius:'10px'}}>
                <TabContainer>
                    <Tab1 isActive={activeTab === 'Tab1'} onClick={(e) => handleTab1Click(e,'Tab1')}>기존 그룹</Tab1>
                    <Tab2 isActive={activeTab === 'Tab2'} onClick={(e) => handleTab2Click(e,'Tab2')}>새 그룹</Tab2>
                </TabContainer>
                
                <Content>
                    {activeTab === 'Tab1' && <ExistGroup groupsList={groupsList} setSelectedGroup={setSelectedGroup}/>}
                    {activeTab === 'Tab2' && <NewGroup friendsList={friendsList} selectedFriends={selectedFriends} setSelectedFriends={setSelectedFriends} />}
                </Content>
            </div>
        </div>
        <input type="hidden" name="groupId" value={selectedGroup.groupId}/>
        </>
    );
}

        
