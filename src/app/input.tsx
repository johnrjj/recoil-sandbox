import styled from 'styled-components'
import { theme } from '../theme'

const Input = styled.input`
  height: 48px;
  width: 100%;
  background: '#f6f6f9';
  box-sizing: border-box;
  border: 1px solid transparent;
  box-shadow: 0px 0px 1px rgba(14, 16, 60, 0.2);
  border-radius: 6px;
  font-weight: 500;
  font-family: 'Inter';
  font-size: 20px;
  line-height: 24px;
  color: ${theme.colors.primaryTextColor};
  padding-left: 15px;
  padding-right: 2px;
  outline: none;
  will-change: border, box-shadow, opacity;
  transition: border, 0.15s ease-in, box-shadow, 0.15s ease-out;
  :hover {
    border: 1px solid ${theme.colors.primaryActionColor};
    box-shadow: 0px 0px 1px rgba(14, 16, 60, 0.2);
  }
  :focus {
    border: 1px solid ${theme.colors.primaryActionColor};
    box-shadow: 0px 0px 1px rgba(14, 16, 60, 0.2);
  }
  ::placeholder {
    color: ${theme.colors.primaryTextColor};
    opacity: 0.45;
    font-size: 17px;
  }
`

export { Input }
