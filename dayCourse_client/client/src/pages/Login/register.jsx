// import {Form} from "react-router-dom";
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './register.css';
import axios from 'axios';
import { Button } from '../../Button';

const BASE_URL = process.env.REACT_APP_BASE_URL; 

export default function Register() {
    const [userName , setUserName] = useState('');
    const [userGender , setUserGender] = useState('');
    const [userId , setUserId] = useState('');
    const [checkId, setCheckId] = useState(false);
    const [message, setMessage] = useState('아이디를 입력해주세요');
    
    const [password, setPassword] = useState('');
    const [checkpass, setCheckPass] = useState('');
    const [identPass, setIdentPass] = useState(false);
    const [passMess, setPassMess] = useState('비밀번호를 다시 한 번 입력해주세요');

    const navigate = useNavigate(); 

    const handleRegi = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${BASE_URL}/auth/signup/`, {
                params: {
                    userId:userId, 
                    pw:password, 
                    userName:userName, 
                    userGender:userGender, 
                    userAge:25
                },
               
            });

            if (response.data.result === 'success'){
                alert('회원가입 성공!');
            }
            navigate('/'); 
        } catch (error) {
            alert('회원가입 실패:', error);
        }
    };

    const doubleCheck = async (event) => {
        if (userId.length>0){
            try {
            const response = await axios.post(`${BASE_URL}/auth/signup/id`, {
                params: {
                    userId: userId
                }
            });
            
            if (response.data.result === 'success'){
                setMessage(response.data.message); 
                setCheckId(true);
            }
            else{
                setMessage(response.data.message); 
                setCheckId(false);
            }
    
            } catch (error) {
                setMessage('중복체크 오류'); 
                setCheckId(false);
            }
        }
        else{
            setMessage('아이디를 입력해주세요'); 
            setCheckId(false);
        }
    };

    return (
        <div className="regi_box">
            <h1 className='bagel-fat-one-regular'>회원가입</h1>
            <form onSubmit={handleRegi}>
                
                <input 
                    type="text" 
                    placeholder='이름 입력' 
                    value={userName} 
                    onChange={(event)=>setUserName(event.target.value)}
                    style={{width:'100%'}}
                    className="w-80 p-2.5 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none" 
                    required    
                />
                
                <div id='info_id' style={{display:'flex', alignItems:'center', justifyContent:'center', padding:'0.5vh'}}>
                    <input 
                        type="text" 
                        placeholder='아이디 입력' 
                        value={userId} 
                        onChange={(event)=>setUserId(event.target.value)}
                        style={{width:'100%', height:'100%'}}
                        className="w-80 p-2.5 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none" 
                        required    
                    />
                    <Button 
                        type="button" 
                        onClick={(event)=>{
                            event.preventDefault();
                            doubleCheck();
                        }}
                        style={{marginBottom:'0'}}
                        height='100%'
                    >
                        중복 확인
                    </Button>
                </div>
                <p style={{ color: checkId ? 'green' : 'red', textAlign: 'left', marginLeft:'90px'}}>{message}</p>
                <p>
                <input 
                    type="password" 
                    placeholder='비밀번호 입력' 
                    value={password} 
                    onChange={(event)=>{
                        const value = event.target.value;
                        setPassword(event.target.value)
                        if (checkpass===value){
                            setPassMess('비밀번호가 동일합니다.'); 
                            setIdentPass(true);
                        }
                        else{
                            setPassMess('비밀번호가 동일하지 않습니다.'); 
                            setIdentPass(false);
                        }
                    }}
                    className="w-80 p-2.5 mt-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none" 
                    required
                />
                </p>
                <input 
                    type="password" 
                    placeholder='비밀번호 재입력' 
                    value={checkpass} 
                    onChange={(event)=>{
                        const value = event.target.value;
                        setCheckPass(value);

                        if (password===value){
                            setPassMess('비밀번호가 동일합니다.'); 
                            setIdentPass(true);
                        }
                        else{
                            setPassMess('비밀번호가 동일하지 않습니다.'); 
                            setIdentPass(false);
                        }
                    }}
                    className="w-80 p-2.5 mt-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none" 
                    required    
                />
                <p style={{ color: identPass ? 'green' : 'red', textAlign: 'left', marginLeft:'90px'}}>{passMess}</p>
                <p>
                    <input 
                        type="text" 
                        placeholder='성별' 
                        value={userGender} 
                        onChange={(event)=>setUserGender(event.target.value)}
                        className="w-80 p-2.5 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none" 
                        required    
                    />
                </p>
               
                
                <div>
                    <button 
                        type="submit"
                        disabled={!checkId || !identPass} 
                        className=" text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-16 py-2.5 text-center mt-5">
                        가입하기
                    </button>
                </div>
                <div>
                <Link to="/">
                    <p className="text-center mt-5">메인으로</p>
                </Link>
            </div>
            </form>
        </div>
    );
} 