import { PageTitle } from '../../commonStyles';
import {getUser} from './MyPageApi';
// import React, { useState, } from 'react';
import {  useLoaderData, Form } from "react-router-dom";
import { Button } from '../../Button';
import styled from "styled-components";
// import SearchKeyword from '../Town/SearchKeyword';


const StyledForm = styled(Form)`
  display:flex;
  flex-direction: column;
  gap: 2vh;
  width:100%;
  margin: auto;
`

export async function loader() {
  const user= await getUser();
  return { user };
}

export default function Mypage() {
  const loaderData = useLoaderData().user[0];
  // console.log(loaderData);
  // const [keyword, setKeyword] = useState(""); 
  // const [places, setPlaces] = useState([]); 
 

  return (
    <>
    {/* userName
    Survey
    userGender
    userAge
    userDeparturePoint */}
    
    <StyledForm style={{width:'60%'}} method="post" id="schedule-form">
      <PageTitle style={{fontSize:'3vh'}}>My Page</PageTitle>
      <PageTitle style={{fontSize:'3vh', margin:'0'}}>회원정보</PageTitle>
      <div style={{display:'flex', flex:'1'}}>
        <PageTitle style={{fontSize:'2vh', margin:'1vh'}}>이름</PageTitle>
        <input
          type="text"
          name="userName"
          placeholder={'이름'}
          defaultValue={loaderData.userName}
          style={{width:'100%', border:'1px solid #eee', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', fontSize:'2vh', flex:'1', marginLeft:'2vh'}}
          required
        />
      </div>
      <div style={{display:'flex',flex:'1'}}>
        <PageTitle style={{fontSize:'2vh', margin:'1vh'}}>성별</PageTitle>
        <input
          type="text"
          name="userGender"
          style={{width:'100%', border:'1px solid #eee', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',fontSize:'2vh', flex:'1', marginLeft:'2vh'}}
          placeholder={'성별'}
          defaultValue={loaderData.userGender}
        />
      </div>
      <div style={{display:'flex',flex:'1'}}>
        <PageTitle style={{fontSize:'2vh', margin:'1vh'}}>나이</PageTitle>
        <input
          type="text"
          name="userAge"
          style={{width:'100%', border:'1px solid #eee', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',fontSize:'2vh', flex:'1', marginLeft:'2vh'}}
          placeholder={'나이'}
          defaultValue={loaderData.userAge}
        />
      </div>
      <div style={{display:'flex',flex:'1'}}>
        <PageTitle style={{fontSize:'2vh', margin:'1vh'}}>서베이</PageTitle>
        <input
          type="text"
          name="UserInterest1"
          style={{width:'100%', border:'1px solid #eee', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',fontSize:'2vh', flex:'1'}}
          defaultValue={loaderData.UserInterest1}
        />
        <input
          type="text"
          name="UserInterest2"
          style={{width:'100%', border:'1px solid #eee', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',fontSize:'2vh', flex:'1'}}
          defaultValue={loaderData.UserInterest2}
        />
        <input
          type="text"
          name="UserInterest3"
          style={{width:'100%', border:'1px solid #eee', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',fontSize:'2vh', flex:'1'}}
          defaultValue={loaderData.UserInterest3}
        />
        <input
          type="text"
          name="UserInterest4"
          style={{width:'100%', border:'1px solid #eee', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',fontSize:'2vh', flex:'1'}}
          defaultValue={loaderData.UserInterest4}
        />
        <input
          type="text"
          name="UserInterest5"
          style={{width:'100%', border:'1px solid #eee', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',fontSize:'2vh', flex:'1'}}
          defaultValue={loaderData.UserInterest5}
        />
      </div>
      <div style={{display:'flex',flex:'1'}}>
        <PageTitle style={{fontSize:'2vh', margin:'1vh'}}>출발지</PageTitle>
        {/* <SearchKeyword keyword={keyword} setKeyword={setKeyword} places={places} setPlaces={setPlaces}/> */}
        <input
          type="text"
          name="userDeperturePoint"
          style={{width:'100%', border:'1px solid #eee', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',fontSize:'2vh', flex:'1'}}
          placeholder={'출발지'}
          defaultValue={loaderData.userDeperturePoint}
        />
      </div>
      <div style={{display:'flex', justifyContent:'flex-end'}}>
        <Button type='submit' style={{fontSize:'2vh'}} width='4rem' height='3rem' border='none' $background='#90B54C' color='white' > 저장 </Button> 
      </div>
    </StyledForm>
    
    </>
  );
}