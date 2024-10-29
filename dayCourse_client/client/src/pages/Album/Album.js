// import { Outlet} from "react-router-dom";
// import styled from 'styled-components';

import React, { useState } from 'react';
import Search from './Search.js';
import Moment from './moment.js';
import RecentPlan from './RecentPlan.js';

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


const Album = () => {
  const [activeTab, setActiveTab] = useState('posts');

  const renderContent = () => {
    switch (activeTab) {
      case 'posts' :
        return <RecentPlan />;

      case 'moments':
        return <Moment />;

      case 'videos':
        return <div>동영상</div>;

      default:
        return <RecentPlan />;
    }
  };
  
  return (
    <div>
      <Search />
      <div>
        <button onClick={() => setActiveTab('posts')}>포스팅</button>
        <button onClick={() => setActiveTab('moments')}>모먼트</button>
        <button onClick={() => setActiveTab('videos')}>동영상</button>
      </div>
      {renderContent()}
    </div>
  )

}
export default Album;