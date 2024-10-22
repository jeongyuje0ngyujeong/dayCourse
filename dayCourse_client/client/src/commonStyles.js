import styled from 'styled-components';

export const PageTitle = styled.h1 `
    font-size: 30px;
    `

const FooterText = styled.div `
  display: block;
  margin: 2rem auto;
  text-align: center;
  color: #818181;
`
export function Footer(){
    return (
    <FooterText>
      This is a footer.
    </FooterText>
    )
}


