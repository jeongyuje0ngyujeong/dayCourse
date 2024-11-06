import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { fetchImage } from './AlbumApi.js';

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(150px, 1fr));
  gap: 5px;
  padding: 20px 0;
`;

const Box = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* 정사각형 비율 */
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
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  z-index: 1;
`;


const RecentPlan = ({plans}) => {
    const navigate = useNavigate();
    const [thumbnails, setThumbnails] = useState({});
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




    const handleBoxClick = (plan) => { // item으로 통일
        console.log('선택된플랜:', plan);
        navigate(`/main/plan/${plan.planId}`); // 플랜 상세 페이지로 이동
    };

    return (
        <div>
           
            <Container>
                {plans.map((plan) => ( // item으로 통일
                    <Box key={plan.planId} onClick={() => handleBoxClick(plan)}>
                        {thumbnails[plan.planId] ? (
                            <Image src={thumbnails[plan.planId]} alt={plan.planName} />
                        ) : null } 
                    <Overlay>
                        <div>{plan.planName}</div>
                        <div>{new Date(plan.dateKey).toLocaleDateString()}</div> {/* 날짜 표시 */}
                    </Overlay>
                </Box>
                ))}
            </Container>
        </div>
    );
};

export default RecentPlan;