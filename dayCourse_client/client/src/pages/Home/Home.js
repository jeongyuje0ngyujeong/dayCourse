import styled from "styled-components";
import {useState, useEffect} from 'react';
import { GroupDatesByWeek, } from '../Calendar/CalendarComponent'
import { Button } from '../../Button';
import { Outlet, Form} from "react-router-dom";
import { getSchedules } from "../../schedules";
import Moment from '../Album/moment.js';
import Calendar from '../Calendar/Calendar';
import {PageTitle} from '../../commonStyles';


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
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;
  width:100%;
  height:5rem;
`

const MonthContainer = styled.div `
  display: flex;
  flex-direction: row;
  text-align: center;
  height: 10%;
  align-items: center; 
`
// const CalendarContainer = styled.div `
  
//   display: flex;
//   flex-direction: column;
//   margin: 0 auto; 
//   width: 100%;
//   height: 100%;
//   ${'' /* padding: 0 3rem; */}
// `

const ScheduleContainer = styled.div `
  display: flex;
  flex-direction: column;
  ${'' /* background: #90B54C; */}
  background: #f7f7f7;
  ${'' /* border: 2px solid #90B54C; */}
  ${'' /* border: 2px solid #eee; */}
  padding: 0.5rem;
  border-radius: 20px;
  
  ${'' /* border: solid 1px #e3e3ee; */}
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee;
  ${'' /* margin: 1rem auto;  */}
  height: 100%;
  gap: 1rem;
  overflow: auto; 
    
  &::-webkit-scrollbar {
      display: none; 
  }
`

export default function Home() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [groupedSchedules, setGroupedSchedules] = useState([]);
    const [selectedDate, setSelectedDate] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2,'0')}`);
    const selectedSchedules = groupedSchedules[selectedDate];
    const [showCalendar, setShowCalendar] = useState(false);
    const [maxItems, setMaxItems] = useState(10);
    const [column, setColumn] = useState(4);

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

    useEffect(() => {
      const checkHeight = () => {
        const screenHeight = window.innerHeight;
        console.log(screenHeight);
  
        if (screenHeight >= 1000) { // 800px 이상이면 maxItems 10
          setMaxItems(10);
          setColumn(5);

        } else { // 600px 미만이면 maxItems 5
          setMaxItems(4);
          setColumn(4);
        }
      };
  
      // 초기 높이 체크
      checkHeight();
  
      // 화면 크기 변경 시마다 높이를 재확인
      window.addEventListener('resize', checkHeight);
  
      // cleanup
      return () => window.removeEventListener('resize', checkHeight);
    }, []);
    
    console.log('window.innerHeight: ',window.innerHeight); 

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


    return(
      <>
      {/* <PageTitle>Home</PageTitle> */}
      <div style={{display:"flex", gap: '2rem', height:'100%'}}>
        <div style={{flex:'2', display:'flex', flexDirection:'column',justifyContent:'space-between', height:'78vh', gap: '1rem'}}>
          
          <div style={{border:'1px solid #eee',padding:'0rem 1rem 0 1rem', borderRadius:'15px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', display:'flex', flexDirection:'column',alignItems:'center',background:'white'}}>
            <WeekBar>
              <MonthContainer>
                  <PageTitle style={{fontSize:'3vh'}}>{currentDate.getFullYear()}. {String(currentDate.getMonth() + 1).padStart(2, '0')}</PageTitle>
              </MonthContainer>
              <div style={{display:'flex', gap:'1rem'}}>
                <Form action="/main/schedules/create">
                    <Button style={{fontFamily: 'NPSfontBold'}} type='submit' width='6rem' $background='#90B54C' color='white'>+ 일정추가</Button>
                </Form>

                <Button style={{fontFamily: 'NPSfontBold'}} onClick={() => {showCalendar ? handlePrevMonth(): handlePrevWeek()}} $background='#90B54C' $border='none' color='white'>{'<'}</Button>
                <Button style={{fontFamily: 'NPSfontBold'}} onClick={() => {showCalendar ? handleNextMonth(): handleNextWeek()}} $background='#90B54C' $border='none' color='white'>{'>'}</Button>
              </div>
            </WeekBar>

            {showCalendar ? (
              <Calendar showCalendar={showCalendar} currentDate={currentDate} setCurrentDate={setCurrentDate} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
            ) : (
              <GroupDatesByWeek
                groupedSchedules={groupedSchedules}
                setGroupedSchedules={setGroupedSchedules}
                startDay={startDay}
                endDay={endDay}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                showCalendar={showCalendar}
              />
            )}
            <div style={{width:'100%', borderTop: '1px solid #ccc'}}>
              <Button  onClick={() => setShowCalendar(!showCalendar)} $border="none" width="100%">
                {showCalendar ? '/\\' : '\\/'}
              </Button>
            </div>
          </div>
          <div style={{border:'1px solid #eee', borderRadius:'15px', flex:'1', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', display:'flex', flexDirection:'column', overflow:'hidden', justifyContent:'center', alignItems:'center'}}>
            <PageTitle style={{margin:'0rem auto 0 1.5rem', fontWeight:'1000', fontSize:'3vh'}}>모먼트</PageTitle>
            <Moment maxItems={maxItems} columns={column}/>
          </div>
        </div>

        <div style={{flex:'1', height:'78vh'}}>
          <ScheduleContainer>
            <PageTitle style={{fontSize:'3vh', margin:'1rem 0 0 1rem'}}>{selectedDate}</PageTitle>
            <Outlet context={[selectedSchedules, setGroupedSchedules]}/>
          </ScheduleContainer>
        </div>
      </div>
      </>
    )

}