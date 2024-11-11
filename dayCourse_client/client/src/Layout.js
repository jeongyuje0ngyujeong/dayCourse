import React from 'react';
import { Outlet, NavLink, useNavigate} from "react-router-dom";
//import { Button } from './Button';
import { Footer } from './commonStyles';
// import {PageTitle} from './commonStyles'
// import { Logout } from './pages/Login/auth'
import './index.css';
import { ReactComponent as Home } from "./assets/house-solid.svg";
import { ReactComponent as Image } from "./assets/image-regular.svg";
import { ReactComponent as Mypage } from "./assets/pen-to-square-regular.svg";
// import { ReactComponent as AddUser } from "./assets/user-plus-solid.svg";

import UpperBar from './UpperBar';

function Nav({ href, text, svg }) {
    return (
        <li>
            <NavLink
                to={href}
                className={({ isActive }) => (isActive ? "active" : "")}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'left',
                    width: '100%',
                    color: 'black',  // 기본 텍스트 색상
                    textDecoration: 'none'
                }}
            >
                {({ isActive }) => (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px' // 아이콘과 텍스트 사이 간격
                    }}>
                        {React.cloneElement(svg, {
                            style: { 
                                fill: isActive ? 'white' : '#aaa', // 선택 시 아이콘 색상 변경
                                width: '24px', 
                                height: '24px' 
                            }
                        })}
                        <span style={{ color: isActive ? 'white' : 'black' }}>
                            {text}
                        </span>
                    </div>
                )}
            </NavLink>
        </li>
    );
}

export default function Layout() {
    const navigation = useNavigate();

    return (
    <>
    <UpperBar/>
    <div id="sidebar">
        <div style={{height:'10vh'}}></div>
        {/* <h1>데이코스</h1> */}
        <nav>
            <ul>
                <Nav href='home' text='홈' svg={<Home/>}/>
                {/* <Nav href='calendar' text='캘린더'/> */}
                <Nav href='album' text='공유앨범' svg={<Image/>}/>
                <Nav href='mypage' text='마이페이지' svg={<Mypage/>}/> 
                {/* <Nav style={{marginTop: '25rem'}} href='friends' text='친구추가'/>  */}
            </ul>
        </nav>
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