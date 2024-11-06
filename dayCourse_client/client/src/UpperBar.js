import styled from 'styled-components';
import { useNavigate} from "react-router-dom";
import { Button } from './Button';
import localforage from "localforage";

const UpperContainer = styled.td`
  width: 100%;
  height: 5rem;
  color: #818181;

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

    return(
        <UpperContainer>
            {/* <div style={{display:'flex', gap:'1rem'}}> */}
            <h2>데이코스</h2>    
            <img src="/logo.png" alt="Company Logo" className="logo" />
            {/* </div>  */}
            <Button style={{width: '5rem'}} onClick={handleLogout} $border='none'>로그아웃</Button>
           
            {/* <p>로그아웃</p> */}
        </UpperContainer>
    )

}