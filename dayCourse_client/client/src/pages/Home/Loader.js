import React from 'react';
import styled, { keyframes } from 'styled-components';

// 간단한 회전 애니메이션 정의
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// 스피너를 위한 스타일 컴포넌트
const Spinner = styled.div`
  border: 8px solid #f3f3f3; /* 연한 회색 */
  border-top: 8px solid #3498db; /* 파란색 */
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 2s linear infinite;
`;

// Loader 컴포넌트
const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spinner />
  </div>
);

export default Loader;