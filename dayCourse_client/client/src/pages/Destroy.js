import { redirect } from "react-router-dom";
// import { deleteSchedule } from "../schedules";

export async function action({ params }) {

    // await deleteSchedule(params.eventId);

    if (params.dateKey){
        return redirect(`/home/schedules/${params.dateKey}`);
    }
    else{
        return redirect(`/calendar`);
    }
    return null;
}