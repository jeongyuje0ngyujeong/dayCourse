import { Outlet, NavLink, useNavigate} from "react-router-dom";
//import { Button } from './Button';
import { Footer } from './commonStyles';
// import {PageTitle} from './commonStyles'
// import { Logout } from './pages/Login/auth'
import localforage from "localforage";

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
    const navigation = useNavigate();

    const handleFriend = (e) => {
        e.preventDefault();
        navigation('/main/friends'); 
    };

    const handleLogout = (e) => {
        e.preventDefault();
        // Logout(navigation);
        sessionStorage.clear();
        localforage.clear();

        navigation('/');
    };

    return (
    <>
    <div id="sidebar">
        <div style={{height:'10vh'}}></div>
        {/* <h1>데이코스</h1> */}
        <nav>
            <ul>
                <Nav href='home' text='홈'/>
                <Nav href='calendar' text='캘린더'/>
                <Nav href='album' text='공유앨범'/>
                <Nav href='mypage' text='마이페이지'/> 
            </ul>
        </nav>
        <div>
            <Button style={{flex:'1'}} onClick={handleFriend}>친구추가</Button>
            <Button style={{flex:'1'}} onClick={handleLogout}>로그아웃</Button>
        </div>
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