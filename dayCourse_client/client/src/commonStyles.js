import styled from 'styled-components';

export const PageTitle = styled.p`
  ${'' /* font-size: 30px; */}
  ${'' /* font-family: "Bagel Fat One", system-ui; */}
  ${'' /* font-family: 'HSSanTokki20-Regular', system-ui; */}
  font-family: 'NPSfontBold', system-ui;
  ${'' /* font-family: 'iceHimchan-Rg', system-ui; */}
  ${'' /* font-family: '양진체', system-ui; */}
  ${'' /* font-family: 'STUNNING-Bd', system-ui; */}
  ${'' /* font-family: 'GapyeongWave', system-ui; */}
  ${'' /* font-family: 'omyu_pretty', system-ui; */}
  ${'' /* font-family: 'Ownglyph_meetme-Rg', system-ui; */}
  ${'' /* font-family: 'DungGeunMo', system-ui; */}
  ${'' /* font-weight: 400; */}
  ${'' /* font-style: normal; */}
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


