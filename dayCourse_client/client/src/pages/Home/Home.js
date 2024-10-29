import styled from "styled-components";
import {useState} from 'react';
import { PageTitle, Footer } from '../../commonStyles';
import {DayTable} from '../Calendar/Calendar'
// import Schedule from '../Calendar/Schedule'
import { Button } from '../../Button';
import { Outlet, Form} from "react-router-dom";
import { getSchedules } from "../../schedules";
// import { Link } from 'react-router-dom'; 
// import RightSidebar from './RightSidebar'; 

const WeekBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const Weekly = styled.div`
  display: flex;
  flex-direction: row;
  border-top: 1px solid;
  border-bottom: 1px solid;
  border-color: green;
  margin: 0 auto;
  width: 100%;
  height: 15%;
  align-items: center;
  justify-content: center; 
`
const Cell = styled.div`
height: 100%;
width:100%;
  color: #818181;
  vertical-align: baseline;
  text-align: center;
  padding: 0.5rem;
  font-weight: 600;
  &:hover {
    background-color: #e0e0e0; 
  }
`
const MonthContainer = styled.div `
  display: flex;
  flex-direction: row;
  text-align: center;
  height: 5%;
  align-items: center; 
`
const CalendarContainer = styled.div `
  display: flex;
  flex-direction: column;
  margin: 0 auto; 
  width: 100%;
  height: 100%;
`

const ScheduleContainer = styled.div `
  display: flex;
  flex-direction: column;
  margin: 1rem auto; 
`

function DayOfWeek(props){
  const weeks = []; 
  let currentDate = new Date(props.startDay); 

  const handleCellClick = () => {
    alert('hello');
  };

  while (currentDate <= props.endDay) {
    weeks.push(<Cell onClick={()=>handleCellClick()}>
    {new Date(currentDate).getDate().toString()}
    </Cell>);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return (
    <Weekly>{weeks}</Weekly> 
  )
};

export async function loader() {
  const schedules= await getSchedules();
  return { schedules };
}

// 날짜칸을 선택 -> useState 변경-> loader의 인자 -> loader의 return값을 얻어옴
export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const date = currentDate.getDate();
  
  const today = new Date(year, month, date);
  const startDay = new Date(currentDate);
  startDay.setDate(today.getDate() - today.getDay());

  const endDay = new Date(startDay);
  endDay.setDate(startDay.getDate() + 6);

  const st_month = String(currentDate.getMonth() + 1).padStart(2, '0');

  const handlePrevWeek = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()-7)
    );
  };
  
  const handleNextWeek = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()+7)
    );
  };

  const [ schedules, setSchedules ] = useState([]);

  return (
    <>
    <PageTitle>Home</PageTitle>
    <CalendarContainer>
      <WeekBar>
        <h3>한 주 일정</h3>
        <Form action="/main/schedules/create">
          <Button type='submit' width='6rem' $background='#90B54C' color='white'>+ 일정추가</Button>
        </Form>
        
      </WeekBar>
      <MonthContainer>
        <h3>{year}. {st_month}</h3>
        <Button onClick={() => handlePrevWeek()} border='none'>{'<'}</Button>
        <Button onClick={() => handleNextWeek()} border='none'>{'>'}</Button>
      </MonthContainer>
      <DayTable/> 
      <DayOfWeek startDay={startDay} endDay={endDay}/>
      
      <ScheduleContainer>
      {schedules.length ? (
        <ul>
          {schedules.map((schedule) => (
            <li key={schedule.id}>
              <Link to={`schedules/${schedule.year}/${schedule.month}/${schedule.date}`}>
                {schedule.year || schedule.month || schedule.date ? (
                  <>
                    {schedule.year} {schedule.month} {schedule.date}
                  </>
                ) : (
                  <i>No Date</i>
                )}{" "}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          <i>No schedules</i>
        </p>
      )}
      <Outlet />
      </ScheduleContainer>

      {/* {Schedule} */}
    </CalendarContainer>
    <Footer/>
    </>
  )
}