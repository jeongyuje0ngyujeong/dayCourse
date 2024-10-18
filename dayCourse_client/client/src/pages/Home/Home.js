// import { Outlet} from "react-router-dom";
import styled from "styled-components";

const Title = styled.h1 `
`
const Weekly = styled.div `
  border-radius: 20px;
  border: 1px, solid;
  margin: 2rem auto;
  text-align: center;
  color: #818181;
  width: 100%;
`
const Footer = styled.div `
  margin: 2rem auto;
  text-align: center;
  color: #818181;
`

export default function Home() {
  return (
    <>
    <Title>안녕하세요.</Title>
    <hr/>
    <Weekly> 
      일주일 달력
    </Weekly>

    <Footer>
      This is a footer for Home.
    </Footer>
    </>
  );
}
