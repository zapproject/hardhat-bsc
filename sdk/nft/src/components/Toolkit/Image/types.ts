import { LayoutProps, SpaceProps } from 'styled-system';

export default interface ImageProps extends LayoutProps, SpaceProps {
  width?: number;
  height?: number;
}
