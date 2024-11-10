import styled from "styled-components";
import {useState, useEffect} from 'react';
import { PageTitle } from '../../commonStyles';
import { GroupDatesByWeek, } from '../Calendar/CalendarComponent'
import { Button } from '../../Button';
import { Outlet, Form} from "react-router-dom";
import { getSchedules } from "../../schedules";
import Moment from '../Album/moment.js';
// import Calendar from '../Calendar/Calendar';
import {PageTitle} from '../../commonStyles';
import { ReactComponent as Down } from "../../assets/chevron-down-solid.svg";
import { ReactComponent as Up } from "../../assets/chevron-up-solid.svg";


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

// const MonthContainer = styled.div `
//   display: flex;
//   flex-direction: row;
//   text-align: center;
//   height: 10%;
//   align-items: center; 
// `
// const CalendarContainer = styled.div `
  
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

// 한달 달력 변수
/////////////////////////
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const MonthstartDay = new Date(firstDayOfMonth);
    MonthstartDay.setDate(1 - firstDayOfMonth.getDay());
  
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const MonthendDay = new Date(lastDayOfMonth);
    MonthendDay.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));
///////////////////////////

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
      {/* <PageTitle>Home</PageTitle> */}
      <div style={{display:"flex", gap: '2rem', height:'100%'}}>
        <div style={{flex:'2', display:'flex', flexDirection:'column',justifyContent:'space-between', height:'78vh', gap: '1rem'}}>
          
          <div style={{border:'1px solid #eee',padding:'0rem 1rem 0 1rem', borderRadius:'15px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', display:'flex', flexDirection:'column',alignItems:'center',background:'white'}}>
            <WeekBar>
              {/* <MonthContainer> */}
                <PageTitle style={{fontSize:'3vh'}}>{currentDate.getFullYear()}. {String(currentDate.getMonth() + 1).padStart(2, '0')}</PageTitle>
              {/* </MonthContainer> */}
              <div style={{display:'flex', gap:'1rem'}}>
                <Form action="/main/schedules/create">
                    <Button style={{fontFamily: 'NPSfontBold'}} type='submit' width='6rem' $background='#90B54C' color='white'>+ 일정추가</Button>
                </Form>
                <Button style={{fontFamily: 'NPSfontBold'}} onClick={() => {showCalendar ? handlePrevMonth(): handlePrevWeek()}} $background='#90B54C' $border='none' color='white'>{'<'}</Button>
                <Button style={{fontFamily: 'NPSfontBold'}} onClick={() => {showCalendar ? handleNextMonth(): handleNextWeek()}} $background='#90B54C' $border='none' color='white'>{'>'}</Button>
              </div>
            </WeekBar>

            {/* {showCalendar ? (
              <Calendar showCalendar={showCalendar} currentDate={currentDate} setCurrentDate={setCurrentDate} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/> */}
              <GroupDatesByWeek
                groupedSchedules={groupedSchedules}
                setGroupedSchedules={setGroupedSchedules}
                startDay={showCalendar ? MonthstartDay: startDay}
                endDay={showCalendar ? MonthendDay: endDay}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                showCalendar={showCalendar}
              />
            {/* ) : (
              <GroupDatesByWeek
                groupedSchedules={groupedSchedules}
                setGroupedSchedules={setGroupedSchedules}
                startDay={startDay}
                endDay={endDay}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                showCalendar={showCalendar}
              />
            )} */}
            <div style={{width:'100%', borderTop: '1px solid #ccc'}}>
              <Button  onClick={() => setShowCalendar(!showCalendar)} $border="none" width="100%">
                {showCalendar ? <Up/> : <Down/>}
              </Button>
            </div>
          </div>
          <div style={{border:'1px solid #eee',padding:'0rem 1rem 0 1rem',  borderRadius:'15px', flex:'1', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', display:'flex', flexDirection:'column', overflow:'hidden', justifyContent:'center', alignItems:'center'}}>
            
            <WeekBar>
              <PageTitle style={{ fontWeight:'1000', fontSize:'3vh'}}>모먼트</PageTitle>
              <Form action="/main/album">
                <Button style={{fontFamily: 'NPSfontBold'}} type='submit' width='6rem' $background='#90B54C' color='white'>모든 모먼트</Button>
              </Form>
            </WeekBar>
            <Moment maxItems={maxItems} columns={column}/>
          </div>
        </div>

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