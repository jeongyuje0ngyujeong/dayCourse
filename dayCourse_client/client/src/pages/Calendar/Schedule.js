import { Form, useLoaderData, redirect, Link, useOutletContext } from "react-router-dom";
import { deleteSchedule, getSchedule, } from "../../schedules";
import styled from "styled-components";
// import {useState,useEffect } from 'react';

// import { Button } from '../../Button';

export async function loader({ params }) {
  const { dateKey } = params;

  const schedule = await getSchedule(dateKey);
  return { schedule };
}

export async function action(params) {
  const schedule = getSchedule(params.year,params.month,params.date); //eslint-disable-line no-unused-vars
  // return redirect(`/schedules/${schedule.id}/edit`);
  return redirect(`/main/home`);
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
  
  const loaderData = useLoaderData();
  
  const [schedules, setSchedules] = useOutletContext() || [null, () => {}];
  const scheduleData = props.schedule || loaderData.schedule;

  console.log(loaderData, schedules, {schedules: [scheduleData]});

  return (
    <div>
      {scheduleData && scheduleData.length > 0 ? scheduleData.map((event, index) => (
        <EventContainer key={index} id="schedule">
          <div>
            <h3>
              {event.dateKey ? (<>{event.planName} </>) : (<i>No Date?</i>)}{" "}
            </h3>

            {event.groupName && (<p>{event.groupName}</p>)}
            {event.notes && <p>{event.notes}</p>}
            
            <ButtonContainer>
              <Link to={`/main/PlacePages/${event.planId}`}>
                <button type="submit">Edit</button>
              </Link>
              <Form
                method="post"
                action={`${event.planId}/destroy`}
                onSubmit={async(e) => {
                  const newSchedules = await deleteSchedule(event.planId);
                  
                  await setSchedules(newSchedules);

                  if (props.setModalContent)
                  {
                    const newSchedule = await getSchedule(event.dateKey);
                    props.fetchSchedules();
                    props.setModalContent(
                      <Schedule 
                        schedule = {newSchedule} 
                        setModalContent = {props.setModalContent} 
                        fetchSchedules={props.fetchSchedules}  
                      />
                    );
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