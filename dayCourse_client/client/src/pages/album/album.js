// import { Outlet} from "react-router-dom";
import styled from 'styled-components';
import React from 'react';
import Search from './Search.js';
import Moment from './moment.js';
import Recent_schedule from './Recent_schedule.js';

export default function Album() {
  return (
    <>
    <div>
      <Search/>
      <Moment/>
      <Recent_schedule></Recent_schedule>
    </div>
    </>
  );
}