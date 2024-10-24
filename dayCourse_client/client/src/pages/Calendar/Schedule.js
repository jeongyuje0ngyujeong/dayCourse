import { Form, useLoaderData, redirect, Link, useOutletContext } from "react-router-dom";
import { getSchedule, deleteSchedule, getSchedules} from "../../schedules";
import styled from "styled-components";
import {useState,useEffect } from 'react';
// import { Button } from '../../Button';

export async function loader({ params }) {
  const { dateKey } = params;

  const schedule = await getSchedule(dateKey);
  return  {schedule, dateKey} ;
}

export async function action(params) {
  const schedule = getSchedule(params.year,params.month,params.date); //eslint-disable-line no-unused-vars
  // return redirect(`/schedules/${schedule.id}/edit`);
  return redirect(`/home`);
}

const EventContainer = styled.div `
  border: 1px, solid;
  border-radius: 1rem;
  padding: 1rem;
  ${'' /* margin-bottom: 1rem; */}
  margin: 1rem 0;
  ${'' /* background: red; */}
`

const NoEventContainer = styled.div `
  display: flex;
  border: 1px, solid;
  border-radius: 1rem;
  margin: 1rem 0;
  min-height: 5rem;
  justify-content: center; 
  align-items: center;
`

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
  width: 100%;
`

export default function Schedule(props) {
  
  const { schedule, dateKey } = useLoaderData() || {};
  const [schedules, setSchedules] = useOutletContext() || [{}, () => {}];
  const [scheduleData, setScheduleData] = useState(props.schedule || schedule);
  console.log(scheduleData);

  // const loaderData = useLoaderData() || {};  // loaderData가 없을 때 빈 객체로 처리
  // const dateKey = loaderData.dateKey || null;  // dateKey를 loaderData에서 추출
  // const [schedules, setSchedules] = useOutletContext() || [{}, () => {}];  // useOutletContext가 없을 경우 빈 배열과 함수 할당
  // const [scheduleData, setScheduleData] = useState(
  //   props.schedule || loaderData.schedule || []  // scheduleData가 없으면 빈 배열로 초기화
  // );

  useEffect(() => {
    if (Object.keys(props).length === 0){ 
      console.log("찍히지 마");
      if (schedules.length === 0)    
        setScheduleData(schedule);
      else{
        setScheduleData(schedules.filter((schedule) => schedule.dateKey === dateKey ));
      }
    }
    else if (props.setModalContent){
      setSchedules(schedule);
      setScheduleData(schedule);
      // props.setModalContent(<Schedule schedule = {schedule} setModalContent = {props.setModalContent} fetchSchedules={props.fetchSchedules}/>);
    }
    //   props.setModalContent(<Schedule schedule = {newSchedule} setModalContent = {props.setModalContent} fetchSchedules={props.fetchSchedules}/>);
  }, [schedule, schedules]);

  return (
    <div>
      {scheduleData && scheduleData.length > 0 ? scheduleData.map((event, index) => (
        <EventContainer key={index} id="schedule">
          <div>
            <h3>
              {event.dateKey ? ( <>{event.planName}</> ) : (<i>No Date?</i> )}{" "}
            </h3>

            {event.groupName && (
              <p>
                {event.groupName}
              </p>
            )}

            {event.notes && <p>{event.notes}</p>}
            
            <ButtonContainer>
              <Link to={`/schedules/${event.planId}`}>
                <button type="submit">Edit</button>
              </Link>
              <Form
                method="post"
                action={`${event.planId}/destroy`}
                onSubmit={async(e) => {
                  // e.preventDefault();
                  const newSchedules = await deleteSchedule(event.planId);
                  const newSchedule = await getSchedule(event.dateKey);
                  
                  if (Object.keys(props).length === 0){
                    setSchedules(newSchedules);
                  }
                  else if (props.setModalContent)
                  {
                    // props.fetchSchedules();
                    props.setModalContent(<Schedule schedule = {newSchedule} setModalContent = {props.setModalContent} fetchSchedules={props.fetchSchedules}/>);
                  }
                }}
              >
                <button type="submit">Delete</button>
              </Form>
            </ButtonContainer>
          </div>
        </EventContainer>
      )) : <NoEventContainer><div>일정 없음</div></NoEventContainer>}
    </div>
  );
}