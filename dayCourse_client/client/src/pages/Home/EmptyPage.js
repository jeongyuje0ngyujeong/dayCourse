import {useLoaderData,} from "react-router-dom";
import KakaoMap from './KakaoMap';
// import styled from "styled-components";
import LandingPage from './LandingPage';
import { getEvent } from "../../schedules";


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
  
const EmptyPage = () => {
    const loaderData = useLoaderData().plan;
    console.log('loadData: ', loaderData);
    const userId = sessionStorage.getItem('userId');
    const planId = loaderData.planId; // loaderData에서 planId를 가져옴
    const place = loaderData.place;
    // const place = 
    return (
        <div>
            <h2>{loaderData.planName}</h2>
            <h1>{loaderData.town}</h1>
            <LandingPage userId={userId} planId={planId} place={place} context={loaderData}></LandingPage>
            <KakaoMap></KakaoMap>
            {/* <Box>일정칸입니다</Box> */}
         {/* <RightSidebar></RightSidebar> */}
        </div>

    );
};

export default EmptyPage;