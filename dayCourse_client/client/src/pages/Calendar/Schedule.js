import { Form, useLoaderData, redirect} from "react-router-dom";
import { getSchedule} from "../../schedules";

export async function loader({ params }) {
  const { year, month, date } = params;
  const schedule = await getSchedule(year, month, date);
  return { schedule };
}

export async function action(params) {
  const schedule = getSchedule(params.year,params.month,params.date);
  // return redirect(`/schedules/${schedule.id}/edit`);
  return redirect(`/home`);
}

export default function Schedule() {
  const { schedule } = useLoaderData();
  // const schedule = {
  //   year: "2024",
  //   month: "10",
  //   date: "20",
  //   group: "Minkyoung, Kyoungeun, Hyeamin, Youjeong",
  //   place: "Hongdae",
  //   note: "some note",
  // };

  return (
    <div id="schedule">
      <div>
        <h1>
          {schedule.year || schedule.month || schedule.date ? (
              <>
                {schedule.year} {schedule.month} {schedule.date}
              </>
            ) : (
              <i>No Date</i>
            )}{" "}
        </h1>

        {schedule.group && (
          <p>
            {/* <a
              target="_blank"
              href='#'
            > */}
              {schedule.group}
            {/* </a> */}
          </p>
        )}

        {schedule.notes && <p>{schedule.notes}</p>}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>
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
        </div>
      </div>
    </div>
  );
}