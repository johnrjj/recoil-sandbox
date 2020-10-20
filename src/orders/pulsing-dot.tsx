import React from 'react'
import styled, { keyframes } from 'styled-components'
import { theme } from '../theme'

const pulseRing = keyframes`
  0% { transform: scale(.5); }
  80%, 100% { opacity: 0; }
`

const pulseDot = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
`

const PulsingDot = styled.div<{ connected: boolean }>`
  animation: ${pulseDot} 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite;
  background-color: ${(props) => (props.connected ? theme.palette.green : theme.palette.yellow)};
  border-radius: 50%;
  box-sizing: border-box;
  height: 15px;
  width: 15px;
  min-height: 15px;
  min-width: 15px;
  &:before {
    animation: ${pulseRing} 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    background-color: ${(props) => (props.connected ? theme.palette.green : theme.palette.yellow)};
    border-radius: 45px;
    content: '';
    display: block;
    height: 150%;
    left: -30%;
    position: relative;
    top: -30%;
    width: 150%;
  }
`

const MemoizedPulsingDot = React.memo(PulsingDot)

export { MemoizedPulsingDot as PulsingDot }
