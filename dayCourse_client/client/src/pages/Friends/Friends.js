import styled from "styled-components";
import {useState, useEffect} from 'react';
import { PageTitle, Footer } from '../../commonStyles';
import { Button } from '../../Button';
import FriendList from './FriendList';
import FriendInput from './FriendInput';
import {getSearchFriend} from './SearchFriend';


export async function action() {
  // const schedule = await createSchedule();
  // return redirect(`/schedules/create`);
}

export async function loader() {
//   const schedules= await getSchedules();
//   return { schedules };
}




// 날짜칸을 선택 -> useState 변경-> loader의 인자 -> loader의 return값을 얻어옴
export default function Friends() {
    const [friend, setFriend] = useState("");
    const [keyword, setKeyword] = useState(""); // 제출한 검색어
    const [value, setValue] = useState(""); // 입력 값 상태
    const [selectedFriend, setSelectedFriend] = useState("");
    const [showResult, setShowResult] = useState(true); 

    // console.log('value: ', value);
    // console.log(keyword)
    useEffect(() => {
        const fetchFriend = async () => {
            try {
                const result = await getSearchFriend(keyword);
                console.log(result);
                setFriend(result);
            } catch (error) {
                console.error("Error fetching friends:", error);
            }
        };
        
        if (keyword){
            fetchFriend();
        } 
    }, [keyword]);
    

    return (
        <>
        <PageTitle>친구 추가</PageTitle>
        <p>친구찾기</p>
        <FriendInput value={value} setValue={setValue} setKeyword={setKeyword}/>
        <div>
            <p>{friend}</p>
        </div>
        {/* <FriendList showResult={showResult} setShowResult={setShowResult}/> */}
        </>
      )
}