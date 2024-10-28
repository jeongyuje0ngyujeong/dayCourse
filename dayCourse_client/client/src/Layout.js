import { Outlet, NavLink, useNavigation} from "react-router-dom";
import { Button } from './Button';

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
                <Nav href='album' text='공유앨범'/>
                <Nav href='mypage' text='마이페이지'/> 
            </ul>
        </nav>
        <div>
            <Button style={{flex:'1'}} type='submit' $background='#90B54C' color='white'>+ 친구추가</Button>
            <Button style={{flex:'1'}} type='submit' $background='#90B54C' color='white'>+ 로그아웃</Button>
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