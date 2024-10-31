import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import {useState,useEffect } from 'react';
import Modal from 'react-modal';
import Schedule from './Schedule';

const Cell = styled.td`
  color: #818181;
  vertical-align: baseline;
  text-align: center;
  ${'' /* border: 1px solid; */}
  padding: 0.5rem;
  font-weight: 600;
  ${'' /* max-height: 5rem;
  overflow: hidden; */}
  &:hover {
    background-color: #e0e0e0; 
  }
`
const DateTable = styled.table`
  width: 100%;
  ${'' /* height: 100%; */}
  max-height: 7rem;
  border-top: 1px solid;
  border-color: green;
  border-collapse: collapse;
  table-layout: fixed;
`

const StyleDayT = styled.table`
  height: 5%;
  width: 100%;
  table-layout: fixed;
  color: #818181;
  margin-top: 1rem;
`
const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

export const getDayName = (day)=> {
  return daysOfWeek[day] ?? "Invalid day";
};

export function DayTable(){
  return (
    <StyleDayT>
      <tbody>
        <tr>
          {daysOfWeek.map((day, index) => (
            <th key={index} title={day}>{day}</th>
          ))}
        </tr>
      </tbody>
    </StyleDayT>
  )
}

export const ScheduleModal = ({ isOpen, OnRequestClose, content, dateKey }) => {
  try {
    return (
      <Modal style={customModalStyles} isOpen={isOpen} onRequestClose={OnRequestClose}>
        <h2>
          {new Date(dateKey).getDate()} {getDayName(new Date(dateKey).getDay())}
        </h2>
        <p>{content}</p>
        <button onClick={OnRequestClose}>닫기</button>
      </Modal>
    );
  } catch (error) {
    console.error("Error in ScheduleModal:", error);
  }
};

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

export function GroupDatesByWeek({groupedSchedules, setGroupedSchedules, startDay, endDay, selectedDate, setSelectedDate}){
    const weeks = []; 
    let currentWeek = []; 
    let currentDate = new Date(startDay);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const [content, setContent] = useState('');
    // console.log(startDay, endDay); 
    // console.log(groupedSchedules);

    const navigate = useNavigate();
    const location = useLocation();

    const handleCellClick = async (params, e) => {
      e.preventDefault();
      const scheduleData = groupedSchedules[params];
      setSelectedDate(params);
      
      if (location.pathname === "/main/calendar"){
        console.log(groupedSchedules[params]);
        const content = <Schedule selectedSchedules={groupedSchedules[params]} groupedSchedules={groupedSchedules} setGroupedSchedules={setGroupedSchedules} setModalContent={setModalContent}/>;
        setModalContent(content);
        setModalIsOpen(true);
      }
      else{
        // const content = <Schedule schedule = {scheduleData} setModalContent = {setModalContent} fetchSchedules = {() => fetchSchedules(props, setSchedules)}/>;
        navigate(`schedules/${params}`);
      }
    };
    
    while (currentDate <= endDay) {
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2,'0')}`;
        const events = groupedSchedules[dateKey] || [];

        currentWeek.push(
            <Cell 
                key={dateKey} 
                onClick={(e)=>handleCellClick(dateKey, e)}
            >
                <div>{new Date(currentDate).getDate().toString()}</div>
                
                <div>
                    {events && events.length > 0 ? 
                    events.map((event, index) => (
                        <div key={index}> {event.planName}</div>
                        ))
                    :null}
                </div>
            </Cell>
        );

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
        <DateTable key={currentDate.toISOString().slice(0, 10)}>
        <tbody>
            <tr>{currentWeek}</tr>
        </tbody>
        </DateTable>
    );
    }

    return (
        <>{weeks}
        <ScheduleModal isOpen={modalIsOpen} OnRequestClose={()=>{setModalIsOpen(false)}} content={modalContent} dateKey={selectedDate}/>
        </>
    )
}

