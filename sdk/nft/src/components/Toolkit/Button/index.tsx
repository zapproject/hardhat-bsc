import styled from 'styled-components';
import { space, layout } from 'styled-system';

const Button = styled.button`
  padding: 18px 36px;
  background: ${({ theme }) => theme.colors.primary};
  border: ${({ theme }) => `4px solid ${theme.colors.primaryText}`};
  border-radius: 14px;
  box-sizing: border-box;
  font-family: FletcherGothicFLF;
  font-weight: 500;
  font-style: normal;
  font-size: 32px;
  line-height: 38px;
  text-align: center;
  cursor: pointer;

  ${layout}
  ${space}

  ${({ theme }) => theme.mediaQueries.xl} {
    font-size: 42px;
    line-height: 50px;
  }
`;

export default Button;
