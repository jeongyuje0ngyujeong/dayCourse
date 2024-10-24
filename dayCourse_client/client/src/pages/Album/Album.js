// import { Outlet} from "react-router-dom";
// import styled from 'styled-components';

import React from 'react';
import Search from './Search.js';
import Moment from './moment.js';
import RecentPlan from './RecentPlan.js';

export default function Album() {
  return (
    <>
    <div>
      <Search/>
      <Moment/>
      <RecentPlan></RecentPlan>
    </div>
    </>
  );
}