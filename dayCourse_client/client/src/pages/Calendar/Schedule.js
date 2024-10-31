import { Form, redirect, Link, useOutletContext } from "react-router-dom";
import { deleteSchedule, getSchedule, } from "../../schedules";
import styled from "styled-components";
import {useState, useEffect} from 'react';
// import {useState,useEffect } from 'react';

// import { Button } from '../../Button';

export async function loader({ params }) {
  const { year, month, date } = params;
  const schedule = await getSchedule(year, month, date);
  return { schedule };
}

export async function action(params) {
  const schedule = getSchedule(params.year,params.month,params.date);
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
  
  const [selectedSchedules, groupedSchedules, setGroupedSchedules] = useOutletContext() || [null, () => {}];

  console.log(selectedSchedules);

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
                  const result = await deleteSchedule(event.planId);
                  if (result === 'success' && `${event.start_userId}` === sessionStorage.getItem('id'))
                    updateSchedulesForDate(event.dateKey, event.planId)

                  if (`${event.start_userId}` === sessionStorage.getItem('id')){
                    const result = await deleteSchedule(event.planId);
                    // console.log(result);
                    if (result === 'success') {
                        updateSchedulesForDate(event.dateKey, event.planId, (newSchedules) => {
                            if (props.setModalContent) {
                                const newSchedule = newSchedules[event.dateKey];
                                props.setModalContent(
                                    <Schedule 
                                        selectedSchedules={newSchedule} 
                                        groupedSchedules={newSchedules} 
                                        setGroupedSchedules={setGroupedSchedules} 
                                        setModalContent={props.setModalContent}
                                    />
                                );
                            }
                        });
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