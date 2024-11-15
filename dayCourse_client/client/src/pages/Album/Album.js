import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import Moment from './moment.js';
import RecentPlan from './RecentPlan.js';
import { getPlan  } from './AlbumApi'; // 플랜 가져오는 API 함수

const Container = styled.div`
  width: calc(100% - 17%); /* 화면 너비에서 사이드바 너비를 뺀 값 */
  margin-left: 17%; /* 사이드바 너비만큼 왼쪽 여백 */
  margin: 0 auto; /* 가로 가운데 정렬 */
  padding: 20px;
  background-color: #fff;
  border-radius: 3px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  ${'' /* margin-top: 20px; */}
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10vh;
  ${'' /* padding: 0 0 5vh 9vh; */}
  ${'' /* justify-content: center; */}
`;

const ProfileInfo = styled.div`
  width: 100%; /* 전체 가로 너비 사용 */
  display:flex;
  flex-direction:column;
  gap:2vh;
  ${'' /* padding: 0 3vh; */}
  ${'' /* align-items: center; */}
  justify-content: center;
`;

const Username = styled.div`
  font-size: 35px;
  font-weight: 300;
`;

const ProfileStats = styled.div`
  display: flex;
  gap: 20px;
  ${'' /* margin-top: 20px; */}
  ${'' /* margin-bottom: 10px; */}
  ${'' /* margin-left: 35%;  */}
  flex-wrap: nowrap; /* 줄 바꿈 방지 */
  white-space: nowrap; /* 텍스트 줄 바꿈 방지 */
  flex-shrink: 0; /* 화면이 줄어들어도 너비를 줄이지 않음 */
`;

const Stat = styled.span`
  font-size: 25px;

  strong {
    font-weight: bold;
    margin-right: 5px;
  }
`;

const Bio = styled.div`
  font-size: 25px;
  color: #8e8e8e;
  width: 100%; /* 전체 너비 사용 */
  ${'' /* margin-left: 35%; */}
`;

const Tabs = styled.div`
  display: flex;
  width: 100%;
  justify-content: center; /* 중앙 정렬 */
  border-top: 1px solid #dbdbdb;
  ${'' /* gap: 20vh; */}
  padding: 0 30vh;
  margin-top: 7vh;
`;

const TabButton = styled.button`
  flex: 1; /* 버튼 너비를 고정 */
  padding: 10px 0; /* 버튼 크기 조절 */
  background: none;
  border: none;
  outline: none;
  box-shadow: none; /* 윤곽선 및 그림자 제거 */
  font-size: 18px;
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
  margin: 0 auto; /* 중앙 정렬 */
`;

const Image = styled.img`
    width: 140px;
    object-fit: cover; 
`;

const Album = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [plans, setPlans] = useState([]);
  const [username, setUsername] = useState('');
  const [momentCount, setMomentCount] = useState(0);


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

      const fetchMomentCount = async () => {
        try {
          const data = await getPlan();
          const totalCount = Object.keys(data).length;
          setMomentCount(totalCount);
        } catch (error) {
          console.error('모먼트를 가져오는 중 오류가 발생했습니다:', error);
        }
      };

      fetchPlans();
      fetchMomentCount();
    } else {
      console.error('유저 ID를 가져올 수 없습니다.');
    }
  }, [currentUserId]);

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return <RecentPlan plans={plans} />;
      case 'moments':
        return <Moment onMomentCountChange={setMomentCount} columns={3}/>;
      case 'videos':
        return <div>동영상</div>;
      default:
        return <RecentPlan plans={filteredPlans} />;
    }
  };
  return (
    <Container>
      <ProfileHeader>
          <Image src="/profile.png" alt="Company Logo" className="logo" />
          <ProfileInfo>
            <Username>{currentUserId}</Username>
            <ProfileStats>
              <Stat>
                <strong>일정 {plans.length}</strong> 
              </Stat>
              <Stat>
                <strong>모먼트 {momentCount}</strong> 
              </Stat>
              {/* <Stat>
                <strong>동영상 0</strong> 
              </Stat> */}
            </ProfileStats>
            <Bio>{username}</Bio> 
          </ProfileInfo>
      </ProfileHeader>

      {/* 탭 버튼 */}
      <Tabs>
        <TabButton isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')}>
          공유사진
        </TabButton>
        <TabButton isActive={activeTab === 'moments'} onClick={() => setActiveTab('moments')}>
          모먼트
        </TabButton>
        {/* <TabButton isActive={activeTab === 'videos'} onClick={() => setActiveTab('videos')}>
          동영상
        </TabButton> */}
      </Tabs>

      {/* 콘텐츠 */}
      <ContentContainer>{renderContent()}</ContentContainer>
    </Container>
  );
};

}
export default Album;