import React, { useState, useEffect, useCallback } from 'react';
import {getDo} from "../../schedules";

export default function SelectTown(props) {
    const [dos, setDos] = props.contextDo;
    const [gus, setGus] = props.contextGu;
    const [dongs, setDongs] = props.contextDong;
    const [selectedDo, setSelectedDo] = useState("");
    const [selectedGu, setSelectedGu] = useState("");
    const [selectedDong, setSelectedDong] = useState("");

    useEffect(() => {
        async function loadDos() {
            try {
                const dos = await getDo(); 
                console.log('Dos:', dos);
                setDos(dos.result);  
            } catch (error) {
                console.error('Error loading Si:', error);
        }}
        loadDos();  
    }, []);

    const handleDoChange = (e) => {
        async function loadGus(cd) {
            try {
                const gus = await getDo(cd); 
                console.log('Gus:', gus);
                setGus(gus.result);  
            } catch (error) {
                console.error('Error loading Gus:', error);
        }}

        const selectedItem = dos.find(doItem => doItem.addr_name === e.target.value);
   
        if (selectedItem) {
            setSelectedGu(selectedItem.cd); 
            setDongs('')
            loadGus(selectedItem.cd);
        }

    };

    const handleGuChange = (e) => {
        async function loadDong(cd) {
            try {
                const dongs = await getDo(cd); 
                console.log('Dongs:', dongs);
                setDongs(dongs.result);  
            } catch (error) {
                console.error('Error loading Dongs:', error);
        }}

        const selectedItem = gus.find(guItem => guItem.addr_name === e.target.value);

        if (selectedItem) {
            setSelectedGu(selectedItem.cd); 
            loadDong(selectedItem.cd);
        }
    };

    const handleDongChange = (e) => {
        async function loadDong(cd) {
            try {
                const dongs = await getDo(cd); 
                console.log('Dongs:', dongs);
                setDongs(dongs.result);  
            } catch (error) {
                console.error('Error loading Dongs:', error);
        }}

        const selectedItem = dongs.find(guItem => guItem.addr_name === e.target.value);

        setSelectedDong(selectedItem.cd)

        console.log((dos.find(doItem => doItem.cd === selectedDo)).addr_name, selectedGu, selectedDong)
    };

    return (
        <div>
            <label>
                <select name="selectedTown" onChange={handleDoChange}>
                    <option value="placeholder" disabled hidden selected>시/도</option>

                    {dos ? dos.map((doe, index) => (
                        <option key={index} value={doe.addr_name}>{doe.addr_name}</option>
                    )) : null}
                </select>
            </label>
            <label>
                <select name="selectedTown" onChange={handleGuChange}>
                    <option value="placeholder" disabled hidden selected>시/군/구</option>

                    {gus ? gus.map((gu, index) => (
                        <option key={index} value={gu.addr_name}>{gu.addr_name}</option>
                    )) : null}
                </select>
            </label>
            <label>
                <select name="selectedTown" onChange={handleDongChange}>
                    <option value="placeholder" disabled hidden selected>읍/면/동</option>

                    {dongs ? dongs.map((dong, index) => (
                        <option key={index} value={dong.addr_name}>{dong.addr_name}</option>
                    )) : null}
                </select>
            </label>
        </div>
    )
}