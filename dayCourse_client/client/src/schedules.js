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

export async function getSi() {
    try {
        // axios로 SGIS API에서 토큰을 받아옴
  
        let response = await axios.get(`https://sgisapi.kostat.go.kr/OpenAPI3/addr/stage.json`, {
            params: {
                accessToken : sessionStorage.getItem('SGISToken'),
            },
        });


        let si = response.data;

       
        return si;

    } catch (error) {
        console.error('Error fetching the si:', error);
        
        async function loadToken() {
            const token = await getToken();
            console.log('Token:', token);
            return token;
        }
        
        const newToken = loadToken();
        let response = await axios.get(`https://sgisapi.kostat.go.kr/OpenAPI3/addr/stage.json`, {
            params: {
                accessToken : newToken,
                cd : 21
            },
        });

        return null;
    }
}


export async function getSchedules(query, startDate) {
    // let schedules = await localforage.getItem("schedules");
    if (!startDate)
        startDate = new Date()

    const getData = async () => {
        let response = await axios.get(`${BASE_URL}/home`,{
            params: {
                userId: 1,
                startDate: startDate
            }
        });
        return response.data;
    }

    let schedules = await getData();
    // console.log(schedules);
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
    let schedules = await localforage.getItem("schedules");

    const postData = async () => {
        let response = axios.post(`${BASE_URL}/home/plan`, {
            userId: 1,
            dateKey: dateKey,
            groupId: formData.get("groupId"),
            planName: formData.get("planName")
        });
        return response;
    }
    
    let result = await postData();

    getSchedules();
    // set(result);

    return result.data;

    // let id = Math.random().toString(36).substring(2, 9);
    // let schedule = { id, dateKey, createdAt: Date.now() };
    // let schedules = await getSchedules();
    // schedules.unshift(schedule);
    // await set(schedules);
    // return schedule;
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
    console.log(updates);
    let schedules = await localforage.getItem("schedules");
    let schedule = schedules.find(schedule => String(schedule.planId) === planId);
    if (!schedule) throw new Error("No schedule found for", planId);
    Object.assign(schedule, updates);
  
    await set(schedules);

    const postData = async () => {
        let response = axios.post(`${BASE_URL}/home/plan/update`, {
            userId: 1,
            schedule: schedule
        });
        return response;
    }
    
    let result = await postData();

    return result.data.msg;


    // let schedules = await localforage.getItem("schedules");
    // let schedule = schedules.find(schedule => String(schedule.dateKey) === dateKey);
    // if (!schedule) throw new Error("No schedule found for", dateKey);
    // Object.assign(schedule, updates);
    // await set(schedules);
    // return schedule;
}

export async function deleteSchedule(id) {
    let schedules = await localforage.getItem("schedules");
    let schedule = schedules.find(schedule => schedule.planId === id);
    let index = schedules.findIndex(schedule => schedule.planId === id);
    
    const postData = async () => {
        let response = axios.post(`${BASE_URL}/home/plan/delete`, {
            userId: 1,
            planId: schedule.planId
        });
        

        return response;
    }

    if (index > -1) {
        schedules.splice(index, 1);
        
        await postData();
        await set(schedules);
        
        return schedules;
    }

    // getSchedules();
    return false;
}

function set(schedules) {
    return localforage.setItem("schedules", schedules);
}

// let fakeCache = {};

// async function fakeNetwork(key) {
//     if (!key) {
//         fakeCache = {};
//     }

//     if (fakeCache[key]) {
//         return;
//     }

//     fakeCache[key] = true;
//     return new Promise(res => {
//         setTimeout(res, Math.random() * 800);
//     });
// }