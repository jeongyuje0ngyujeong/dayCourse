// import {Form} from "react-router-dom";
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './login.css';
import axios from 'axios';
import styled from "styled-components";
import { Button } from '../../Button';

const BASE_URL = process.env.REACT_APP_BASE_URL; 

const Image = styled.img`
    ${'' /* width: 200px; */}
    height: 450px;
    margin: 5px;
    border-radius: 5px;
    object-fit: cover; 
`;

export default function Login() {
    
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate(); 

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${BASE_URL}/auth/login`, {
                params: {
                    userId: userId,
                    pw: password
                }
            });

            if (response.data.result === 'success'){
                const token = response.data.access_token;
                const id = response.data.id;
                const userName = response.data.userName;
                if (token){
                    sessionStorage.setItem('token', token);
                    sessionStorage.setItem('id', id);
                    sessionStorage.setItem('userId', userId);
                    sessionStorage.setItem('userName', userName);
                    alert('로그인 성공!');
                    navigate('/Survey'); 
                }
            }
            else{
                alert(response.data.message);
            }
          
        } catch (error) {
          console.error('로그인 실패:', error);
        }
      };

    return (
        <div style={{display:'flex'}} className="login_box">
            <div style={{display:'flex'}}>
                <div style={{flex:'1', borderRight:'1px solid #ccc'}}>
                    <Image src="/login.png" alt="Company Logo" />
                </div>
                <div style={{flex:'1', display:"flex" , flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                    <h1 style={{fontFamily: 'HSSanTokki20-Regular'}}>로그인</h1>
                    <form onSubmit={handleLogin}>
                        <p>
                        <input 
                            type="text" 
                            id='userId'
                            placeholder='아이디' 
                            value={userId} 
                            onChange={(event)=>setUserId(event.target.value)}
                            className="w-80 p-2.5 mt-5 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none"
                            required
                        />
                        </p>
                        <p>
                        <input 
                            type="password" 
                            id='password'
                            placeholder='비밀번호' 
                            value={password} 
                            onChange={(event)=>setPassword(event.target.value)}
                            className="w-80 p-2.5 mt-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none"
                            required
                        />
                        </p>
                        
                        <Button style={{fontFamily: 'NPSfontBold'}} type='submit' width='13rem' $background='#90B54C' color='white'>Login</Button>
                            
                        {/* </div> */}
                    </form>
                    <div>
                        <Link to="/register">
                            <p>회원가입</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 