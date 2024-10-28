import { Form, useLoaderData, redirect, } from "react-router-dom";
import { createSchedule, updateSchedule, getEvent,} from "../../schedules";
import { Link } from 'react-router-dom'; 

export async function action({ request, params }) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  const year= formData.get("year");
  const month= formData.get("month");
  const date= formData.get("date");
  const dateKey = `${year}-${month}-${date}`;
  
  if (params.id){
    await updateSchedule(dateKey, updates);
    return redirect(`/home/schedules/${dateKey}`);
  }
  else{
    const planId = (await createSchedule(dateKey, formData)).planId;
    // await updateSchedule(dateKey, updates);
    return redirect(`/main/schedules/${dateKey}/${planId}/town`);
  }
}

export async function loader({ params }) {
  console.log(params);
  const { id } = params;
  const event = await getEvent(id);

  return { event };
}

export default function CreateSchedule() {
  const { event } = useLoaderData();

  let year, month, date;
  let group, planName, town;

  if (event) {
    [year, month, date] = event.dateKey.split('-');
    group = event.groupName;
    planName = event.planName;
    town = event.town;
  }

  return (
    <>
    <Form method="post" id="schedule-form">
      <span>약속 날짜</span>
      <p>
        <input
          placeholder="년"
          aria-label="년"
          type="text"
          name="year"
          defaultValue={year}
        />
        <input
          placeholder="월"
          aria-label="월"
          type="text"
          name="month"
          defaultValue={month}
        />
        <input
          placeholder="일"
          aria-label="일"
          type="text"
          name="date"
          defaultValue={date}
        />
      </p>
      <span>약속 이름</span>
      <p>
      <label>
        <input
          type="text"
          name="planName"
          placeholder={'약속의 이름을 입력해주세요.'}
          defaultValue={planName}
        />
      </label>
      </p>
      
      <span>그룹</span>
      <p>
      <label>
        <input
          type="text"
          name="groupId"
          placeholder="누구와의 약속인가요?"
          defaultValue={group}
        />
      </label>
      </p>

      <p>
        <button type="submit">Save</button>
        <Link to="/home">
          <button type="button">Cancel</button>
        </Link>
      </p>
    </Form>

    {/* <Link to="/empty">
      <button>새 페이지</button>
    </Link> */}
    </>
  );
}