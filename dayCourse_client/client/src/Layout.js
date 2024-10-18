import { Outlet, NavLink, useNavigation} from "react-router-dom";

function Nav(props){
    return(
        <li>
            <NavLink
                to={props.href}
                className={({ isActive, isPending }) =>
                isActive
                    ? "active"
                    : isPending
                    ? "pending"
                    : ""
                }
            >{props.text}
            </NavLink>
        </li>
    )
}

export default function Layout() {
    const navigation = useNavigation();
    return (
    <>
    <div id="sidebar">
        <h1>데이코스</h1>
        <nav>
        <ul>
            <Nav href='home' text='홈'/>
            <Nav href='calendar' text='캘린더'/>
            <Nav href='elbum' text='공유앨범'/>
            <Nav href='mypage' text='마이페이지'/>
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