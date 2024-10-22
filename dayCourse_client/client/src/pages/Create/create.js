import { Form, useLoaderData, redirect, } from "react-router-dom";
import { createSchedule,updateSchedule,getSchedule,getEvent,} from "../../schedules";

export async function action({ request, params }) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  const year= formData.get("year");
  const month= formData.get("month");
  const date= formData.get("date");

  const dateKey = `${year}-${month}-${date}`;
  
  if (params.id)
    await updateSchedule(dateKey, updates);
  else{
    await createSchedule(dateKey);
    await updateSchedule(dateKey, updates);
  }
  return redirect(`/home`);
}

export async function loader({ params }) {

  const { id } = params;
  console.log(id);

  const event = await getEvent(id);
  console.log(event);
  return { event };
}

export default function CreateSchedule() {
  const { event } = useLoaderData();

  return (
    <Form method="post" id="schedule-form">
      <span>약속 날짜</span>
      <p>
        <input
          placeholder="년"
          aria-label="년"
          type="text"
          name="year"
          defaultValue={event?.year}
        />
        <input
          placeholder="월"
          aria-label="월"
          type="text"
          name="month"
          defaultValue={event?.month}
        />
        <input
          placeholder="일"
          aria-label="일"
          type="text"
          name="date"
          defaultValue={event?.date}
        />
      </p>
      <p>
      <span>그룹</span>
      <p>
      <label>
        <input
          type="text"
          name="group"
          placeholder="누구와의 약속인가요?"
          defaultValue={event?.group}
        />
      </label>
      </p>
      </p>
      <span>Notes</span>
      <p>
      <label>
        <textarea
          name="notes"
          defaultValue={event?.notes}
          rows={6}
        />
      </label>
      </p>
      <p>
        <button type="submit">Save</button>
        <button type="button">Cancel</button>
      </p>
    </Form>
  );
}