// import {Form} from "react-router-dom";
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './register.css';
import axios from 'axios';
import { Button } from '../../Button';
import styled from "styled-components";
import {PageTitle} from '../../commonStyles';

const BASE_URL = process.env.REACT_APP_BASE_URL; 

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap:1vh;
`;


const RegiBox = styled.div`
    display: flex;
    flex-direction: column;

    text-align: center;
    justify-content: center; 
    align-items: center;
    padding:8vh;

    width: 70vh;
    height: 80vh;

    margin: auto;
    border: 1px solid gray;
    border-radius: 10px;
    background-color: white;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.5);
`

export default function Register() {
    const [userName , setUserName] = useState('');
    const [userGender , setUserGender] = useState('');
    const [userAge , setUserAge] = useState('');
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
                    userGender: userGender, 
                    userAge:userAge
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
        <RegiBox>
            <PageTitle style={{fontSize:'5vh', margin:'2vh'}}>회원가입</PageTitle>
            <StyledForm onSubmit={handleRegi}>
                <input 
                    type="text" 
                    placeholder='이름 입력' 
                    value={userName} 
                    onChange={(event)=>setUserName(event.target.value)}
                    style={{height:'6vh'}}
                    required    
                />
                
                <div id='info_id' style={{display:'flex', alignItems:'center', justifyContent:'center', height:'6vh'}}>
                    <input 
                        type="text" 
                        placeholder='아이디 입력' 
                        value={userId} 
                        onChange={(event)=>setUserId(event.target.value)}
                        style={{flex:'1', height:'100%'}}
                        required    
                    />
                    <Button 
                        type="button" 
                        onClick={(event)=>{
                            event.preventDefault();
                            doubleCheck();
                        }}
                        width='10vh'
                        height='100%'
                    >
                        중복 확인
                    </Button>
                </div>
                <div style={{ color: checkId ? 'green' : 'red', textAlign: 'left', marginLeft:'1vh'}}>{message}</div>
                
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
                    style={{width:'100%'}}
                    required
                />
               
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
                    style={{width:'100%'}}
                    required    
                />
                <div style={{ color: identPass ? 'green' : 'red', textAlign: 'left', marginLeft:'1vh'}}>{passMess}</div>
                
                <select 
                    value={userGender} 
                    onChange={(event)=>setUserGender(event.target.value)}
                    style={{width:'100%', height:'6vh', paddingLeft:'1vh', borderRadius:'1vh', border:'1px solid #ccc'}}
                    required    
                >
                    <option disabled hidden value=''>
                        성별
                    </option>
                    <option value="남">남</option>
                    <option value="여">여</option>
                </select>
                <input type="hidden" name="userGender" value={userGender} />

                <input 
                    type="text" 
                    placeholder='나이' 
                    value={userAge} 
                    onChange={(event)=>setUserAge(event.target.value)}
                    style={{width:'100%'}}
                    required    
                />
                    
                
                <Button 
                    type="submit"
                    disabled={!checkId || !identPass} 
                    width='100%'
                    height='5vh'
                    style={{background:'#90B54C', color:'white'}}
                    
                >
                    가입하기
                </Button>
                
                <div>
                    <Link to="/">
                        <p className="text-center mt-5">메인으로</p>
                    </Link>
                </div>
            </StyledForm>
        </RegiBox>
    );
} 