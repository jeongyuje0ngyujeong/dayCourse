import { Form, useLoaderData, redirect, } from "react-router-dom";
import { createSchedule, updateSchedule, getEvent,} from "../../schedules";
import { Link } from 'react-router-dom'; 
import Group from './group';
import { PageTitle } from '../../commonStyles';

export async function action({ request, params }) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  const date= formData.get("date");

  if (date) {
    const dateObject = new Date(date); 
    const dateKey = dateObject.toISOString().split('T')[0]; 
    
    if (params.id){
      await updateSchedule(params.id, updates);
      return redirect(`/main/home/schedules/${dateKey}`);
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
    <PageTitle>일정</PageTitle>
    <Form method="post" id="schedule-form">
      <span>약속 날짜</span>
      <p>
        <input
          placeholder="년"
          aria-label="년"
          type="date"
          name="date"
          defaultValue={date}
          style={{width:'15rem'}}
          required
        />
      </p>
      <span>약속 이름</span>
      <p>
      <label>
        <input
          type="text"
          name="planName"
          style={{width:'15rem'}}
          placeholder={'약속의 이름을 입력해주세요.'}
          defaultValue={planName}
        />
      </label>
      </p>

      <Group group={group}/>

      <p>
        <button type="submit">Save</button>
        <Link to="/main/home">
          <button type="button">Cancel</button>
        </Link>
      </p>
    </Form>
    </>
  );
}