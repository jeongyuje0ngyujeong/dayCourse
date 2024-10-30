import styled from "styled-components";
import {useState, useEffect} from 'react';
import { PageTitle } from '../../commonStyles';
import { Button } from '../../Button';
// import FriendList from './FriendList';
import FriendInput from './FriendInput';
import {getSearchFriend, addFriend} from './SearchFriend';


export async function action() {
  // const schedule = await createSchedule();
  // return redirect(`/schedules/create`);
}

export async function loader() {
//   const schedules= await getSchedules();
//   return { schedules };
}

const SearchResult = styled.div`
    display: flex;
    width: 100%;
    height: 15%;
    padding: 10px;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #ced4da;
    border-radius: 4px;
    min-height: 3rem;
    margin-top: 1rem;
`


// 날짜칸을 선택 -> useState 변경-> loader의 인자 -> loader의 return값을 얻어옴
export default function Friends() {
    const [selectedFriend, setSelectedFriend] = useState([]);
    const [keyword, setKeyword] = useState(""); // 제출한 검색어
    const [value, setValue] = useState(""); // 입력 값 상태
    const [showResult, setShowResult] = useState(false); 

    // console.log('value: ', value);
    // console.log(keyword)
    useEffect(() => {
        const fetchFriend = async () => {
            try {
                const result = await getSearchFriend(keyword);
    
                if (result.success)
                    setSelectedFriend([result]);
                else {
                    setSelectedFriend('');
                }
            } catch (error) {
                console.error("Error fetching friends:", error);
            }
        };
        
        if (keyword){
            fetchFriend();
            setShowResult(true);
        } 
    }, [keyword]);

    const handleOnClick = async (e) => {
        e.preventDefault(); 
        try {
            const result = await addFriend(keyword);
            setSelectedFriend([])
            setShowResult(false);
            setValue('')
            alert(result)
        } catch (error) {
            console.error('Error adding friend:', error);
            alert('친구 추가 실패');
        }
    };
    
    return (
        <>
        <PageTitle>친구추가</PageTitle>
        <h3>친구찾기</h3>
        <FriendInput value={value} setValue={setValue} setKeyword={setKeyword}/>
        {showResult && (selectedFriend.length>0 ? 
            (<SearchResult>
                <div>
                    <h3>{keyword}</h3>
                    <h3>{selectedFriend[0].friendName}</h3>
                </div>
                <Button type='submit' onClick={e => {handleOnClick(e)}} style={{height:'100%', width:'5rem'}}>친구추가</Button>
            </SearchResult>)
            :(<p>존재하지 않는 회원입니다.</p>)
        )
        }
        </>
      )
}