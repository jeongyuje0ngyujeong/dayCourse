import { Form, useLoaderData, redirect } from "react-router-dom";
import { createSchedule, updateSchedule, getEvent,} from "../../schedules";
// import { Link } from 'react-router-dom'; 
import Group from './group';
import { PageTitle } from '../../commonStyles';
import MiniCalendar from '../Calendar/MiniCalendar';
import React, { useState, } from 'react';
import {Button} from '../../Button';


export async function action({ request, params }) {
  console.log(params);
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  console.log(updates);
  if (!updates.groupId) {
    alert('함께하는 그룹을 선택해주세요');
    return null;
  }

  const date= formData.get("dateKey");

  if (date) {
    const dateObject = new Date(date); 
    const dateKey = dateObject.toISOString().split('T')[0]; 
    
    if (params.planId){
      await updateSchedule(params.planId, updates);
      return redirect(`/main/schedules/${dateKey}/${params.planId}/town`);
    }
    else{
      const planId = (await createSchedule(dateKey, formData)).planId;
      // await updateSchedule(dateKey, updates);
      return redirect(`/main/schedules/${dateKey}/${planId}/town`);
    }
  } 
}

export async function loader({ params }) {
  // console.log(params);
  const { planId } = params;
  const event = await getEvent(planId);

  return { event };
}

export default function CreateSchedule() {
  
  
  
  const { event } = useLoaderData();
  console.log('event: ', event);
  
  let date;
  let group, planName;
  
  if (event) {
    date = event.dateKey;
    group = event.groupId;
    planName = event.planName;
  }
  
  const initialDate = date ? new Date(date) : new Date();

  const [selectedDate, setSelectedDate] = useState(`${initialDate.getFullYear()}-${String(initialDate.getMonth()+1).padStart(2, '0')}-${String(initialDate.getDate()).padStart(2,'0')}`);
  const [currentDate, setCurrentDate] = useState(initialDate);

  return (
    <>
      <div style={{display:'flex', gap: '3rem'}}>
        <div style={{display:'flex', flexDirection:'column',  flex:'1'}}>
          <PageTitle style={{fontSize:'3vh', marginBottom:'6vh'}}>일정 만들기</PageTitle>

          <MiniCalendar currentDate={currentDate} setCurrentDate={setCurrentDate} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
          
        </div>
        <div style={{flex:'2', marginTop:'2vh'}}>
          <div style={{display:'flex', width:'inherit', gap:'1rem'}} method="post" id="schedule-form">
            <Form style={{width:'100%'}} method="post" id="schedule-form">
              <div style={{flex:'1'}}>
                <PageTitle style={{fontSize:'2vh'}}>약속 날짜</PageTitle>
                <input
                  placeholder="년"
                  aria-label="년"
                  type="date"
                  name="dateKey"
                  defaultValue={date}
                  style={{width:'100%', border:'1px solid #eee', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', fontSize:'2vh'}}
                  required
                />
              </div>
              <div style={{flex:'1'}}>
                <PageTitle style={{fontSize:'2vh'}}>약속 이름</PageTitle>
                <input
                  type="text"
                  name="planName"
                  style={{width:'100%', border:'1px solid #eee', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',fontSize:'2vh'}}
                  placeholder={'약속의 이름을 입력해주세요.'}
                  defaultValue={planName}
                />
              </div>
              <Group group={group}/>
              {/* <div style={{display:'flex', marginTop:'2rem'}}> */}
              {/* <Button type='submit' style={{ position: 'fixed', bottom: '2%', right: '3.5%', zIndex:'1000', fontSize:'2vh'}} width='4rem' height='3rem' border='none' $background='#90B54C' color='white' > 다음 </Button>  */}
              <Button 
                  type='submit' 
                  style={{ position: 'fixed', bottom: '5%', right: '3%', zIndex:'1000', fontSize:'2vh' }} 
                  width='4rem' 
                  height='3rem' 
                  border='none' 
                  $background='#90B54C' 
                  color='white'
              > 
                  다음 
              </Button>  
              {/* </div> */}
            </Form>
          </div>
        </div>
      </div>
      </>
  );
}