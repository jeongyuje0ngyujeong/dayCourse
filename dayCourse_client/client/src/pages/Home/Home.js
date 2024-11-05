import styled from "styled-components";
import {useState, useEffect} from 'react';
import { PageTitle } from '../../commonStyles';
import { GroupDatesByWeek, } from '../Calendar/CalendarComponent'
import { Button } from '../../Button';
import { Outlet, Form} from "react-router-dom";
import { getSchedules } from "../../schedules";

export async function action() {
    // const schedule = await createSchedule();
    // return redirect(`/schedules/create`);
  }
  
export async function loader() {
    const schedules= await getSchedules();
    return { schedules };
}

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
  height: 100%;
  ${'' /* padding: 0 3rem; */}
`

const ScheduleContainer = styled.div `

  display: flex;
  flex-direction: column;
  border-top: 2px solid #eee;
  ${'' /* margin: 1rem auto;  */}
  clear: left;
`


export default function Home() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [groupedSchedules, setGroupedSchedules] = useState([]);
    const [selectedDate, setSelectedDate] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2,'0')}`);
    const selectedSchedules = groupedSchedules[selectedDate];

    useEffect(() => {
        async function loadSchedules() {
            try {
                const loadSchedules = await getSchedules(null, currentDate); 
                const grouped = loadSchedules.reduce((acc, curr) => {
                    if (!acc[curr.dateKey]) {
                        acc[curr.dateKey] = [];
                    }

                    acc[curr.dateKey].push(curr);
                    return acc;
                }, {});

                setGroupedSchedules(grouped);
            } catch (error) {
                console.error('Error loading schedules:', error);
            }}
            loadSchedules(); 
            
    }, [currentDate]);
    
    console.log('groupedSchedules: ',groupedSchedules); 

    const currentDay = currentDate.getDay();
    const startDay = new Date(currentDate);
    startDay.setDate(currentDate.getDate() - currentDay);
    const endDay = new Date(startDay);
    endDay.setDate(startDay.getDate() + 6);

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

    return(
        <>
        <PageTitle>Home</PageTitle>
        <WeekBar>
            {/* <h3>한 주 일정</h3> */}
          <MonthContainer>
              <h2>{currentDate.getFullYear()}. {String(currentDate.getMonth() + 1).padStart(2, '0')}</h2>
          </MonthContainer>
            <div style={{display:'flex', gap:'1rem'}}>
              <Form action="/main/schedules/create">
                  <Button type='submit' width='6rem' $background='#90B54C' color='white'>+ 일정추가</Button>
              </Form>
              <Button onClick={() => handlePrevWeek()} $background='#90B54C' $border='none' color='white'>{'<'}</Button>
              <Button onClick={() => handleNextWeek()} $background='#90B54C' $border='none' color='white'>{'>'}</Button>
            </div>
        </WeekBar>

          <div style={{display:'flex', alignItems:'center', gap:'1rem', border: '1px solid #ccc', padding: '1rem 0.5rem 0.5rem 0.5rem', borderRadius:'10px'}}>

            <GroupDatesByWeek groupedSchedules={groupedSchedules} setGroupedSchedules={setGroupedSchedules} startDay={startDay} endDay={endDay} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
          </div>
        {/* 주단위 달력 */}
        <CalendarContainer>
          {/* <DayTable/>  */}
          <ScheduleContainer>
            <Outlet context={[selectedSchedules, setGroupedSchedules]}/>
          </ScheduleContainer>
          {/* <Footer/> */}
        </CalendarContainer>


        </>
    )

}