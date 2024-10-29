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
        console.log(response.data);
        return response.data;
        
    } catch (error) {
      console.error('검색 실패');
    }
}

export async function addFriend(friendId) {
    try {
        const response = await axios.post(`${BASE_URL}/group/friend/add`, 
            {
                friendId: friendId,
            },
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`, 
                },
            }
        );
        // console.log('addFriend: ',response.data)
   
        return response.data.message;
     
    } catch (error) {
      console.error('친구 추가 실패');
    }
}

export async function getFriends() {
    try {
        const response = await axios.get(`${BASE_URL}/group/friend/list`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`, 
            },
        }
        );
        console.log('getFriends: ',response.data)
   
        return response.data;
     
    } catch (error) {
      console.error('친구 조회 실패');
    }
}


export async function addGroup(groupName, groupMembers) {
    try {
        const response = await axios.post(`${BASE_URL}/group/add`, 
            {
                groupName: groupName,
                groupMembers: groupMembers
            },
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`, 
                },
            }
        );
        // console.log('addFriend: ',response.data)
   
        return response.data.message;
     
    } catch (error) {
      console.error('친구 추가 실패');
    }
}