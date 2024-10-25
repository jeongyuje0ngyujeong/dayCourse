import localforage from "localforage";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

export async function getSchedules(query) {
    await fakeNetwork(`getSchedules:${query}`);
    let schedules = await localforage.getItem("schedules");
    if (!schedules) schedules = [];
    if (query) {
        schedules = matchSorter(schedules, query, { keys: ["first", "last"] });
    }
    return schedules.sort(sortBy("last", "createdAt"));
}

export async function createSchedule(year, month, date) {
    await fakeNetwork();
    let id = Math.random().toString(36).substring(2, 9);
    let schedule = { id, year, month, date, createdAt: Date.now() };
    let schedules = await getSchedules();
    schedules.unshift(schedule);
    await set(schedules);
    return schedule;
}

export async function getSchedule(year, month, date) {
    await fakeNetwork(`schedule:${year}:${month}:${date}`);
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
    if (!schedule) throw new Error("No schedule found for", planId);
    Object.assign(schedule, updates);
  
    await set(schedules);
    return schedule;
  }

function set(schedules) {
    return localforage.setItem("schedules", schedules);
}

let fakeCache = {};

async function fakeNetwork(key) {
    if (!key) {
        fakeCache = {};
    }

    if (fakeCache[key]) {
        return;
    }

    fakeCache[key] = true;
    return new Promise(res => {
        setTimeout(res, Math.random() * 800);
    });
}