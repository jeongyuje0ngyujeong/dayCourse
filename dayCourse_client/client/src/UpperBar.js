import styled from 'styled-components';
import { useNavigate} from "react-router-dom";
// import { Button } from './Button';
import localforage from "localforage";
// import {PageTitle} from './commonStyles';
import { ReactComponent as Logout } from "./assets/arrow-right-from-bracket-solid.svg";
import { ReactComponent as AddUser } from "./assets/user-plus-solid.svg";

const UpperContainer = styled.td`
  width: 100%;
  height: 5rem;
  ${'' /* color: #818181; */}
  ${'' /* color: #90B54C; */}
  color: black;

  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 3rem ;

  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  position: fixed;
`

export default function UpperBar(){
    const navigation = useNavigate();

    const handleLogout = (e) => {
        e.preventDefault();
        // Logout(navigation);
        sessionStorage.clear();
        localforage.clear();

        navigation('/');
    };

    const handleFriend = (e) => {
        e.preventDefault();
        navigation('/main/friends'); 
    };

    return(
        <UpperContainer>
            {/* <div style={{display:'flex', gap:'1rem'}}> */}
            <h2 style={{fontFamily: 'HSSanTokki20-Regular',fontSize:'30px'}}>데이코스</h2>    
            <img src="/logo.png" alt="Company Logo" className="logo" />
            {/* </div>  */}
            <div style={{display:'flex', gap:'2rem'}}>
                <div>
                    <AddUser onClick={handleFriend}/>
                </div>
                <div>
                    <Logout onClick={handleLogout}/>
                </div>
            </div>
            {/* <p>로그아웃</p> */}
        </UpperContainer>
    )

}