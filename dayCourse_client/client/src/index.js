import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider,} from "react-router-dom";
import './index.css';
import Layout from "./Layout";
import Home from "./pages/Home/Home";
import Calendar from "./pages/Calendar/Calendar";
import Album from "./pages/album/album";
import Mypage from "./pages/Mypage/Mypage";
import ErrorPage from "./error-page";
// import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <Home/> },
          {
            path: "home",
            element: <Home/>,
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
        ]
      },
    ]
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
