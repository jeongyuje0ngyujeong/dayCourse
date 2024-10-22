import { PageTitle, Footer } from '../../commonStyles';
import { Button } from '../../Button';
import {useState,useEffect } from 'react';
import styled from 'styled-components';
import { getSchedule,} from "../../schedules";
import Modal from 'react-modal';
import { useNavigate, useLocation } from 'react-router-dom';
import Schedule from "./Schedule";

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
  ${'' /* padding: 0.5rem; */}
  ${'' /* background-color: #90B54C; */}
`


const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

const getDayName = (day)=> {
  return daysOfWeek[day] ?? "Invalid day";
};

const StyleDayT = styled.table`
  height: 5%;
  width: 100%;
  table-layout: fixed;
  color: #818181;
  ${'' /* border-bottom: 1px solid; */}
`
export function DayTable(){
  return (
  <StyleDayT>
    <tbody>
      <tr>
        {/* {daysOfWeek.map()(event, index) =>} */}
        <th title="일">일</th>
        <th title="월">월</th>
        <th title="화">화</th>
        <th title="수">수</th>
        <th title="목">목</th>
        <th title="금">금</th>
        <th title="토">토</th>
      </tr>
    </tbody>
  </StyleDayT>
  )
}

const DateTable = styled.table`
  width: 100%;
  height: 100%;
  min-height: 7rem;
  border-top: 1px solid;
  border-color: green;
  border-collapse: collapse;
  table-layout: fixed;
`

const Cell = styled.td`
  color: #818181;
  vertical-align: baseline;
  text-align: center;
  ${'' /* border: 1px solid; */}
  padding: 0.5rem;
  font-weight: 600;
  &:hover {
    background-color: #e0e0e0; 
  }
`

const customModalStyles: ReactModal.Styles = {
  overlay: {
    backgroundColor: " rgba(0, 0, 0, 0.4)",
    width: "100%",
    height: "100vh",
    zIndex: "10",
    position: "fixed",
    top: "0",
    left: "0",
  },
  content: {
    width: "50%",
    height: "80%",
    zIndex: "150",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "10px",
    boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
    backgroundColor: "white",
    justifyContent: "center",
    overflow: "auto",
    // display: "flex", 
    // flexDirection: "column", 
    // alignItems: "center", 
  },
};

const ScheduleModal = ({ isOpen, OnRequestClose, content }) => {
  try{
    return (
      <Modal style={customModalStyles} isOpen={isOpen} OnRequestClose>
          {content && content.props.schedule && content.props.schedule.length > 0 ?
          <h2>{content.props.schedule[0].date}</h2>:null}
          <p> {content} </p>
          <button onClick={OnRequestClose}>닫기</button>
      </Modal>
    );
  }
  catch(error) {
    console.error("Error in ScheduleModal:", error);
  }
};

export function GroupDatesByWeek(props){
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    async function fetchSchedules() {
      let scheduleMap = {};
      let currentDate = new Date(props.startDay);

      while (currentDate <= props.endDay) {
        const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
        const schedule = await getSchedule(dateKey);
        scheduleMap[dateKey] = schedule;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setSchedules(scheduleMap); 
    }

    fetchSchedules(); 
  }, [props.startDay, props.endDay]);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState('')

  const navigate = useNavigate();
  const location = useLocation();

  const handleCellClick = async (params, e) => {
    e.preventDefault();
    const scheduleData = await getSchedule(params);

    // alert(params);
    // console.log("hello", params, content);
    
    if (location.pathname === "/calendar"){
      const content = <Schedule schedule = {scheduleData}/>;
      setModalContent(content);
      setModalIsOpen(true);
    }
    else{
      navigate(`schedules/${params}`);
    }
  };

  const weeks = []; 
  let currentWeek = []; 
  let currentDate = new Date(props.startDay); 
  
  while (currentDate <= props.endDay) {
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()+1}-${currentDate.getDate()}`;
    // const events = schedules.filter(schedule => schedule.dateKey === dateKey)|| []
    const events = schedules[dateKey];
    // console.log(dateKey, events);

    currentWeek.push(
    <Cell key={dateKey} onClick={(e)=>handleCellClick(dateKey,e)}>
      <div>{new Date(currentDate).getDate().toString()}</div>
    
      <div>
      {events && events.length > 0 ? events.map((event, index) => (
        <div key={index}> {event.group}</div>)):null}
      </div>
    </Cell>);

    if (currentWeek.length === 7 || currentDate.getDay() === 6) {
      weeks.push(
        <DateTable key={currentDate.toISOString().slice(0, 10)}>
          <tbody>
            <tr>{currentWeek}</tr>
          </tbody>
        </DateTable>
      )
      currentWeek = []; 
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push(
      <DateTable>
        <tbody>
          <tr>{currentWeek}</tr>
        </tbody>
      </DateTable>); 
  }

  return (
    <>{weeks}
    <ScheduleModal
      isOpen={modalIsOpen}
      OnRequestClose={() => setModalIsOpen(false)}
      content={modalContent}
    />
    </>
  )
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  return (
    <>
    <PageTitle>Calendar</PageTitle>

    <MonthContainer>
      <Button onClick={() => handlePrevMonth()} border='none'>{'<'}</Button>
      <PageTitle>{year}. {st_month}</PageTitle>
      <Button onClick={() => handleNextMonth()} border='none'>{'>'}</Button>
    </MonthContainer>

    <CalendarContainer>
      <DayTable/>
      <GroupDatesByWeek startDay={startDay} endDay={endDay}/>
    </CalendarContainer>
    <Footer/>
    </>
  );
}