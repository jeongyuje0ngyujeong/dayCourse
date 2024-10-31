import {useLoaderData,} from "react-router-dom";
import KakaoMap from './KakaoMap';
import { Button } from '../../Button';
// import styled from "styled-components";
import LandingPage from './LandingPage';
import { getEvent } from "../../schedules";
import { Form} from "react-router-dom";


// const Box = styled.div`
//     width: 50vw;
//     height: 80vh;
//     background-color: gray;
//     border-radius: 5px;
//     margin: 2%;
//     cursor: pointer;
//     display: flex; /* 내용 중앙 정렬을 위해 Flexbox 사용 */
//     align-items: center;
//     justify-content: center; /* 수평 중앙 정렬 */

//     &:hover {
//         background-color: darkgray;
//     }
// `;
export async function loader({ params }) {
    const { planId } = params;
  
    const plan = await getEvent(planId);
    console.log(plan);
    return { plan };
}
  
const PlacePage = () => {
    const loaderData = useLoaderData().plan;
    // console.log('loadData: ', loaderData);
    const userId = sessionStorage.getItem('userId');
    const id = sessionStorage.getItem('id');
    const planId = loaderData.planId; // loaderData에서 planId를 가져옴
    const place = loaderData.place;
    console.log(loaderData.start_userId, userId);
    return (
        <div>
            <div style={{display:'flex', justifyContent: 'space-between', width:'70%', alignItems:'center'}}>
                <h2>{loaderData.planName}</h2>
                {loaderData.start_userId === userId ?(
                    <Form action={`/main/schedules/create/${planId}`}>
                        <Button type='submit' width='6rem' height='3rem' $background='white' color='inherit'>일정 수정</Button>
                    </Form>  
                ):null}
            </div>
            <h1>{loaderData.town}</h1>
            <LandingPage userId={userId} planId={planId} place={place} context={loaderData}></LandingPage>
            <KakaoMap></KakaoMap>
            {/* <Box>일정칸입니다</Box> */}
         {/* <RightSidebar></RightSidebar> */}
        </div>

    );
};

export default PlacePage;