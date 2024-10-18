// import { Outlet} from "react-router-dom";
import styled from "styled-components";

const Title = styled.h1 `
  font-size : 50px;
  color: red;
  `

export default function Home() {
  return (
    <>
    <p id="zero-state">
      This is a demo for React Router.
      <br />
      Check out{" "}
      <a href="https://reactrouter.com">
        the docs at reactrouter.com
      </a>
      .
    </p>
    <div>
     <Title> hello </Title>
    </div>
    {/* style="max-width: 630px; width: 100%;" */}
    {/* <header>
      header
    </header>
    <main>
      main
    </main>
    <footer>
      footer
    </footer> */}
    </>
  );
}
