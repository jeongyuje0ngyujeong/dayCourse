import { Form, useLoaderData, redirect, Link, useOutletContext } from "react-router-dom";
import { getSchedule, deleteSchedule, getSchedules} from "../../schedules";
import styled from "styled-components";
import {useState,useEffect } from 'react';
// import { Button } from '../../Button';

export async function loader({ params }) {
  const { dateKey } = params;

  const schedule = await getSchedule(dateKey);
  return { schedule };
}

export async function action(params) {
  const schedule = getSchedule(params.year,params.month,params.date); //eslint-disable-line no-unused-vars
  // return redirect(`/schedules/${schedule.id}/edit`);
  return redirect(`/home`);
}
// export async function action(params) {
//   const schedule = getSchedule(params.year,params.month,params.date);

//   return redirect(`/home`);
// }

const EventContainer = styled.div `
  border: 1px, solid;
  border-radius: 1rem;
  padding: 1rem;
  ${'' /* margin-bottom: 1rem; */}
  margin: 1rem 0;
  ${'' /* background: red; */}

`

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
  width: 100%;
`


export default function Schedule(props) {
  
  const loaderData = useLoaderData();
  // const [scheduleData, setScheduleData] = useState(props.schedule || loaderData.schedule) ;
  
  const [schedules, setSchedules] = useOutletContext() || [null, () => {}];
  const scheduleData = props.schedule || loaderData.schedule;

  return (
    <div>
      {scheduleData && scheduleData.length > 0 ? scheduleData.map((event, index) => (
        <EventContainer key={index} id="schedule">
          <div>
            <h3>
              {event.dateKey ? (
                  <>
                    {event.planName}
                  </>
                ) : (
                  <i>No Date?</i>
                )}{" "}
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
                  
                  if (!props){
                    setSchedules(newSchedules);
                  }
                  else if (props.setModalContent)
                  {
                    props.setModalContent(<Schedule schedule = {newSchedule} setModalContent = {props.setModalContent}/>);
                  }
                  // let schedules = await localforage.getItem("schedules");
                  // let index = schedules.findIndex(schedule => String(schedule.planId) === id);

                  // if (index > -1) {
                  //     schedules.splice(index, 1);
                  //     await set(schedules);
                  // }
                  // if (props){
                  //   props.setSchedules(schedules);
                  // }
                  // console.log("Parameters:", params);

                  // await deleteSchedule(params.eventId);

                  // if (params.dateKey){
                  //     return redirect(`/home/schedules/${params.dateKey}`);
                  // }
                  // else{
                  //     return redirect(`/calendar`);
                  // }
                  // props.setModalContent(false);
                  // props.setModalContent(false);
                  // props.setModalIsOpen(true);

                  // const schedule = await getSchedule(event.dateKey);

                  // if (params.dateKey){
                  //     return redirect(`/home`);
                  // }
                  // else{
                  //     return redirect(`/calendar`);
                  // }
                  // if (
                  //   !confirm(
                  //     "Please confirm you want to delete this record."
                  //   )
                  // ) {
                  // e.preventDefault();
                  // }
                }}
              >
                <button type="submit">Delete</button>
              </Form>
            </ButtonContainer>
          </div>
        </EventContainer>
      )) : <div>일정 없음</div>}
    </div>
  );
}