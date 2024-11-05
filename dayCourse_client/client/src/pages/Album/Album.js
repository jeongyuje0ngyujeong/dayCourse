// import { Outlet} from "react-router-dom";
import styled from 'styled-components';
import { PageTitle } from '../../commonStyles';
import React, { useState , useEffect} from 'react';
import Search from './Search.js';
import Moment from './moment.js';
import RecentPlan from './RecentPlan.js';
import { getPlan } from './AlbumApi'; // 플랜 가져오는 API 함수
const Container = styled.div`
  padding: 20px;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

const TabButton = styled.button`
  padding: 10px 20px;
  margin: 0 5px;
  border: none;
  border-radius: 20px;
  background-color: ${(props) => (props.isActive ? '#4CAF50' : '#ddd')};
  color: ${(props) => (props.isActive ? '#fff' : '#333')};
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${(props) => (props.isActive ? '#45a049' : '#ccc')};
  }
`;

const ContentContainer = styled.div`
  margin-top: 20px;
`;

const Album = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getPlan(userId);
        setPlans(data);
      } catch (error) {
        console.error('앨범에서 플랜 가져오던 중 오류', error);
      }
    };
    fetchPlans();
  }, [userId]);

  const filteredPlans = plans.filter((plan) =>
    plan.planName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return <RecentPlan plans={filteredPlans} />;
      case 'moments':
        return <Moment />;
      // case 'videos':
      //   return <div>동영상</div>;
      default:
        return <RecentPlan plans={filteredPlans} />;
    }
  };

  return (
    <Container>
      <PageTitle>앨범</PageTitle>

      {/* 탭 버튼 */}
      <TabContainer>
        <TabButton isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')}>
          포스팅
        </TabButton>
        <TabButton isActive={activeTab === 'moments'} onClick={() => setActiveTab('moments')}>
          모먼트
        </TabButton>
        {/* <TabButton isActive={activeTab === 'videos'} onClick={() => setActiveTab('videos')}>
          동영상
        </TabButton> */}
      </TabContainer>

      {/* 검색 */}
      <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* 콘텐츠 */}
      <ContentContainer>{renderContent()}</ContentContainer>
    </Container>
  );
};

export default Album;