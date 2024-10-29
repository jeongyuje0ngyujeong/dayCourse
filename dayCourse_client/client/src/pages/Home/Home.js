import styled from "styled-components";
import {useState} from 'react';
import { PageTitle, Footer } from '../../commonStyles';
import {DayTable, GroupDatesByWeek} from '../Calendar/Calendar'
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

const MonthContainer = styled.div `
  display: flex;
  flex-direction: row;
  text-align: center;
  height: 10%;
  align-items: center; 
`
const CalendarContainer = styled.div `
  display: flex;
  flex-direction: column;
  margin: 0 auto; 
  width: 100%;
  height: 40%;
  padding: 0 3rem;
`

const ScheduleContainer = styled.div `
  display: flex;
  flex-direction: column;
  ${'' /* margin: 1rem auto;  */}
  clear: left;
`

export async function action() {
  // const schedule = await createSchedule();
  // return redirect(`/schedules/create`);
}

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
        <Button onClick={() => handlePrevWeek()} $border='none'>{'<'}</Button>
        <Button onClick={() => handleNextWeek()} $border='none'>{'>'}</Button>
      </MonthContainer>
  
      <DayTable/> 
      {/* 주단위 달력 */}
      <GroupDatesByWeek startDay={startDay} endDay={endDay}/>

      {/* 선택 날짜 일정 표시 */}
      <ScheduleContainer>
        <Outlet context={[schedules, setSchedules]}/>
      </ScheduleContainer>

      <Footer/>
    </CalendarContainer>

    </>
  )
}