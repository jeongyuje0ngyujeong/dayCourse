import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL; 

export async function getSearchFriend(searchId) {
    try {
        const response = await axios.post(`${BASE_URL}/group/friend`, 
            {
                searchId: searchId,
            },
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`, 
                },
            }
        );
   
        return response.data.result;
        
    } catch (error) {
      console.error('검색 실패');
    }
}