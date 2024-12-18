import localforage from "localforage";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";
import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL; 

export async function getToken() {
    try {
        // axios로 SGIS API에서 토큰을 받아옴
        let response = await axios.get(`https://sgisapi.kostat.go.kr/OpenAPI3/auth/authentication.json`, {
            params: {
                consumer_key: process.env.REACT_APP_CONSUMER_KEY,
                consumer_secret: process.env.REACT_APP_CONSUMER_SECRET,
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

export async function getTownCd(props) {
    try {
        let response = await axios.get(`https://sgisapi.kostat.go.kr/OpenAPI3/addr/rgeocodewgs84.json`, {
            params: {
                accessToken : sessionStorage.getItem('SGISToken'),
                x_coor: props.centroid_x,
                y_coor: props.centroid_y,
                addr_type: 20
            },
        });
        let Town = response.data.result[0];
        return Town;

    } catch (error) {
        console.error('Error fetching the TownCd:', error);
        try {  
        const newToken = await getToken();
        let response = await axios.get(`https://sgisapi.kostat.go.kr/OpenAPI3/addr/rgeocodewgs84.json`, {
            params: {
                accessToken : newToken,
                x_coor: props.centroid_x,
                y_coor: props.centroid_y,
                addr_type: 20
            },
        });

        let Town = response.data.result[0];

        return Town;
        } catch (error) {
            console.error('Error fetching the TownCd with refreshed token:', error);
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
    console.log(dateKey);

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

    getSchedules(null,dateKey);
    // set(result);

    return result.data;

}

export async function getSchedule(dateKey) {
    let schedules = await localforage.getItem("schedules") || [];

    let schedule = schedules.filter(
        (schedule) => 
            schedule.year === year && 
            schedule.month === month && 
            schedule.date === date
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
    console.log("여기: ",schedule);

    if (schedule){
        Object.assign(schedule, updates);
    }
    // else{
        // }
        // if (!schedule) throw new Error(`No schedule found for planId: ${planId}`);
        
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
    // let schedules = await localforage.getItem("schedules");
    // let index = schedules.findIndex(schedule => schedule.planId === planId);
    
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