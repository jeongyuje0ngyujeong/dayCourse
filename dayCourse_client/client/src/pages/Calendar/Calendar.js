import { PageTitle, Footer } from '../../commonStyles';
import {useState} from 'react';
import styled from 'styled-components';

const MonthContainer = styled.div `
  display: flex;
  flex-direction: row;
  justify-content: center; 
  align-items: center; 
`

const CalendarContainer = styled.div `
  display: flex;
  flex-direction: column;
  margin: 0 auto; 
  width: 90%;
  height: 70%;
  color: #818181;
  padding: 0.5rem;
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

export const CalendarButton = styled.button`
  all: unset;
  text-align: center;
  border: none; /* 불필요한 테두리 제거 */
  cursor: pointer;
  &:hover {
    background-color: transparent; /* 배경 변화 없음 */
    color: inherit; /* 글자색 변화 없음 */
    transform: none; /* 크기나 위치 변화 없음 */
  }
  width: 2rem; 
  height: 2rem;
`

function GroupDatesByWeek(props){
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
      <CalendarButton onClick={() => handlePrevMonth()}>{'<'}</CalendarButton>
      <PageTitle>{year}. {st_month}</PageTitle>
      <CalendarButton onClick={() => handleNextMonth()}>{'>'}</CalendarButton>
    </MonthContainer>

    <CalendarContainer>
      <DayTable/>
      <GroupDatesByWeek startDay={startDay} endDay={endDay}/>
    </CalendarContainer>
    
    <Footer/>
    </>
  );
}