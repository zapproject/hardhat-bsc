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
    font-size: 18px;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 20px;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    font-size: 22px;
  }
`;

Text.defaultProps = {
  color: 'textPrimary',
};

export const Title = styled(Text)`
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 1.3;
  letter-spacing: -0.02em;

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 22px;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 26px;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    font-size: 30px;
  }
`;

export const SubTitle = styled(Text)`
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 1.2;

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 21px;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 24px;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    font-size: 26px;
  }
`;

export const Content = styled(Text)`
  text-align: left;
`;
