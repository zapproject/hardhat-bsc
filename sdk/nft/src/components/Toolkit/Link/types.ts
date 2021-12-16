import { LayoutProps, SpaceProps } from 'styled-system';

export default interface LinkProps extends LayoutProps, SpaceProps {
  isHome?: boolean;
}
