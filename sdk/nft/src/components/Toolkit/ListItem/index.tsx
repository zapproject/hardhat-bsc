import styled from 'styled-components';

const ListItem = styled.li`
  width: auto;
  margin-left: 26px;
  font-size: 16px;
  line-height: 1.3;

  ${({ theme }) => theme.mediaQueries.md} {
    margin-left: 32px;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    margin-left: 36px;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    margin-left: 38px;
  }
`;

export default ListItem;
