import styled from 'styled-components';

const ButtonStyle = styled.button`
  all: unset;
  text-align: center;
  cursor: pointer;
  border: ${(props) => props.$border || 'solid 1px'}; 
  border-radius: 8px;
  color: ${(props) => props.color || 'black'};
  background-color:${(props) => props.$background || 'white'};
  &:hover {
    background-color: #e0e0e0;
    border-color: white;
    color: inherit; 
    transform: none; 
  }
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