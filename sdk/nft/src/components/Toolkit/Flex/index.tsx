import styled from 'styled-components';
import { space, layout, LayoutProps, SpaceProps } from 'styled-system';

interface FlexProps extends LayoutProps, SpaceProps {}

const Flex = styled.div<FlexProps>`
  display: flex;
  justify-content: center;
  align-items: center;

  ${layout}
  ${space}
`;

export default Flex;
