import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { fetchImage } from './AlbumApi.js';

// Container: 부모 컴포넌트의 중앙에 정렬되도록 설정
const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(150px, 1fr)); /* 반응형 그리드 */
  gap: 10px; /* 그리드 간격 */
  width: 100%;
  padding: 20px 0;
  max-width: 935px; /* 최대 너비 설정 */
  margin: 0 auto; /* 중앙 정렬 */
`;

const Box = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* 정사각형 비율 유지 */
  background-color: #bfbfbf;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Overlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 25px;
  font-weight: bold;
  text-align: center;
  z-index: 1;
`;

const RecentPlan = ({ plans }) => {
  const navigate = useNavigate();
  const [thumbnails, setThumbnails] = useState({});

  // 썸네일 이미지를 가져오는 함수
  const fetchThumbnails = useCallback(async () => {
    const newThumbnails = {};

    for (const plan of plans) {
      try {
        const images = await fetchImage(plan.planId);
        if (images && images.length > 0) {
          newThumbnails[plan.planId] = images[0];
        }
      } catch (error) {
        console.error('썸네일 이미지를 가져오는 중 오류:', error);
      }
    }
    setThumbnails(newThumbnails);
  }, [plans]);

  useEffect(() => {
    if (plans && plans.length > 0) {
      fetchThumbnails();
    }
  }, [plans, fetchThumbnails]);

  // 박스 클릭 시 플랜 상세 페이지로 이동
  const handleBoxClick = (plan) => {
    console.log('선택된 플랜:', plan);
    navigate(`/main/plan/${plan.planId}`);
  };

  return (
    <Container>
      {plans.map((plan) => (
        <Box key={plan.planId} onClick={() => handleBoxClick(plan)}>
          {thumbnails[plan.planId] ? (
            <Image src={thumbnails[plan.planId]} alt={plan.planName} loading="lazy" />
          ) : (
           null
          )}
          <Overlay>
            <div>{plan.planName}</div>
            <div>{new Date(plan.dateKey).toLocaleDateString()}</div>
          </Overlay>
        </Box>
      ))}
    </Container>
  );
};

export default RecentPlan;