import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import {useState} from 'react';
import Modal from 'react-modal';
import Schedule from './Schedule';

const Cell = styled.td`
  flex: 1;
  color: #818181;
  text-align: center;
  padding: 0.5rem;
  &:hover {
    background-color: #eee; 
  }
  position: relative;
  ${'' /* z-index:5000000000; */}
`

const DateTable = styled.tr`
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 9rem;
  border-top: 2px solid #eee;
  ${'' /* border-color: #90B54C; */}
  border-collapse: collapse;
  table-layout: fixed;
  overflow: hidden;
  
`

const StyleDayT = styled.tr`
  display: flex;
  height: 30%;
  width: 100%;
  margin: 0;
  ${'' /* table-layout: fixed; */}
  ${'' /* margin-bottom: 1rem; */}
  ${'' /* color: #818181; */}
  ${'' /* margin-top: 1rem; */}
  justify-content: space-between;
  color: black;
  text-align:center;
`
const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

export const getDayName = (day)=> {
  return daysOfWeek[day] ?? "Invalid day";
};

export function DayTable(){
  return (
    <StyleDayT>
      {daysOfWeek.map((day, index) => (
        <th
        key={index}
        title={day}
        style={{
          flex: '1',
          marginBottom: '0.5rem',
          // border: '1px solid',
          // textAlign: 'center',
          // verticalAlign: 'middle',
        }}
        >
          <div style={{
            border: '2px solid #90B54C',
            borderRadius: '50%',
            width: '2rem',
            height: '2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto', 
          }}>
            {day}
          </div>
        </th>
          ))}
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

function getFirst(date) {
  const month = date.getMonth();

  if (date.getDate() === 1) {
    return month; 
  }

  if (month === 11) {
    return 0;
  }

  return month + 1;
}

export function GroupDatesByWeek({groupedSchedules, setGroupedSchedules, startDay, endDay, selectedDate, setSelectedDate}){
    const weeks = []; 
    let currentWeek = []; 
    let currentDate = new Date(startDay);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');
    console.log(endDay.getDate()-startDay.getDate());
 
    const MainMonth = getFirst(startDay);

    const navigate = useNavigate();
    const location = useLocation();

    const handleCellClick = async (params, e) => {
      e.preventDefault();
      
      setSelectedDate(params);
      
      if (location.pathname === "/main/calendar"){
        console.log(groupedSchedules[params]);
        const content = <Schedule selectedSchedules={groupedSchedules[params]} groupedSchedules={groupedSchedules} setGroupedSchedules={setGroupedSchedules} setModalContent={setModalContent}/>;
        setModalContent(content);
        setModalIsOpen(true);
      }
      else{
        // const content = <Schedule schedule = {scheduleData} setModalContent = {setModalContent} fetchSchedules = {() => fetchSchedules(props, setSchedules)}/>;
        navigate(`/main/home/schedules/${params}`)
      }
    };
    
    while (currentDate <= endDay) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const date = currentDate.getDate();
        const day = currentDate.getDay();

        const dateKey = `${year}-${String(month+1).padStart(2, '0')}-${String(date).padStart(2,'0')}`;
        const events = groupedSchedules[dateKey] || [];

        currentWeek.push(<>
              <Cell 
                  key={dateKey} 
                  onClick={(e)=>handleCellClick(dateKey, e)}
                  style={{ 
                    border: dateKey === selectedDate ? "2px solid #90B54C" : "none",
                    borderRadius: '10px',
                   
                  }}
              >
                  <div style={{
                    color: day === 6 ? '#F3CD86': day === 0 ? '#F5A281' : 'black', 
                    fontWeight: '700',
                    opacity: month === MainMonth || endDay.getDate()-startDay.getDate() === 6 ? 1 : 0.3,
                  }}>{String(date)}</div>
                  
                  <div 
                    style={{  display: 'flex', flexDirection:'column', flex:'1',alignItems:'center', gap:'3px'}}>
              
                    {showCalendar?(
                      <>
                      {events.slice(0, 2).map((event, index) => (
                        <div key={index} style={{width:'100%',border:'2px solid #90B54C',background:'#90B54C',color:'white', fontSize:'1.7vh',borderRadius:'10px',opacity:'80%'}}>
                        {event.planName}</div>
                      ))}
                      {events.length > 2 && (
                        <div style={{width:'25%', background:'#90B54C',color:'white', fontSize:'1.7vh',borderRadius:'10px',opacity:'80%'}}>+{events.length - 2}</div>
                      )}
                      </>
                    )
                    :(
                      events.length > 0 && (
                      <div style={{width:'30%',border:'2px solid #90B54C',background:'#90B54C',color:'white', borderRadius:'15px',fontWeight:'700', opacity:'80%'}}></div>
                      )
                    )}

                  </div>
              </Cell></>
        )

        if (currentWeek.length === 7 || day === 6) {
          weeks.push(
            <DateTable key={currentDate.toISOString().slice(0, 10)}>
              {/* <tbody> */}
                
                {currentWeek}
                
              {/* </tbody> */}
            </DateTable>
          )
          currentWeek = []; 
        }

        currentDate.setDate(date + 1);
    }

    if (currentWeek.length > 0) {
    weeks.push(
        <DateTable key={currentDate.toISOString().slice(0, 10)}>
            {currentWeek}
        </DateTable>
    );
    }

    return (
        <>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead style={{display:'relative', zIndex:'1'}}>
            <DayTable/>
          </thead>
          <tbody style={{display:'relative', zIndex:'100'}}>
            {weeks}
          </tbody>
        </table>
        <ScheduleModal isOpen={modalIsOpen} OnRequestClose={()=>{setModalIsOpen(false)}} content={modalContent} dateKey={selectedDate}/>
        </>
    )
}

