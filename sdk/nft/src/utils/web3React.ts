import Web3 from 'web3';
import { InjectedConnector } from '@web3-react/injected-connector';

export const injected = new InjectedConnector({
  supportedChainIds: [
    1, // Mainet
    42, // Kovan
    56, // BSC
    97, // BSC-Test
  ],
});

export const getLibrary = (provider: Web3) => {
  return provider;
};
