import { Outlet, Link, useNavigation } from "react-router-dom";

export default function Layout() {
    const navigation = useNavigation();
    return (
      <>
        <div id="sidebar">
          <h1>데이코스</h1>
          <nav>
            <ul>
              <li>
                <Link to={`home`}>홈</Link>
              </li>
              <li>
                <Link to={`calendar`}>캘린더</Link>
              </li>
              <li>
                <Link to={`elbum`}>공유앨범</Link>
              </li>
              <li>
                <Link to={`mypage`}>마이페이지</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div 
        id="detail"
        className={
            navigation.state === "loading" ? "loading" : ""
        }>
            <Outlet />
        </div>
      </>
    );
  }