import React from 'react'
import { Box } from 'react-feather'
import styled from 'styled-components'
import { theme } from '../theme'

const HeaderOuterWrapper = styled.div`
  height: 80px;
  display: flex;
  width: 100%;
  z-index: 2;
  box-shadow: inset 0px -3px 0px #f1f2f6;
  background-color: ${theme.colors.headerBgColor};
`

const HeaderInnerWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  margin: 0 auto;
  max-width: ${theme.sizing.maxWidthPageWrapper}px;
  padding: 8px;
`

const Header = () => {
  return (
    <HeaderOuterWrapper>
      <HeaderInnerWrapper>
        <Box />
        <div style={{ marginLeft: 8 }}>ACME Corp</div>
      </HeaderInnerWrapper>
    </HeaderOuterWrapper>
  )
}
const MemoizedHeader = React.memo(Header)

export { MemoizedHeader as Header }
