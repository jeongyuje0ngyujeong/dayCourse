import { Form, useLoaderData, redirect, } from "react-router-dom";
import { createSchedule, updateSchedule, getEvent,} from "../../schedules";
import { Link } from 'react-router-dom'; 
import Group from './group';
import { PageTitle } from '../../commonStyles';
import React, {useState} from 'react';


export async function action({ request, params }) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  const year= formData.get("year");
  const month= formData.get("month");
  const date= formData.get("date");
  const dateKey = `${year}-${month}-${date}`;
  console.log(updates);
  
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

export async function loader({ params }) {
  console.log(params);
  const { id } = params;
  const event = await getEvent(id);

  return { event };
}

export default function CreateSchedule() {
  const [selectedGroup, setSelectedGroup] = useState([]);

  const { event } = useLoaderData();

  let year, month, date;
  let group, planName, town;

  if (event) {
    [year, month, date] = event.dateKey.split('-');
    group = event.groupId;
    planName = event.planName;
    town = event.town;
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
      {/* <p>
      <label>
        <input
          type="text"
          name="group"
          placeholder="누구와의 약속인가요?"
          defaultValue={schedule?.group}
        />
      </label>
      </p> */}
      <Group setSelectedGroup={setSelectedGroup}/>
      {/* <input type="hidden" name="groupName" value={selectedGroup} /> */}
      <input type="hidden" name="groupMembers" value={selectedGroup} />

      <p>
        <button type="submit">Save</button>
        <button type="button">Cancel</button>
      </p>
    </Form>
  );
}