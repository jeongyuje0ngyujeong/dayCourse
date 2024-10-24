import localforage from "localforage";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";
import axios from 'axios';

export async function getSchedules(query, startDate) {
    // let schedules = await localforage.getItem("schedules");
    if (!startDate)
        startDate = new Date()

    const getData = async () => {
        let response = await axios.get('http://192.168.1.80:5000/home',{
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
        let response = axios.post('http://192.168.1.80:5000/home/plan', {
            userId: 1,
            dateKey: dateKey,
            groupId: formData.get("groupId"),
            planName: formData.get("planName")
        });
        return response;
    }
    
    let result = await postData();

    // set(result);

    return result.data.msg;

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

export async function updateSchedule(dateKey, updates) {

    let schedules = await localforage.getItem("schedules");
    let schedule = schedules.find(schedule => String(schedule.dateKey) === dateKey);
    if (!schedule) throw new Error("No schedule found for", dateKey);
    Object.assign(schedule, updates);
    await set(schedules);

    const postData = async () => {
        let response = axios.post('http://192.168.1.80:5000/home/plan/update', {
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
        let response = axios.post('http://192.168.1.80:5000/home/plan/delete', {
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