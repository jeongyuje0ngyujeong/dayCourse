import styled from 'styled-components';

const ButtonStyle = styled.button`
  all: unset;
  text-align: center;
  cursor: pointer;
  border:  ${(props) => props.$border || 'solid 1px #ccc'};
  border-radius: 8px;
  color: ${(props) => props.color || 'black'};
  background-color:${(props) => props.$background || 'white'};
  font-weight: ${(props) => props.bold ? 'bold' : 'normal'}; 
  margin: ${(props) => props.margin || '0'}; 
  &:hover {
    background-color: #e0e0e0;
    border-color: white;
    color: inherit; 
    transform: none; 
  }
  margin:1px;
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */
  overflow: hidden; /* 넘치는 텍스트 숨김 */
  font-size: clamp(4px, 2.5vw, 14px); /* 반응형 글씨 크기 */
  width: ${(props) => props.width || '2rem'}; 
  height: ${(props) => props.height || '2rem'}; 
`

export function Button({ children, onClick, width, height, border, ...rest }){
    return (
    <ButtonStyle 
        onClick = {onClick}
        border={border}
        width = {width}
        height = {height}
        {...rest}
    >
        {children}
    </ButtonStyle>
  )
}