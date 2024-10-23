import { Form, useLoaderData, redirect, Link, useOutletContext } from "react-router-dom";
import { getSchedule, deleteSchedule, getSchedules } from "../../schedules";
import styled from "styled-components";
import { useState, useEffect } from 'react';

export async function loader({ params }) {
  const { dateKey } = params;
  const schedule = await getSchedule(dateKey);
  return { schedule };
}

export async function action(params) {
  // Removed unnecessary code
  return redirect(`/home`);
}

const EventContainer = styled.div`
  border: 1px solid; /* Fixed border style */
  border-radius: 1rem;
  padding: 1rem;
  margin: 1rem 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
  width: 100%;
`;


export default function Schedule(props) {
  const loaderData = useLoaderData();
  const [schedules, setSchedules] = useOutletContext() || [null, () => {}];
  const [scheduleData, setScheduleData] = useState(props.schedule || loaderData.schedule);

  useEffect(() => {
    setScheduleData(loaderData.schedule); 
  }, [loaderData, schedules]);

  const handleDelete = async (eventId, dateKey) => {
    try {
      await deleteSchedule(eventId); // Delete the schedule
      const updatedSchedules = await getSchedule(dateKey); // Fetch the updated schedules
      setScheduleData(updatedSchedules); // Update the state with the new schedules
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <div>
      {scheduleData && scheduleData.length > 0 ? scheduleData.map((event) => (
        <EventContainer key={event.planId} id="schedule">
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

            {event.groupName && <p>{event.groupName}</p>}
            
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
                    setScheduleData(newSchedule);
                  }
                  else if (props.setModalContent)
                  {
                    props.fetchSchedules();
                    props.setModalContent(<Schedule schedule = {newSchedule} setModalContent = {props.setModalContent} fetchSchedules={props.fetchSchedules}/>);
                  }
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