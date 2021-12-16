import React, { FC } from 'react';
import { ThemeProvider } from 'styled-components';
import { Web3ReactProvider } from '@web3-react/core';

import { getLibrary } from './utils/web3React';
import theme from './styles/theme';

const Provider: FC = ({ children }) => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  </Web3ReactProvider>
);

export default Provider;
