import styled from 'styled-components';
import { space, typography, border, color as baseColor } from 'styled-system';
import { TextProps } from './types';

export const Text = styled.div<TextProps>`
  width: auto;
  font-size: 16px;
  line-height: 1.3;

  ${space}
  ${typography}
  ${border}
  ${baseColor}

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

Text.defaultProps = {
  color: 'textPrimary',
};

export const Title = styled(Text)`
  font-family: FletcherGothicFLF;
  font-style: normal;
  font-weight: 500;
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: -0.02em;

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 48px;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 52px;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    font-size: 60px;
  }
`;

export const SubTitle = styled(Text)`
  font-family: FletcherGothicFLF;
  font-style: normal;
  font-weight: 500;
  font-size: 26px;
  line-height: 1.2;

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 36px;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 38px;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    font-size: 42px;
  }
`;

export const Content = styled(Text)`
  text-align: left;
`;
