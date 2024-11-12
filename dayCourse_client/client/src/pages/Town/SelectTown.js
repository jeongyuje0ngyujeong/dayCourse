import React, { useState, useEffect } from 'react';
import {getDo} from "../../schedules";
import styled from "styled-components";

const InputContainer = styled.div`
    display: flex;
    gap: 0.5vh;
`

const SidebarInput = styled.label`
    flex: 1;
    width: 100%; 
    ${'' /* border: 1px solid #ced4da; */}
    border-radius: 4px;
    select {
        width: 100%;
        padding: 10px;
        box-sizing: border-box;
    }
`;

const Select = styled.select`
  border: 2px solid #ccc; 
  border-radius: 5px; 
  padding: 8px;
  font-size: 16px;
  outline: none; 
  position: relative;
  z-index: 1000;
  box-sizing: border-box;

  &:focus {
    ${'' /* border-color: #90B54C; */}
    box-shadow: 0 0 0 3px #90B54C;
    ${'' /* border-width: 0.5vh;  */}
  }
`;

export default function SelectTown(props) {
    const [dos, setDos] = useState([]);
    const [gus, setGus] = useState([]);
    const [dongs, setDongs] = useState([]);
    const [selectedDo, setSelectedDo] = useState('');
    const [selectedGu, setSelectedGu] = useState('');
    const [selectedDong, setSelectedDong] = useState('');
    const setSelectedTown = props.contextTown;

    const [selectedDoCd, setSelectedDoCd] = useState(null);
    const [selectedGuCd, setSelectedGuCd] = useState(null); 
    // const [selectedDongCd, setSelectedDongCd] = useState(null); 
    
    useEffect(() => {
        if (props.town_code) {
            const firstSpaceIndex = props.town.indexOf(' ');
            const lastSpaceIndex = props.town.lastIndexOf(' ');

            const si = props.town.substring(0, firstSpaceIndex); // 첫 번째 공백 앞
            const dong = props.town.substring(lastSpaceIndex + 1); // 마지막 공백 뒤
            const gu = props.town.substring(firstSpaceIndex + 1, lastSpaceIndex)

            const si_cd = parseInt(props.town_code.substring(0, 2));
            const gu_cd = parseInt(props.town_code.substring(0, 5));
            const dong_cd = parseInt(props.town_code.substring(0, 8));
            console.log(si_cd,gu_cd,dong_cd);
            
            setSelectedDoCd(si_cd);
            setSelectedGuCd(gu_cd);
            // setSelectedDongCd(dong_cd);

            setSelectedDo(si);
            setSelectedGu(gu);
            setSelectedDong(dong);
        }
    }, [props.town_code, props.town]);

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
        const selectedItem = dos.find(doItem => doItem.addr_name === e.target.value);
   
        if (selectedItem) {
            setSelectedDo(selectedItem.addr_name); 
            setSelectedDoCd(selectedItem.cd);
            // setSelectedTown(selectedItem);
        }

    };

    const handleGuChange = (e) => {
        const selectedItem = gus.find(guItem => guItem.addr_name === e.target.value);

        if (selectedItem) {
            setSelectedGu(selectedItem.addr_name); 
            setSelectedGuCd(selectedItem.cd); 
            // setSelectedTown(selectedItem);
        }
    };

    const handleDongChange = (e) => {
        const selectedItem = dongs.find(guItem => guItem.addr_name === e.target.value);

        if (selectedItem) {
            setSelectedDong(selectedItem.addr_name);
            setSelectedTown(selectedItem);
        }
    };

    useEffect(() => {
        async function loadGusOnChange() {
            if (selectedDo) {
                try {
                    const gusData = await getDo(selectedDoCd); 
                    console.log('gus: ', gusData);
                    setGus(gusData.result);  
                } catch (error) {
                    console.error('Error loading Gus:', error);
                }
            }
        }
        loadGusOnChange();
    }, [selectedDo, selectedDoCd]);
    
    useEffect(() => {
        async function loadDongOnChange() {
            if (selectedGu) {
                try {
                    const dongsData = await getDo(selectedGuCd); 
                    setDongs(dongsData.result);  
                } catch (error) {
                    console.error('Error loading Dongs:', error);
                }
            }
        }
        loadDongOnChange();
    }, [selectedGu, selectedGuCd]);

    useEffect(() => {
        let selectedItem = null;

        if (selectedDong) {
            selectedItem = dongs.find(dongItem => dongItem.addr_name === selectedDong);
        } else if (selectedGu) {
            selectedItem = gus.find(guItem => guItem.addr_name === selectedGu);
        } else if (selectedDo) {
            selectedItem = dos.find(doItem => doItem.addr_name === selectedDo);
        }

        if (selectedItem) {
            setSelectedTown(selectedItem); 
        }
    }, [selectedDo, selectedGu, selectedDong, dos, gus, dongs, setSelectedTown]);

    return (
        <InputContainer>
            <SidebarInput>
                <Select name="selectedDo" value={selectedDo} onChange={handleDoChange}>
                    <option value="" disabled hidden>시/도</option>

                    {dos ? dos.map((doe, index) => (
                        <option key={index} value={doe.addr_name}>{doe.addr_name}</option>
                    )) : null}
                </Select>
            </SidebarInput>
            <SidebarInput>
                <Select name="selectedGu" value={selectedGu} onChange={handleGuChange} disabled={!selectedDo}>
                    <option value="" disabled hidden>시/군/구</option>

                    {gus ? gus.map((gu, index) => (
                        <option key={index} value={gu.addr_name}>{gu.addr_name}</option>
                    )) : null}
                </Select>
            </SidebarInput>
            <SidebarInput>
                <Select name="selectedDong" value={selectedDong} onChange={handleDongChange} disabled={!selectedGu}>
                    <option value="" disabled hidden>읍/면/동</option>

                    {dongs ? dongs.map((dong, index) => (
                        <option key={index} value={dong.addr_name}>{dong.addr_name}</option>
                    )) : null}
                </Select>
            </SidebarInput>
        </InputContainer>
    )
}