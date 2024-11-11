// PlacePage.js
import { useLoaderData, } from "react-router-dom";
import {useState} from 'react';
import KakaoMap from './KakaoMap';
import { Button } from '../../Button';
import LandingPage from './LandingPage';
import { getEvent } from "../../schedules";
import { Form } from "react-router-dom";
import { SocketProvider } from '../../SocketContext';
import {PageTitle} from '../../commonStyles';
import styled from 'styled-components';

export async function loader({ params }) {
    const { planId } = params;
  
    const plan = await getEvent(planId);
    console.log(plan);
    return { plan };
}

const UsersContainer = styled.div`
    border:1px solid #eee; 
    width:30vh;
    height:100%;
    padding:0 1rem; 
    borderRadius:10px; 
    boxShadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    maxHeight:15vh;
    overflow:auto; 

    &::-webkit-scrollbar {
    display: none; 
    }
`;
  
const PlacePage = () => {
    const loaderData = useLoaderData().plan;
    const userId = sessionStorage.getItem('userId');
    const id = sessionStorage.getItem('id');
    const planId = loaderData.planId;
    const place = loaderData.place;
    const [uniqueUsers, setUniqueUsers] = useState([]);
    // console.log(loaderData.start_userId, userId);
    return (
        <>
        <SocketProvider userId={userId} planId={planId}>
            <div style={{display:'flex', justifyContent: 'space-between', width:'75%', alignItems:'center', height:'15vh', marginBottom:'3vh'}}>
                <div style={{display:'flex', flexDirection:'column',  height:'100%', padding:'0 1rem 1rem 1rem', borderRadius:'10px'}}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: '1rem'}}>
                        <PageTitle style={{fontSize:'4vh', margin:'0 0 1rem 0'}}>{loaderData.planName}</PageTitle>
                        {String(loaderData.start_userId) === id ?(
                            <Form style={{fontSize:'4vh', display:'flex', margin:'0 0 1rem 0'}} action={`/main/schedules/create/${planId}`}>
                                <Button style={{  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', fontSize:'2vh'}} type='submit' width='10vh' height='5vh' color='gray' $border='1px solid #eee' >일정 수정</Button>
                            </Form>  
                        ):null}
                    </div>
                    <PageTitle style={{fontSize:'3vh', margin:'0'}}>{loaderData.town}</PageTitle>
                </div>
                <UsersContainer>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <PageTitle style={{marginBottom:'1vh', fontSize:'2vh'}}>접속 사용자</PageTitle>
                        <PageTitle style={{marginBottom:'1vh', fontSize:'2vh'}}>{uniqueUsers.length}명</PageTitle>
                    </div>
                    <ul style={{padding: '0 1rem', margin: '0'}}>
                        {uniqueUsers.map(user => (
                            <li  key={user.userId} style={{ fontSize:'2vh', color: user.color }}>{user.name}</li>
                        ))}
                    </ul>
                </UsersContainer>
            </div>
            <LandingPage userId={userId} planId={planId} place={place} context={loaderData} setUniqueUsers={setUniqueUsers}></LandingPage>
            <KakaoMap></KakaoMap>
        </SocketProvider>

        {/* 현재 접속한 사용자 목록 표시 */}
        </>
    );
};

export default PlacePage;