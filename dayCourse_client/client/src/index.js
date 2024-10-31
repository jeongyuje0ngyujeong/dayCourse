import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider,} from "react-router-dom";
import './index.css';
import Layout from "./Layout";
import Login from "./pages/Login/login";
import Register from "./pages/Login/register";
import Home, { action as homeAction, loader as homeLoader } from "./pages/Home/Home";
import Calendar from "./pages/Calendar/Calendar";
import Schedule, {loader as scheduleLoader, action as scheduleAction} from "./pages/Calendar/Schedule";
import CreateSchedule, {action as createAction,} from "./pages/Create/create";
// 파일명 앞 글자는 대문자로 설정
import Album from "./pages/Album/Album";
import Mypage from "./pages/Mypage/Mypage";
import ErrorPage from "./error-page";
import Friends from "./pages/Friends/Friends";
import PlacePage, { loader as emptyLoader } from "./pages/Home/PlacePage"; // 빈 페이지 컴포넌트 가져오기
import UpdateTown, {loader as townLoader, action as townAction,} from "./pages/Town/Town";
import Survey from './Survey';

// import RecentPlan from './pages/Album/RecentPlan';
import PlanDetail from './pages/Album/PlanDetail';
import { action as destroyAction } from "./pages/Destroy";
// import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter([
  {
    path: "/main",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          { index: true, 
            element: <Home /> ,
            // loader: homeLoader,
            // action: homeAction,
          },
          {
            path: "home",
            element: <Home/>,
            loader: homeLoader,
            action: homeAction,
            children: [
              {
                path: "schedules/:year/:month/:date",
                loader: scheduleLoader,
                action: scheduleAction,
                element: <Schedule />,
              },
              {
                path: "schedules/:year/:month/:date/edit",
                element: <CreateSchedule />,
                loader: scheduleLoader,
                action: scheduleAction,
              },
            ]
          },
          {
            path: "schedules/create/:id",
            element: <CreateSchedule />,
            loader: createLoader,
            action: createAction,
            // action: scheduleAction,
          },
          {
            path: "schedules/create",
            element: <CreateSchedule />,
            loader: scheduleLoader,
            action: createAction,
          },
          {
            path: "schedules/:dateKey/:planId/town",
            element: <UpdateTown />,
            loader: townLoader,
            action: townAction,
          },
          {
            path: "calendar",
            element: <Calendar/>,
          },
          {
            path: "Album",
            element: <Album/>,
          },
          {
            path: "mypage",
            element: <Mypage/>,
          },
          {
            path: "PlacePage/:planId",
            element: <PlacePage />,
            loader: emptyLoader,
          },
          {
            path: "plan/:planId",
            element: <PlanDetail />
          },
          {
            path: "friends",
            element: <Friends />
          },
        ]
      },
    ]
  },
  // {
  //   path: '/Survey',
  //   element:<Survey />,
  //   errorElement: <ErrorPage />,
  // },

  {
    path: "/",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/register",
    element: <Register />,
    errorElement: <ErrorPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

    <RouterProvider router={router} />

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
