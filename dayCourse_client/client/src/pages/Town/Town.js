import { Form, redirect, } from "react-router-dom";
import { updateSchedule, getEvent,} from "../../schedules";
import React, { useState, } from 'react';

import SelectTown from './SelectTown';
import styled from "styled-components";
import {Button} from '../../Button';


export async function loader({ params }) {
      const { planId } = params;
      const event = await getEvent(planId);
      return { event };
    }

export async function action({ request, params }) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);
    const planId = params.planId;
    
    await updateSchedule(planId, updates);
    return redirect(`/main/empty/${planId}`);
}


const SidebarContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin:  auto;

    right: 0; 
    top: 0; 
    height: 100%; 
    overflow-y: auto;
`;

export default function UpdateTown() {
    const [selectedTown, setSelectedTown] = useState("");
    const [departurePoints, setDeparturePoints] = useState([""]); 

    const addDeparturePoint = () => {
        // 최대 10개의 출발지 입력창만 추가할 수 있게 제한
        if (departurePoints.length < 10) {
            setDeparturePoints([...departurePoints, ""]);
        }
    };

    const removeDeparturePoint = (index) => {
        // 최소 하나의 입력창은 항상 유지
        if (departurePoints.length > 1) {
            setDeparturePoints(departurePoints.filter((_, i) => i !== index));
        }
    };

    const handleDepartureChange = (index, value) => {
        // 특정 입력창의 값을 업데이트
        const updatedPoints = [...departurePoints];
        updatedPoints[index] = value;
        setDeparturePoints(updatedPoints);
    }


    return (
        <div>
            <SidebarContainer>
                <h2>약속 지역</h2>
                <SelectTown contextTown={setSelectedTown}/>
                <Form method="post">        
                    <input type="hidden" name="town" value={selectedTown.full_addr} />
                    <Button type='submit' style={{ position: 'fixed', bottom: '30%', right: '6%' }} width='4rem' height='3rem' border='none' $background='#90B54C' color='white'> 다음 </Button>                   
                </Form>  
                <h2>출발지</h2>
                {departurePoints.map((point, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <input
                            type="text"
                            placeholder={`출발지 ${index + 1}`}
                            value={point}
                            onChange={(e) => handleDepartureChange(index, e.target.value)}
                            style={{ width: '80%', border: '1px solid #ccc', padding: '5px' }}
                        />
                        {index === 0 && departurePoints.length <= 10 && ( departurePoints.length !== 10 ?
                            <Button onClick={addDeparturePoint}>+</Button> : <Button disable onClick={addDeparturePoint}>+</Button>
                        )}
                        {index > 0 && (
                            <Button onClick={() => removeDeparturePoint(index)}>-</Button>
                        )}
                    </div>
                ))}
            </SidebarContainer>     
        </div>
    );
};




