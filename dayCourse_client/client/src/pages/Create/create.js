import { Form, useLoaderData, redirect } from "react-router-dom";
import { createSchedule, updateSchedule, getEvent,} from "../../schedules";
import { Link } from 'react-router-dom'; 
import Group from './group';
import { PageTitle } from '../../commonStyles';
import MiniCalendar from '../Calendar/MiniCalendar';
import React, { useState, } from 'react';

export async function action({ request, params }) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  const date= formData.get("date");

  if (date) {
    const dateObject = new Date(date); 
    const dateKey = dateObject.toISOString().split('T')[0]; 
    
    if (params.id){
      await updateSchedule(params.id, updates);
      return redirect(`/main/schedules/${dateKey}/${params.id}/town`);
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
  const { id } = params;
  const event = await getEvent(id);

  return { event };
}

export default function CreateSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
 
  const [selectedDate, setSelectedDate] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2,'0')}`);

  
  const { event } = useLoaderData();
  console.log('event: ', event);

  let date;
  let group, planName;

  if (event) {
    date = event.dateKey;
    group = event.groupId;
    planName = event.planName;
  }

  return (
    <>
          <PageTitle style={{fontSize:'3vh'}}>일정 만들기</PageTitle>
      <div style={{display:'flex', gap: '3rem'}}>
        <div style={{display:'flex', flexDirection:'column',  flex:'1'}}>
          <PageTitle style={{fontSize:'3vh'}}>{currentDate.getFullYear()}. {String(currentDate.getMonth() + 1).padStart(2, '0')}</PageTitle>
          <MiniCalendar currentDate={currentDate} setCurrentDate={setCurrentDate} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
          <p>
            <button type="submit">Save</button>
            <Link to="/main/home">
              <button type="button">Cancel</button>
            </Link>
          </p>
        </div>
        <div style={{flex:'2'}}>
          <Form style={{display:'flex', width:'inherit', gap:'1rem'}} method="post" id="schedule-form">
            <div style={{flex:'1'}}>
              <PageTitle>약속 날짜</PageTitle>
              <input
                placeholder="년"
                aria-label="년"
                type="date"
                name="date"
                defaultValue={date}
                style={{width:'100%'}}
                required
              />
            </div>
            <div style={{flex:'1'}}>
              <PageTitle>약속 이름</PageTitle>
              <input
                type="text"
                name="planName"
                style={{width:'100%'}}
                placeholder={'약속의 이름을 입력해주세요.'}
                defaultValue={planName}
              />
            </div>
          </Form>
          <Group group={group}/>
        </div>
      </div>
      </>
  );
}