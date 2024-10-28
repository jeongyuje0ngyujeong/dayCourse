import { PageTitle, Footer } from '../../commonStyles';
import { Button } from '../../Button';
import {useState} from 'react';
import styled from 'styled-components';

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

export const DateTable = styled.table`
  width: 100%;
  height: 100%;
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

const ScheduleModal = ({ isOpen, OnRequestClose, content}) => {
  try{
    // console.log(content);
    return (
      <Modal style={customModalStyles} isOpen={isOpen} OnRequestClose>
          {content && content.props && content.props.schedule && content.props.schedule.length > 0 ?
          <h2>{new Date(content.props.schedule[0].dateKey).getDate()} {getDayName(new Date(content.props.schedule[0].dateKey).getDay())}</h2>:null}
          <p> {content} </p>
          <button onClick={OnRequestClose}>닫기</button>
      </Modal>

    );
  }
  catch(error) {
    console.error("Error in ScheduleModal:", error);
  }
};

async function fetchSchedules(props, setSchedules) {
  let scheduleMap = {};
  let currentDate = new Date(props.startDay);
  
  const dateKey = `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2,'0')}${String(currentDate.getDate()).padStart(2,'0')}`
  // console.log(dateKey);
  let schedules = await getSchedules(null, dateKey);

  while (currentDate <= props.endDay) {
    const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2,'0')}-${currentDate.getDate()}`;
    const schedule = await getSchedule(dateKey);
    scheduleMap[dateKey] = schedule;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  setSchedules(scheduleMap); 
}

// 시작 날짜, 끝 날짜를 인자로 호출
// 시작, 끝 날짜 바뀔 때 해당 기간 데이터 재요청 
export function GroupDatesByWeek(props){
  const [schedules, setSchedules] = useState([]); 
  
  useEffect(() => {
    fetchSchedules(props, setSchedules); 
  }, [props]);
  
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const handleCellClick = async (params, e) => {
    e.preventDefault();
    const scheduleData = await getSchedule(params);
    
    if (location.pathname === "/main/calendar"){
      const content = <Schedule schedule = {scheduleData} setModalContent = {setModalContent} fetchSchedules = {() => fetchSchedules(props, setSchedules)}/>;
      setModalContent(content);
      setModalIsOpen(true);
    }
    else{
      // const content = <Schedule schedule = {scheduleData} setModalContent = {setModalContent} fetchSchedules = {() => fetchSchedules(props, setSchedules)}/>;
      navigate(`schedules/${params}`);
    }
  };

  const weeks = []; 
  let currentWeek = []; 
  let currentDate = new Date(props.startDay); 

  const handleCellClick = () => {
    alert('hello');
  };

  while (currentDate <= props.endDay) {
    currentWeek.push(<Cell onClick={()=>handleCellClick()}>
    {new Date(currentDate).getDate().toString()}
    </Cell>);

    if (currentWeek.length === 7 || currentDate.getDay() === 6) {
      weeks.push(
        <DateTable>
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
    <>{weeks}</>
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