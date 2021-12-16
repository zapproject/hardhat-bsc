import { ethers } from 'ethers';
import { InjectedConnector } from '@web3-react/injected-connector';

const POLLING_INTERVAL = 12000;

export const injected = new InjectedConnector({
  supportedChainIds: [
    1, // Mainet
    4, // Rinkeby
  ],
});

export const getLibrary = (provider: any): ethers.providers.Web3Provider => {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = POLLING_INTERVAL;
  return library;
};
