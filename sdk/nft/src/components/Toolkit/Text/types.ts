import { SpaceProps, TypographyProps, ColorProps, BorderProps } from 'styled-system';

export interface TextProps extends SpaceProps, TypographyProps, ColorProps, BorderProps {
  font?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
}
