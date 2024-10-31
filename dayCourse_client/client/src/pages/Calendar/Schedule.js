import { Form, redirect, Link, useOutletContext } from "react-router-dom";
import { deleteSchedule, getSchedule, } from "../../schedules";
import styled from "styled-components";
import {useState, useEffect} from 'react';
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
  border: 2px solid #ccc;
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
  
  // const loaderData = useLoaderData();
  // const loaderData = useLoaderData();
  
  const [selectedSchedules, groupedSchedules, setGroupedSchedules] = useOutletContext() || [props.selectedSchedules, props.groupedSchedules, props.setGroupedSchedules];

  // console.log(selectedSchedules);

  function updateSchedulesForDate(dateKey, planId) {
    setGroupedSchedules(prevSchedules => {
      const filteredEvents = prevSchedules[dateKey]?.filter(event => event.planId !== planId);
      return {
          ...prevSchedules,
          [dateKey]: filteredEvents
      };
    });
}

  return (
    <div>
      {selectedSchedules && selectedSchedules.length > 0 ? selectedSchedules.map((event, index) => (
      {selectedSchedules && selectedSchedules.length > 0 ? selectedSchedules.map((event, index) => (
        <EventContainer key={index} id="schedule">
          <div>
            <h3>
              {event.dateKey ? (<>{event.planName} </>) : (<i>No Date?</i>)}{" "}
            </h3>

            {event.groupName && (<p>{event.groupName}</p>)}
            {event.notes && <p>{event.notes}</p>}
            
            <ButtonContainer>
              <Link to={`/main/PlacePage/${event.planId}`}>
                <button type="submit">상세일정</button>
              </Link>
              <Form
                method="post"
                action={`${event.planId}/destroy`}
                onSubmit={async(e) => {
                  e.preventDefault()

                  if (`${event.start_userId}` === sessionStorage.getItem('id')){
                    const result = await deleteSchedule(event.planId);
                    // console.log(result);
                    if (result === 'success'){
                      updateSchedulesForDate(event.dateKey, event.planId)
                    
                      if (props.setModalContent)
                      {
                        const newSchedule = groupedSchedules[event.dateKey];
                        props.setModalContent(
                          <Schedule 
                            schedule = {newSchedule} 
                            setModalContent = {props.setModalContent} 
                          />
                        );
                      }
                    }
                    
                  }
                  
                }}
              >
              {String(event.start_userId) === sessionStorage.getItem('id') ?
                <button type="submit">Delete</button>:null}
              </Form>
            </ButtonContainer>
          </div>
        </EventContainer>
      )) : <NoEventContainer><div>일정 없음</div></NoEventContainer>}
    </div>
  );
}