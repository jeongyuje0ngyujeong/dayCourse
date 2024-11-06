import { Form, redirect, Link, useOutletContext } from "react-router-dom";
import { deleteSchedule, getSchedule, } from "../../schedules";
import styled from "styled-components";
import { Button } from '../../Button';

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
  display:flex;
  border: 2px solid #eee;
  border-radius: 1rem;
  padding: 0.2rem 2rem;
  background: white;
  ${'' /* background: white; */}
  height: 8.5rem;
  min-height: 8.5rem;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  justify-content: space-between; 
  align-items: center;
  ${'' /* background: red; */}
`

const NoEventContainer = styled.div `
  display: flex;
  ${'' /* border: 2px solid #ccc; */}
  border-radius: 1rem;
  margin: 1rem 0;
  ${'' /* min-height: 35rem; */}
  padding: 1rem;
  justify-content: center; 
  align-items: center;
`

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  ${'' /* flex:1; */}
`

export default function Schedule(props) {
  
  // const loaderData = useLoaderData();
  
  const [selectedSchedules, setGroupedSchedules] = useOutletContext() || [props.selectedSchedules, props.setGroupedSchedules];
  // const [selectedSchedules, groupedSchedules, setGroupedSchedules] = useOutletContext() || [props.selectedSchedules, props.groupedSchedules, props.setGroupedSchedules];
  // console.log(selectedSchedules);

  function updateSchedulesForDate(dateKey, planId, callback) {
    setGroupedSchedules(prevSchedules => {
        const filteredEvents = prevSchedules[dateKey]?.filter(event => event.planId !== planId);
        const newSchedules = {
            ...prevSchedules,
            [dateKey]: filteredEvents
        };
        
        if (callback) callback(newSchedules);
        
        return newSchedules;
    });

  }

  return (
    <>
      {selectedSchedules && selectedSchedules.length > 0 ? selectedSchedules.map((event, index) => (
        <EventContainer key={index} id="schedule">
            <h3>
              {event.dateKey ? (<>{event.planName} </>) : (<i>No Date?</i>)}{" "}
            </h3>

            {event.groupName && (<p>{event.groupName}</p>)}
            
            <ButtonContainer>
              <Link to={`/main/PlacePage/${event.planId}`}>
                <Button style={{fontFamily: 'NPSfontBold'}} onClick={() => {}}  width='5rem'>상세일정</Button>
              </Link>
              <Form
                method="post"
                action={`${event.planId}/destroy`}
                onSubmit={async(e) => {
                  e.preventDefault()

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
                <Button type="submit">X</Button>:null}
              </Form>
            </ButtonContainer>
        </EventContainer>
      )) : <NoEventContainer><h3>일정 없음</h3></NoEventContainer>}
    </>
  );
}