import React, { FC } from 'react';
import { ThemeProvider } from 'styled-components';

import theme from './styles/theme';

const Provider: FC = ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;

export default Provider;
