import styled from 'styled-components';

export const Wrapper = styled.div`
  padding: 0 30px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding: 0 95px;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    padding: 0 200px;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    padding: 0 400px;
  }
`;

export const Wrap = styled.div`
  padding-top: 60px;

  ${({ theme }) => theme.mediaQueries.xl} {
    padding-top: 120px;
  }
`;

export const RedWrap = styled.div`
  padding-top: 60px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding-top: 90px;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    padding-top: 120px;
  }
`;
