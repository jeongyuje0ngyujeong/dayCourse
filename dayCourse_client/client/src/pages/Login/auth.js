import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_BASE_URL; 

export async function Logout(navigate) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/logout`, 
            {
                id: sessionStorage.getItem('id'),
            },
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`, 
                },
            }
        );
    
        if (response.data.result === 'success'){
            sessionStorage.clear();
            navigate('/'); 
        }
      
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
}