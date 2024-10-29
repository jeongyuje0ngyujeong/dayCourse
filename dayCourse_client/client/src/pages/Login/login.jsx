// import {Form} from "react-router-dom";
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './login.css';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL; 

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
                if (token){
                    sessionStorage.setItem('token', token);
                    sessionStorage.setItem('id', id);
                    sessionStorage.setItem('userId', userId);
                    alert('로그인 성공!');
                    navigate('/main'); 
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
        <div className="login_box">
            <h1 className='bagel-fat-one-regular'>Login</h1>
            <form onSubmit={handleLogin}>
                <p>
                <input 
                    type="text" 
                    id='userId'
                    placeholder='UserId' 
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
                    placeholder='Password' 
                    value={password} 
                    onChange={(event)=>setPassword(event.target.value)}
                    className="w-80 p-2.5 mt-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none"
                    required
                />
                </p>
                <div>
                    <button 
                        type="submit" 
                        className=" text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-16 py-2.5 text-center mt-5">
                        Login
                    </button>
                </div>
            </form>
            <div>
                <Link to="/register">
                    <p className="text-center mt-5">회원가입하기</p>
                </Link>
            </div>
        </div>
    );
} 