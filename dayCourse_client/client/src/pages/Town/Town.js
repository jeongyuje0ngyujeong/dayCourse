import { Form, useLoaderData, redirect,useSubmit, } from "react-router-dom";
import { createSchedule, updateSchedule, getEvent,} from "../../schedules";
import { Link } from 'react-router-dom'; 
import RightSidebar from '../Home/RightSidebar';
import LandingPage from '../Home/LandingPage';
import EmptyPage from '../Home/EmptyPage';
import KakaoMap from '../Home/KakaoMap';
import InputTown from './InputTown';

import useState from  "react";

export async function action({ request, params }) {
    // const formData = await request.formData();
    // const updates = Object.fromEntries(formData);

    // const town = formData.get("town");
    // const planId = params.planId;
    // console.log(planId);
  
    // await updateSchedule(planId, updates);
    // return null;
    // return redirect(`/empty`);
    return null;
}

export async function loader({ params }) {
  const { planId } = params;
  const event = await getEvent(planId);
  return { event };
}

export default function UpdateTown() {
    const { event } = useLoaderData();
    const submit = useSubmit();

    let town;
    if (event) {town = event.town;}

    

    return (
        <>
        <Form method="post" id="schedule-form">
            <span>위치 </span>

            <input
                type="text"
                name="town"
                placeholder="어디서 만나시나요?"
                defaultValue={town}
                onChange={(event) => {
                    submit(event.currentTarget.form);
                }}
            />
            {/* <KakaoMap/> */}
            <InputTown/>
            <p>
                <button type="submit">Save</button>
                <Link to="/home">
                <button type="button">Cancel</button>
                </Link>
            </p>
        </Form>
        </>
    );
}