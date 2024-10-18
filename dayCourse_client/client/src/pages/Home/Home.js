import styled from "styled-components";
import { PageTitle, Footer } from '../../commonStyles';

const Weekly = styled.div `
  border-radius: 20px;
  border: 1px, solid;
  margin: 2rem auto;
  text-align: center;
  color: #818181;
  width: 100%;
`


export default function Home() {
  return (
    <>
    <PageTitle>Home</PageTitle>
    <Weekly> 
      <h1>일주일 달력</h1>
    </Weekly>
    <Footer/>
    </>
  );
}
