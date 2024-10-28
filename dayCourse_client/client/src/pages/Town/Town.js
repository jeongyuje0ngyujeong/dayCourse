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

    return (
        <div>
            <SidebarContainer>
                <h2>위치</h2>
                <SelectTown contextTown={setSelectedTown}/>
                <Form method="post">        
                    <input type="hidden" name="town" value={selectedTown.full_addr} />
                    <Button type='submit' style={{ position: 'fixed', bottom: '30%', right: '6%' }} width='4rem' height='3rem' border='none' $background='#90B54C' color='white'> 다음 </Button>                   
                </Form>  
            </SidebarContainer>     
        </div>
    );
};




