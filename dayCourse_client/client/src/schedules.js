import localforage from "localforage";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";
import axios from 'axios';
// http://192.168.1.80:5000
const BASE_URL = process.env.REACT_APP_BASE_URL; 
// const BASE_URL = 'http://192.168.1.227:3000'

export async function getToken() {
    try {
        // axios로 SGIS API에서 토큰을 받아옴
        let response = await axios.get(`https://sgisapi.kostat.go.kr/OpenAPI3/auth/authentication.json`, {
            params: {
                consumer_key: "5ac5b0ab0d744c9996e0",
                consumer_secret: "1614098cdb9b4d13adbb",
            },
        });

        // 액세스 토큰 추출
        let AccessToken = response.data.result.accessToken;
        sessionStorage.setItem('SGISToken', AccessToken);
       
        return AccessToken;

    } catch (error) {
        console.error('Error fetching the token:', error);
        return null;
    }
}

export async function getDo(props) {
    try {
        let response = await axios.get(`https://sgisapi.kostat.go.kr/OpenAPI3/addr/stage.json`, {
            params: {
                accessToken : sessionStorage.getItem('SGISToken'),
                cd: props
            },
        });
        let dos = response.data;
        return dos;

    } catch (error) {
        console.error('Error fetching the do:', error);
        try {  
        const newToken = await getToken();
        let response = await axios.get(`https://sgisapi.kostat.go.kr/OpenAPI3/addr/stage.json`, {
            params: {
                accessToken : newToken,
                cd: props
            },
        });

        let dos = response.data;

        return dos;
        } catch (error) {
            console.error('Error fetching the do with refreshed token:', error);
            return null; // 최종 실패 시 null 반환
        }
    }
}


export async function getSchedules(query, startDate) {
    // let schedules = await localforage.getItem("schedules");

    console.log(startDate);
    if (!startDate)
        startDate = new Date()

    const getData = async () => {
        let response = await axios.get(`${BASE_URL}/home`,{
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`, 
            },
            params: {
                id: sessionStorage.getItem('id'),
                startDate: startDate
            }
        });
        return response.data;
    }

    let schedules = await getData();
    // console.log('fetched: ',schedules);
    await set(schedules);

    if (!Array.isArray(schedules)) {
        schedules = [];
    }
    if (query) {
        schedules = matchSorter(schedules, query, { keys: ["dateKey"] });
    }
    return schedules.sort(sortBy("dateKey"));
}

export async function createSchedule(dateKey, formData) {
    // let schedules = await localforage.getItem("schedules");
    console.log('create: ', formData.get("groupId"))

    const postData = async () => {
        let response = axios.post(`${BASE_URL}/home/plan`, 
            {
                id: sessionStorage.getItem('id'),
                dateKey: dateKey,
                groupId: formData.get("groupId"),
                planName: formData.get("planName")
            },
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`, 
                },
            }
        );
        return response;
    }
    
    let result = await postData();

    getSchedules(dateKey);
    // set(result);

    return result.data;

}

export async function getSchedule(dateKey) {
    let schedules = await localforage.getItem("schedules") || [];

    let schedule = schedules.filter(
        (schedule) => 
            schedule.dateKey === dateKey 
    )
    return schedule ?? null;
}

export async function getEvent(id) {
    // await fakeNetwork(`schedule:${dateKey}`);
    let schedules = await localforage.getItem("schedules") || [];
    let event = schedules.find(
        (event) => 
            String(event.planId) === id
    )

    return event ?? null;
}

export async function updateSchedule(planId, updates) {
    console.log('updates: ',updates);
    let schedules = await localforage.getItem("schedules");
    let schedule = schedules.find(schedule => String(schedule.planId) === planId);
    if (!schedule) throw new Error("No schedule found for", planId);
    Object.assign(schedule, updates);
  
    await set(schedules);

    const postData = async () => {
        let response = axios.post(`${BASE_URL}/home/plan/update`, 
            {
                id: sessionStorage.getItem('id'),
                schedule: schedule
            },
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`, 
                },
            }
        );
        return response;
    }
    
    let result = await postData();

    return result.data.msg;
}

export async function deleteSchedule(planId) {
    let schedules = await localforage.getItem("schedules");
    let index = schedules.findIndex(schedule => schedule.planId === planId);
    
    const postData = async () => {
        try {
            let response = await axios.post(
                `${BASE_URL}/home/plan/delete`, 
                {
                    id: sessionStorage.getItem('id'),
                    planId: planId
                },
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`, 
                    },
                }
            );
            return response.data.msg;
        } catch (error) {
            console.error("Delete request failed:", error);
            throw error;
        }
    }

    const result = await postData();
    console.log(result);
    return result;
}

function set(schedules) {
    return localforage.setItem("schedules", schedules);
}