import { Form, useLoaderData, redirect, } from "react-router-dom";
import { createSchedule, updateSchedule, getEvent,} from "../../schedules";
import { Link } from 'react-router-dom'; 
import Group from './group';
import { PageTitle } from '../../commonStyles';

const ResultContainer = styled.div`
    display: flex;
    width: 100%;
    height: 15%;
    padding: 5px 50px;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #ced4da;
    border-radius: 4px;
    min-height: 3rem;
    margin-top: 1rem;
`

export async function action({ request, params }) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  const date= formData.get("date");

  if (date) {
    const dateObject = new Date(date); 
    const dateKey = dateObject.toISOString().split('T')[0]; 
    
    if (params.id){
      await updateSchedule(params.id, updates);
      return redirect(`/main/schedules/${dateKey}/${params.id}/town`);
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
  const [selectedGroup, setSelectedGroup] = useState('');
  // console.log(selectedGroup);

  const { event } = useLoaderData();
  // console.log('event: ', event);

  let date;
  let group, planName;

  if (event) {
    date = new Date(event.dateKey);
    group = event.groupId;
    planName = event.planName;
  }

  console.log(selectedGroup);

  const handleDelete = (e) => {
    e.preventDefault(); 
    setSelectedGroup('');
};

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
      
      <span>그룹</span>
      {/* users.length > 0 ? users.map((item) => item.name).join(', ') : '' */}
      {selectedGroup? (  
        <ResultContainer>
          <h4>{selectedGroup.groupName}</h4>
          <p>{selectedGroup.userNames.map((item) => item).join(', ')}</p>  
          <Button onClick={(e) => {handleDelete(e)}} $border='none'>X</Button>
        </ResultContainer>
      ) : (
        <ResultContainer>선택한 그룹이 없습니다.</ResultContainer>
      )}
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
        <Link to="/main/home">
          <button type="button">Cancel</button>
        </Link>
      </p>
    </Form>
  );
}