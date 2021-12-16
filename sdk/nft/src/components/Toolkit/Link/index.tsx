import { Link as BaseLink } from 'react-router-dom';
import { HashLink as BaseHashLink } from 'react-router-hash-link';
import styled from 'styled-components';
import { space, layout } from 'styled-system';
import LinkProps from './types';

export const Link = styled(BaseLink)<LinkProps>`
  width: auto;
  margin-bottom: 30px;
  font-family: FletcherGothicFLF;
  font-style: normal;
  font-weight: 500;
  font-size: 32px;
  line-height: 38px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-decoration: none;

  ${layout}
  ${space}

  ${({ theme }) => theme.mediaQueries.md} {
    margin-bottom: 0;
    font-size: 36px;
    line-height: 43px;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    font-size: 42px;
    line-height: 50px;
  }
`;

export const ExternalLink = styled.a<LinkProps>`
  width: auto;
  text-decoration: none;

  ${layout}
  ${space}
`;

export const HashLink = styled(BaseHashLink)`
  width: auto;
  font-size: 16px;
  line-height: 1.3;

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 22px;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 24px;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    font-size: 26px;
  }
`;
