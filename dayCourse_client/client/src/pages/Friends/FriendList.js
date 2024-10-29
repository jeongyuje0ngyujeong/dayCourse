import {useState} from 'react';
import styled from 'styled-components';


const ResultContainer = styled.div`
position: relative;
max-height: 15rem;  
overflow-y: auto;
`

export default function FriendList({showResult, setShowResult}) {
    const [friends, setFriends] = useState("");
    const [keyword, setKeyword] = useState(""); // 제출한 검색어
    const [value, setValue] = useState(""); // 입력 값 상태
    const [selectedFriend, setSelectedFriend] = useState("");


    return(
        <>
        {showResult && (
        <ResultContainer id="search-result">
            {friends.length === 0 && value && ( // 검색 결과가 없을 때
                <p className="result-text">검색 결과가 없습니다.</p>
            )}
            <ul>
                {friends.length >0? (friends.map((friend, index) => (
                    <li 
                        key={index} 
                        onClick={() => {
                            selectedFriend(friend);
                        }} 
                        style={{ cursor: 'pointer' }}
                    >
                        <h5>{friend}</h5>
                    </li>
                ))):(<div>없습니다.</div>)}
            </ul>
        </ResultContainer>
        )}
        </>
    )
}