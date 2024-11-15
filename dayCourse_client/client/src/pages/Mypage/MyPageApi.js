import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL; 


export async function getUser(query, startDate) {
    const getData = async () => {
        let response = await axios.get(`${BASE_URL}/mypage/load`,{
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`, 
            },
            params: {
                id: sessionStorage.getItem('id')
            }
        });
        return response.data;
    }

    const user = await getData();
   
    return user;
}