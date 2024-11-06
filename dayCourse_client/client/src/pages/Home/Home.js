import styled from "styled-components";
import {useState, useEffect, useRef} from 'react';
import { PageTitle, Footer } from '../../commonStyles';
import { GroupDatesByWeek, } from '../Calendar/CalendarComponent'
import { Button } from '../../Button';
import { Outlet, Form} from "react-router-dom";
import { getSchedules } from "../../schedules";
import Moment from '../Album/moment.js';
import { getMoment } from '../Album/AlbumApi';
import Calendar from '../Calendar/Calendar';

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
  ${'' /* background: #90B54C; */}
  background: #f7f7f7;
  ${'' /* border: 2px solid #90B54C; */}
  ${'' /* border: 2px solid #eee; */}
  padding: 0.5rem;
  border-radius: 20px;
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
    const divRef = useRef(null);

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
  
        if (screenHeight >= 1000) { // 800px 이상이면 maxItems 10
          setMaxItems(10);

        } else { // 600px 미만이면 maxItems 5
          setMaxItems(5);
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
        <div style={{flex:'2', display:'flex', flexDirection:'column',justifyContent:'space-between', height:'75vh', gap: '1rem'}}>
          
          <div style={{border:'1px solid #eee',padding:'0rem 1rem 0 1rem',flex:'0', borderRadius:'15px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', display:'flex', flexDirection:'column',alignItems:'center',background:'white'}}>
            <WeekBar>
              <MonthContainer>
                  <h2>{currentDate.getFullYear()}. {String(currentDate.getMonth() + 1).padStart(2, '0')}</h2>
              </MonthContainer>
              <div style={{display:'flex', gap:'1rem'}}>
                <Form action="/main/schedules/create">
                    <Button type='submit' width='6rem' $background='#90B54C' color='white'>+ 일정추가</Button>
                </Form>

                <Button onClick={() => {showCalendar ? handlePrevMonth(): handlePrevWeek()}} $background='#90B54C' $border='none' color='white'>{'<'}</Button>
                <Button onClick={() => {showCalendar ? handleNextMonth(): handleNextWeek()}} $background='#90B54C' $border='none' color='white'>{'>'}</Button>
              </div>
            </WeekBar>

            {showCalendar ? (
              <Calendar showCalendar={showCalendar} currentDate={currentDate} setCurrentDate={setCurrentDate}/>
            ) : (
              <GroupDatesByWeek
                groupedSchedules={groupedSchedules}
                setGroupedSchedules={setGroupedSchedules}
                startDay={startDay}
                endDay={endDay}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            )}
            <div style={{width:'100%', borderTop: '1px solid #ccc', marginTop:'0.5rem'}}>
              <Button onClick={() => setShowCalendar(!showCalendar)} $border="none" width="100%">
                {showCalendar ? '닫기' : '한 달 달력'}
              </Button>
            </div>
          </div>
          <div style={{border:'1px solid #eee', borderRadius:'15px', flex:'1', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', display:'flex', flexDirection:'column', overflow:'hidden', justifyContent:'ceter', alignItems:'center'}}>
            <h2 style={{margin:'2rem auto 0.5rem 2rem'}}>모먼트</h2>
            <Moment maxItems={maxItems} />
          </div>
        </div>

        <div style={{flex:'1', height:'75vh'}}>
          <ScheduleContainer>
              <Outlet context={[selectedSchedules, setGroupedSchedules]}/>
          </ScheduleContainer>
        </div>
      </div>
      </>
    )

}