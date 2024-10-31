import styled from "styled-components";
import {useState, useEffect} from 'react';
import {useState, useEffect} from 'react';
import { PageTitle, Footer } from '../../commonStyles';
import {DayTable, GroupDatesByWeek} from '../Calendar/CalendarComponent'
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
  height: 20%;
  padding: 0 3rem;
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
    const [selectedDate, setSelectedDate] = useState([]);
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
    const handlePrevWeek = () => {
        setCurrentDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()-7)
        );
      };
      
    const handleNextWeek = () => {
    setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()+7)
        new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()+7)
    );
    };
    };

    return(
        <>
        <PageTitle>Home</PageTitle>
        <WeekBar>
            <h3>한 주 일정</h3>
            <Form action="/main/schedules/create">
                <Button type='submit' width='6rem' $background='#90B54C' color='white'>+ 일정추가</Button>
            </Form>
        </WeekBar>
        <MonthContainer>
            <h3>{currentDate.getFullYear()}. {String(currentDate.getMonth() + 1).padStart(2, '0')}</h3>
            <Button onClick={() => handlePrevWeek()} $border='none'>{'<'}</Button>
            <Button onClick={() => handleNextWeek()} $border='none'>{'>'}</Button>
        </MonthContainer>

        <DayTable/> 
        {/* 주단위 달력 */}
        <GroupDatesByWeek groupedSchedules={groupedSchedules} setGroupedSchedules={setGroupedSchedules} startDay={startDay} endDay={endDay} setSelectedDate={setSelectedDate}/>

        <ScheduleContainer>
          <Outlet context={[selectedSchedules, groupedSchedules ,setGroupedSchedules]}/>
        </ScheduleContainer>

        <Footer/>
        </>
    )

}