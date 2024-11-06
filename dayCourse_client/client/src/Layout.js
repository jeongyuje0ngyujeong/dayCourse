import { Outlet, NavLink, useNavigate} from "react-router-dom";
import { Button } from './Button';
import { Footer } from './commonStyles';
// import {PageTitle} from './commonStyles'
// import { Logout } from './pages/Login/auth'
import './index.css';

import UpperBar from './UpperBar';

function Nav({ href, text, style }) {
    return (
        <li style={style}>
            <NavLink
                to={href}
                className={({ isActive, isPending }) =>
                    isActive
                        ? "active"
                        : isPending
                        ? "pending"
                        : ""
                }
            >
                {text}
            </NavLink>
        </li>
    );
}

export default function Layout() {
    const navigation = useNavigate();

    const handleFriend = (e) => {
        e.preventDefault();
        navigation('/main/friends'); 
    };

    return (
    <>
    <UpperBar/>
    <div id="sidebar">
        <div style={{height:'5rem'}}></div>
        {/* <h1>데이코스</h1> */}
        <nav>
            <ul>
                <Nav href='home' text='홈'/>
                {/* <Nav href='calendar' text='캘린더'/> */}
                <Nav href='album' text='공유앨범'/>
                <Nav href='mypage' text='마이페이지'/> 
                {/* <Nav style={{marginTop: '25rem'}} href='friends' text='친구추가'/>  */}
            </ul>
        </nav>
        <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
            <Button style={{height:'4rem', fontFamily: 'NPSfontBold', fontSize:'18px',textAlign:'left',width:'100%', paddingLeft:'1rem'}} $border='none' onClick={handleFriend}>친구추가</Button>
        </div>
    </div>
    <div className="container">
        <main>
            <div 
                id="detail"
                className={navigation.state === "loading" ? "loading" : ""
            }>  
                <Outlet />
            </div>
        </main>
        <footer>
            <Footer/>
        </footer>
    </div>
    </>
    );
  }