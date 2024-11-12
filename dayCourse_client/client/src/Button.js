import styled from 'styled-components';


const ButtonStyle = styled.button`
  display: flex;
  all: unset;
  text-align: center;
  cursor: pointer;
  border: ${(props) => props.$border || 'solid 1px #ccc'};
  border-radius: 8px;
  color: ${(props) => props.color || 'black'};
  background-color: ${(props) => props.$background || 'white'};
  font-family: 'NPSfontBold', system-ui;
  font-weight: ${(props) => props.bold ? 'bold' : 'normal'};
  margin: ${(props) => props.margin || '1px'};
  &:hover {
    background-color: #e0e0e0;
    border-color: white;
    color: inherit;
    transform: none;
  }
  align-items: center; 
  justify-content: center; 
  white-space: nowrap;
  overflow: hidden; 
  font-size: clamp(4px, 2.5vw, 14px); 
  width: ${(props) => props.width || '2rem'};
  height: ${(props) => props.height || '2rem'};
  line-height: 1; 
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