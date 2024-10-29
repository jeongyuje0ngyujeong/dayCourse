import { redirect } from "react-router-dom";
// import { deleteSchedule } from "../schedules";

export async function action({ params }) {

    if (params.dateKey){
        return redirect(`/main/home/schedules/${params.dateKey}`);
    }
    else{
        return redirect(`/main/calendar`);
    }
}