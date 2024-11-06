import styled from 'styled-components';

export const PageTitle = styled.h1 `
    font-size: 30px;
    `

const FooterText = styled.div `
  display: block;
  margin: 0.5rem auto;
  color: #818181;
  ${'' /* border-top: 1px solid; */}
`
export function Footer(){
    return (
    <FooterText>
      2024 HeaJo All rights reserved.
    </FooterText>
    )
}


