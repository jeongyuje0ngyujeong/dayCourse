import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { fetchImage } from './AlbumApi.js';

const Container = styled.div`
    display: flex;
    flex-wrap: wrap;

    padding: 20px;
`;

const Box = styled.div`
    width: 150px; /* 너비 조정 */
    height: 200px; /* 높이 조정 */
    background-color: white; /* 배경색을 흰색으로 설정 */
    border: 1px solid #ccc; /* 경계선 추가 */
    border-radius: 10px; /* 둥근 모서리 */
    margin: 10px; /* 여백 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
    cursor: pointer;
    transition: transform 0.2s; /* 애니메이션 효과 */
    
    &:hover {
        transform: scale(1.05); /* 마우스 호버 시 확대 효과 */
    }

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;



const RecentPlan = ({plans}) => {
    const navigate = useNavigate();
  //  const [plans, setPlans] = useState([]); // 플랜을 저장할 상태

  // 이미지 목록 가져오기
  const fetchThumbnails = useCallback(async () => {
    const newThumbnails = {};

    for (const plan of plans) {
        try {
            const images = await fetchImage(plan.planId);
            if (images && images.length > 0) {
                newThumbnails[plan.planId] = images[0];
            }
        } catch (error) {
            console.error('error',error);
        }
    }
    setThumbnails(newThumbnails);
  }, [plans]);

  useEffect(() => {
    if (plans && plans.length > 0) {
        fetchThumbnails();
    }
  }, [plans, fetchThumbnails])


    const handleBoxClick = (item) => { // item으로 통일
        console.log('선택된플랜:', item);
        navigate(`/main/plan/${item.planId}`); // 플랜 상세 페이지로 이동
    };

    return (
        <div>
            <h2>모든 플랜</h2>
            <Container>
                {plans.map(item => ( // item으로 통일
                    <Box key={item.planId} onClick={() => handleBoxClick(item)}>
                        <div>
                            <h3>{item.planName}</h3>
                            <p>{new Date(item.dateKey).toLocaleDateString()}</p>
                        </div>
                    </Box>
                ))}
            </Container>
        </div>
    );
};

export default RecentPlan;