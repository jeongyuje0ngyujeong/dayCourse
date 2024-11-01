// import { Outlet} from "react-router-dom";
// import styled from 'styled-components';
import { PageTitle } from '../../commonStyles';
import React, { useState , useEffect} from 'react';
import Search from './Search.js';
import Moment from './moment.js';
import RecentPlan from './RecentPlan.js';
import { getPlan } from './AlbumApi'; // 플랜 가져오는 API 함수

// export default function Album() {
//   return (
//     <>
//     <div>
//       <Search/>
//       <Moment/>
//       <RecentPlan></RecentPlan>
//     </div>
//     </>
//   );
// }


const Album = ({userId}) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getPlan(userId);
        setPlans(data);
      } catch (error) {
        console.error('앨범에서 플랜 가져오던 중 오류', error);
      }
    };
    fetchPlans();
  }, [userId]);

  const filteredPlans = plans.filter(plan =>
    plan.planName.toLowerCase().includes(searchTerm.toLowerCase()))



  const renderContent = () => {
    switch (activeTab) {
      case 'posts' :
        return <RecentPlan plans={filteredPlans} />;

      case 'moments':
        return <Moment />;

      // case 'videos':
      //   return <div>동영상</div>;

      default:
        return <RecentPlan plans={filteredPlans} />;
    }
  };
  
  return (
    <div>
    <PageTitle>Album</PageTitle>
      <div>
        <button onClick={() => setActiveTab('posts')}>포스팅</button>
        <button onClick={() => setActiveTab('moments')}>모먼트</button>
        {/* <button onClick={() => setActiveTab('videos')}>동영상</button> */}
      </div>
      <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
      {renderContent()}
    </div>
  )

}
export default Album;