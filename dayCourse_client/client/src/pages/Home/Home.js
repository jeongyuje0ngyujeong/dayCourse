import styled from "styled-components";
import {useState} from 'react';
import { PageTitle, Footer } from '../../commonStyles';
import {DayTable, CalendarButton} from '../Calendar/Calendar'

const Weekly = styled.div`
  display: flex;
  flex-direction: row;
  border-top: 1px solid;
  border-bottom: 1px solid;
  ${'' /* margin: 0 auto; */}
  width: 100%;
  height: 15%;
  align-items: center;
  justify-content: center; 
`
const Cell = styled.div`
height: 100%;
width:100%;
  color: #818181;
  vertical-align: baseline;
  text-align: center;
  padding: 0.5rem;
  font-weight: 600;
  &:hover {
    background-color: #e0e0e0; 
  }
`
const MonthContainer = styled.div `
  display: flex;
  flex-direction: row;
  text-align: center;
  ${'' /* justify-content: center;  */}
  align-items: center; 
`
const CalendarContainer = styled.div `
  display: flex;
  flex-direction: column;
  margin: 0 auto; 
  width: 90%;
  height: 100%;
  color: #818181;
`

function DayOfWeek(props){
  const weeks = []; 
  let currentDate = new Date(props.startDay); 

  const handleCellClick = () => {
    alert('hello');
  };

  while (currentDate <= props.endDay) {
    weeks.push(<Cell onClick={()=>handleCellClick()}>
    {new Date(currentDate).getDate().toString()}
    </Cell>);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return (
    <Weekly>{weeks}</Weekly> 
  )
};

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const date = currentDate.getDate();
  
  const today = new Date(year, month, date);
  const startDay = new Date(currentDate);
  startDay.setDate(today.getDate() - today.getDay());

  const endDay = new Date(startDay);
  endDay.setDate(startDay.getDate() + 6);

  const st_month = String(currentDate.getMonth() + 1).padStart(2, '0');

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
  return (
    <>
    <PageTitle>Home</PageTitle>
    <h3>한 주 일정</h3>
    <CalendarContainer>
      <MonthContainer>
        <h3>{year}. {st_month}</h3>
        <CalendarButton type="button" onClick={() => handlePrevWeek()}>{'<'}</CalendarButton>
        <CalendarButton type="button" onClick={() => handleNextWeek()}>{'>'}</CalendarButton>
      </MonthContainer>
      <DayTable/> 
      <DayOfWeek startDay={startDay} endDay={endDay}/>
    </CalendarContainer>
    <Footer/>
    </>
  );
}
