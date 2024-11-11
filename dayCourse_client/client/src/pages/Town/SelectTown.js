import React, { useState, useEffect } from 'react';
import {getDo} from "../../schedules";
import styled from "styled-components";

const InputContainer = styled.div`
    display: flex;
   
`

const SidebarInput = styled.label`
    flex: 1;
    width: 100%; 
    border: 1px solid #ced4da;
    border-radius: 4px;
    select {
        width: 100%;
        padding: 10px;
        box-sizing: border-box;
    }
`;

export default function SelectTown(props) {
    // const town_code = props.town_code;

    // const si = town_code.substring(0, 2);
    // const gu = town_code.substring(2, 5);
    // const dong = town_code.substring(5, 8);

    const [dos, setDos] = useState([]);
    const [gus, setGus] = useState([]);
    const [dongs, setDongs] = useState([]);
    const [selectedDo, setSelectedDo] = useState('');
    const [selectedGu, setSelectedGu] = useState('');
    const [selectedDong, setSelectedDong] = useState('');
    const setSelectedTown = props.contextTown;

    useEffect(() => {
        async function loadDos() {
            try {
                const dos = await getDo(); 
                // console.log('Dos:', dos);
                setDos(dos.result);  
            } catch (error) {
                console.error('Error loading Si:', error);
        }}
        loadDos();  
    }, [setDos]);

    const handleDoChange = (e) => {
        async function loadGus(cd) {
            try {
                const gus = await getDo(cd); 
                // console.log('Gus:', gus);
                setGus(gus.result);  
            } catch (error) {
                console.error('Error loading Gus:', error);
        }}

        const selectedItem = dos.find(doItem => doItem.addr_name === e.target.value);
   
        if (selectedItem) {
            setSelectedDo(selectedItem.addr_name); 
            loadGus(selectedItem.cd);
            setSelectedGu('');
            setSelectedDong('');
            setDongs('');
            setSelectedTown(selectedItem);
        }

    };

    const handleGuChange = (e) => {
        async function loadDong(cd) {
            try {
                const dongs = await getDo(cd); 
                // console.log('Dongs:', dongs);
                setDongs(dongs.result);  
            } catch (error) {
                console.error('Error loading Dongs:', error);
        }}

        const selectedItem = gus.find(guItem => guItem.addr_name === e.target.value);

        if (selectedItem) {
            setSelectedGu(selectedItem.addr_name); 
            loadDong(selectedItem.cd);
            setSelectedDong('');
            setSelectedTown(selectedItem);
        }
    };

    const handleDongChange = (e) => {
        const selectedItem = dongs.find(guItem => guItem.addr_name === e.target.value);

        if (selectedItem) {
            setSelectedDong(selectedItem.addr_name);
            setSelectedTown(selectedItem);
            console.log(selectedItem);
        }
    };

    return (
        <InputContainer>
            <SidebarInput>
                <select name="selectedDo" value={selectedDo} onChange={handleDoChange}>
                    <option value="" disabled hidden>시/도</option>

                    {dos ? dos.map((doe, index) => (
                        <option key={index} value={doe.addr_name}>{doe.addr_name}</option>
                    )) : null}
                </select>
            </SidebarInput>
            <SidebarInput>
                <select name="selectedGu" value={selectedGu} onChange={handleGuChange} disabled={!selectedDo}>
                    <option value="" disabled hidden>시/군/구</option>

                    {gus ? gus.map((gu, index) => (
                        <option key={index} value={gu.addr_name}>{gu.addr_name}</option>
                    )) : null}
                </select>
            </SidebarInput>
            <SidebarInput>
                <select name="selectedDong" value={selectedDong} onChange={handleDongChange} disabled={!selectedGu}>
                    <option value="" disabled hidden>읍/면/동</option>

                    {dongs ? dongs.map((dong, index) => (
                        <option key={index} value={dong.addr_name}>{dong.addr_name}</option>
                    )) : null}
                </select>
            </SidebarInput>
        </InputContainer>
    )
}