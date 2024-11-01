import { PageTitle, Footer } from '../../commonStyles';
import { Button } from '../../Button';
import {useState,useEffect } from 'react';
import styled from 'styled-components';
import { getSchedules} from "../../schedules";
import {GroupDatesByWeek} from './CalendarComponent'

const MonthContainer = styled.div `
  display: flex;
  flex-direction: row;
  justify-content: center; 
  align-items: center; 
  color: black;
`

const CalendarContainer = styled.div `
  display: flex;
  flex-direction: column;
  margin: 0 auto; 
  width: 100%;
  height: 80%;
  color: #818181;
  padding: 0 3rem;
  ${'' /* padding: 0.5rem; */}
  ${'' /* background-color: #90B54C; */}
`

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [groupedSchedules, setGroupedSchedules] = useState([]);
    const [selectedDate, setSelectedDate] = useState([]);
    
  
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = new Date(firstDayOfMonth);
    startDay.setDate(1 - firstDayOfMonth.getDay());
  
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const endDay = new Date(lastDayOfMonth);
    endDay.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));
  
    const st_month = String(currentDate.getMonth() + 1).padStart(2, '0');
  
    const handlePrevMonth = () => {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    };
    
    const handleNextMonth = () => {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    };


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
  
    return (
      <>
      <PageTitle>Calendar</PageTitle>
  
       <MonthContainer>
        <Button onClick={() => handlePrevMonth()} $border='none'>{'<'}</Button>
        <PageTitle>{year}. {st_month}</PageTitle>
        <Button onClick={() => handleNextMonth()} $border='none'>{'>'}</Button>
      </MonthContainer>

      <CalendarContainer>
        {/* <DayTable/> */}
        <GroupDatesByWeek groupedSchedules={groupedSchedules} setGroupedSchedules={setGroupedSchedules} startDay={startDay} endDay={endDay} setSelectedDate={setSelectedDate} selectedDate={selectedDate}/>
        {/* <GroupDatesByWeek startDay={startDay} endDay={endDay}/> */}
        <Footer/>
      </CalendarContainer> 

      {/* <ScheduleModal  isOpen={modalIsOpen} OnRequestClose={()=>{setModalIsOpen(false)}} content={modalContent}/>   */}
      </>
    );
  }