import { Form, useLoaderData, redirect, } from "react-router-dom";
import { updateSchedule} from "../../schedules";

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
    return redirect(`/schedules/${dateKey}/${planId}/town`);
  }
}

export async function loader({ params }) {
  // console.log(params);
  const { id } = params;
  const event = await getEvent(id);

  return { event };
}

export default function CreateSchedule() {
  const { schedule } = useLoaderData();

  return (
    <Form method="post" id="schedule-form">
      <span>약속 날짜</span>
      <p>
        <input
          placeholder="년"
          aria-label="년"
          type="text"
          name="year"
          defaultValue={schedule?.year}
        />
        <input
          placeholder="월"
          aria-label="월"
          type="text"
          name="month"
          defaultValue={schedule?.month}
        />
        <input
          placeholder="일"
          aria-label="일"
          type="text"
          name="date"
          defaultValue={schedule?.date}
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
          defaultValue={schedule?.group}
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