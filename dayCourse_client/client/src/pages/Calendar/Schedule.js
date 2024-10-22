import { Form, useLoaderData, redirect, Link} from "react-router-dom";
import { getSchedule} from "../../schedules";
import styled from "styled-components";
import { Button } from '../../Button';

export async function loader({ params }) {

  const { dateKey } = params;
  console.log(dateKey);

  const schedule = await getSchedule(dateKey);
  return { schedule };
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
  // const { schedule } = useLoaderData();
  // console.log(schedule);
  
  const loaderData = useLoaderData();
  const scheduleData = props.schedule || loaderData.schedule ;
  // console.log(scheduleData.schedule);

  // if (scheduleData.schedule)console.log(scheduleData.schedule.length);
  return (
    <div>
      {scheduleData && scheduleData.length > 0 ? scheduleData.map((event, index) => (
        <EventContainer key={index} id="schedule">
          <div>
            <h1>
              {event.dateKey ? (
                  <>
                    {event.dateKey}
                  </>
                ) : (
                  <i>No Date?</i>
                )}{" "}
            </h1>

            {event.group && (
              <p>
                <a
                  target="_blank"
                  href='#'
                >
                  {event.group}
                </a>
              </p>
            )}

            {event.notes && <p>{event.notes}</p>}
            
            <ButtonContainer>
              <Link to={`/schedules/${event.id}`}>
                <button type="submit">Edit</button>
              </Link>
              <Form
                method="post"
                action="destroy"
                // onSubmit={(event) => {
                //   if (
                //     !confirm(
                //       "Please confirm you want to delete this record."
                //     )
                //   ) {
                //     event.preventDefault();
                //   }
                // }}
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