// import { Outlet} from "react-router-dom";
import styled from 'styled-components';
import { PageTitle } from '../../commonStyles';
import React, { useState , useEffect} from 'react';
import Search from './Search.js';
import Moment from './moment.js';
import RecentPlan from './RecentPlan.js';
import { getPlan } from './AlbumApi'; // 플랜 가져오는 API 함수


const Container = styled.div`
  width: 80%;
  margin: 0 auto; /* 가로 가운데 정렬 */
  padding: 20px;
  background-color: #fff;
  border-radius: 3px;
  box-sizing: border-box;
  align-items: center;
`;
const ProfileHeader = styled.div`
  display: flex;
  align-items: center;

  margin-bottom: 20px;
`;

const ProfileInfo = styled.div`
  width: 100%; /* 전체 가로 너비 사용 */

`;


const Username = styled.h2`
  font-size: 25px;
  font-weight: 300;
  margin-bottom: 10px;
  width: 30%; /* 원하는 퍼센트로 조정 */
  margin: 0 auto; /* 가운데 정렬 */
`;

const ProfileStats = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 10px;
  margin-left: 35%; /* 원하는 위치로 조정 */
  flex-wrap: nowrap; /* 줄 바꿈 방지 */
  white-space: nowrap; /* 텍스트 줄 바꿈 방지 */
  flex-shrink: 0; /* 화면이 줄어들어도 너비를 줄이지 않음 */
`;

const Stat = styled.span`
  font-size: 16px;

  strong {
    font-weight: bold;
    margin-right: 5px;
  }
`;

const Bio = styled.div`
  font-size: 16px;
  color: #8e8e8e;
  width: 100%; /* 전체 너비 사용 */
  margin-top: 20px;
  margin-left: 35%; /* 원하는 위치로 조정 */
  margin-bottom:40px;
`;

const Tabs = styled.div`
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #dbdbdb;
  gap: 30px;

  justify-content: center; /* 중앙 정렬 */
  margin-top: 100px;

`;


const TabButton = styled.button`
  width: 100px; /* 버튼 너비를 고정 */
  
  padding: 10px 0; /* 버튼 크기 조절 */
  background: none;
  border: none;
  outline: none;
  box-shadow: none; /* 윤곽선 및 그림자 제거 */
  font-size: 14px;
  color: ${(props) => (props.isActive ? '#262626' : '#8e8e8e')};
  font-weight: ${(props) => (props.isActive ? '600' : 'normal')};
  border-top: ${(props) => (props.isActive ? '2px solid #262626' : 'none')}; /* 선택된 탭에만 검은색 선 */
  border-radius: 0; /* 둥근 모서리 제거 */
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: color 0.3s, font-weight 0.2s; /* 텍스트 색상과 굵기 전환 효과 */

  &:hover {
    color: #262626; /* 호버 시 텍스트 색상 변경 */
    outline: none; 
    box-shadow: none; 
  }

  &:focus {
    outline: none; 
    box-shadow: none; 
  }

  &:active {
    font-weight: 600; 
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 935px;
  
`;

const Album = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('photos');
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState([]);
  const [username, setUsername] = useState('')

  const currentUserId = sessionStorage.getItem('userId');


  useEffect(() => {
    if (currentUserId) {
      const fetchPlans = async () => {
        try {
          const data = await getPlan(currentUserId);
          setPlans(data.plans);
          setUsername(data.userName[0].userName); // userName 배열에서 첫 번째 값 추출
        } catch (error) {
          console.error('앨범에서 플랜 가져오던 중 오류', error);
        }
      };
      fetchPlans();
    } else {
      console.error('유저 ID를 가져올 수 없습니다.');
    }
    console.log('userName', currentUserId.userName);
  }, [currentUserId]);

  const filteredPlans = plans.filter((plan) =>
    plan.planName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return <RecentPlan plans={filteredPlans} />;
      case 'moments':
        return <Moment />;
      case 'videos':
        return <div>동영상</div>;
      default:
        return <RecentPlan plans={filteredPlans} />;
    }
  };

  return (
    <Container>
      
      <ProfileHeader>
        <ProfileInfo>
          <Username>{currentUserId}</Username>
          <ProfileStats>
            <Stat>
              <strong>공유사진 {plans.length}</strong> 
            </Stat>
            <Stat>
              <strong>모먼트 0</strong> 
            </Stat>
            <Stat>
              <strong>동영상 0</strong> 
            </Stat>
          </ProfileStats>
            <Bio>{username}</Bio> 
        </ProfileInfo>
      </ProfileHeader>






      {/* 탭 버튼 */}
        {/* 검색 */}
        {/* <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> */}

      <Tabs>
        <TabButton isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')}>
          공유앨범
        </TabButton>
        <TabButton isActive={activeTab === 'moments'} onClick={() => setActiveTab('moments')}>
          모먼트
        </TabButton>
        <TabButton isActive={activeTab === 'videos'} onClick={() => setActiveTab('videos')}>
          동영상
        </TabButton>
      </Tabs>

    

      {/* 콘텐츠 */}
      <ContentContainer>{renderContent()}</ContentContainer>
    </Container>
  );
};

export default Album;