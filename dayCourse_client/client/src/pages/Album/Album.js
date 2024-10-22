// import { Outlet} from "react-router-dom";
// import styled from 'styled-components';

import React from 'react';
import Search from './Search.js';
import Moment from './moment.js';
import RecentSchedule from './RecentSchedule.js';

export default function Album() {
  return (
    <>
    <div>
      <Search/>
      <Moment/>
      <RecentSchedule></RecentSchedule>
    </div>
    </>
  );
}