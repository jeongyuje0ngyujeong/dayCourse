import localforage from "localforage";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

export async function getSchedules(query) {
    // await fakeNetwork(`getSchedules:${query}`);
    let schedules = await localforage.getItem("schedules");
    // if (!schedules) schedules = [];
    if (!Array.isArray(schedules)) {
        schedules = [];
    }
    if (query) {
        schedules = matchSorter(schedules, query, { keys: ["dateKey"] });
    }
    return schedules.sort(sortBy("dateKey", "createdAt"));
}

export async function createSchedule(dateKey) {
    // await fakeNetwork();
    let id = Math.random().toString(36).substring(2, 9);
    let schedule = { id, dateKey, createdAt: Date.now() };
    let schedules = await getSchedules();
    schedules.unshift(schedule);
    await set(schedules);
    return schedule;
}

export async function getSchedule(dateKey) {
    // await fakeNetwork(`schedule:${dateKey}`);
    let schedules = await localforage.getItem("schedules") || [];
    let schedule = schedules.filter(
        (schedule) => 
            schedule.dateKey === dateKey 
    )
    // console.log(schedule);
    return schedule ?? null;
}

export async function getEvent(id) {
    // await fakeNetwork(`schedule:${dateKey}`);
    let schedules = await localforage.getItem("schedules") || [];
    let event = schedules.find(
        (event) => 
            event.id === id
    )
    // console.log(schedule);
    return event ?? null;
}

export async function updateSchedule(dateKey, updates) {
    // await fakeNetwork();
    let schedules = await localforage.getItem("schedules");
    let schedule = schedules.find(schedule => schedule.dateKey === dateKey);
    if (!schedule) throw new Error("No schedule found for", dateKey);
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