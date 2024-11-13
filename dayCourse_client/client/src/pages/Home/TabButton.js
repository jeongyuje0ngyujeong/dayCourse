import React from "react";
import styled from 'styled-components';

const StyledButton = styled.button`
  align-items: center; /* 수직 중앙 정렬 */
  padding: 10px;
  background: ${props => (props.active ? '#90B54C' : 'white')};
  cursor: pointer;
  border-radius: 30px;
  box-shadow: ${props => (props.active ? 'inset 0 2px 5px rgba(0, 0, 0, 0.1)' : 'none')};
  font-weight: bold; 
  font-size: 2vh;
  color: ${props => (props.active ? 'white' : '#36451c')};
  margin: 5px;
  flex: 1;
  font-size:'2vh';
  position: relative; /* 배지 위치 조정을 위해 relative 설정 */

  &:hover {
    background-color: #ccc; /* hover 색상 변경 */
  } 
`;

const TabButton = ({ active, children, onClick }) => {
    return (
        <StyledButton
            onClick={onClick} // 클릭 핸들러
            active={active} // active prop 전달
        >
            {children}
        </StyledButton>
    );
};

export default TabButton;
