// PlacePage.js
import { useLoaderData } from "react-router-dom";
import KakaoMap from './KakaoMap';
import { Button } from '../../Button';
import LandingPage from './LandingPage';
import { getEvent } from "../../schedules";
import { Form } from "react-router-dom";
import { SocketProvider } from '../../SocketContext';

export async function loader({ params }) {
    const { planId } = params;
  
    const plan = await getEvent(planId);
    console.log(plan);
    return { plan };
}
  
const PlacePage = () => {
    const loaderData = useLoaderData().plan;
    const userId = sessionStorage.getItem('userId');
    const id = sessionStorage.getItem('id');
    const planId = loaderData.planId;
    const place = loaderData.place;
    console.log(loaderData.start_userId, userId);
    return (
        <SocketProvider userId={userId} planId={planId}>
            <div>
                <div style={{display:'flex', justifyContent: 'space-between', width:'70%', alignItems:'center'}}>
                    <h2>{loaderData.planName}</h2>
                    {String(loaderData.start_userId) === id ?(
                        <Form action={`/main/schedules/create/${planId}`}>
                            <Button type='submit' width='6rem' height='3rem' $background='white' color='inherit'>일정 수정</Button>
                        </Form>  
                    ):null}
                </div>
                <h1>{loaderData.town}</h1>
                <LandingPage userId={userId} planId={planId} place={place} context={loaderData}></LandingPage>
                <KakaoMap></KakaoMap>
            </div>
        </SocketProvider>
    );
};

export default PlacePage;