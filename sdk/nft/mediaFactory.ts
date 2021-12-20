import { Contract, ethers, Signer } from 'ethers';
import { mediaFactoryAddresses, zapMarketAddresses } from './addresses';
import { mediaFactoryAbi } from './abi';

let mediaFactoryAddress: string;
let zapMarketAddress: string;

function contractAddresses(networkId: number) {
  switch (networkId) {
    // Localhost
    case 31337:
      mediaFactoryAddress = mediaFactoryAddresses.localhost;
      zapMarketAddress = zapMarketAddresses.localhost;
      console.log('localhost');
      break;

    // Rinkeby
    case 4:
      mediaFactoryAddress = mediaFactoryAddresses.rinkeby;
      zapMarketAddress = zapMarketAddresses.rinkeby;
      console.log('Rinkeby');
      break;
  }

  return {
    mediaFactoryAddress,
    zapMarketAddress,
  };
}

class MediaFactory {
  contract: Contract;
  networkId: number;
  signer: Signer;

  constructor(networkId: number, signer: Signer) {
    this.networkId = networkId;
    this.signer = signer;
    this.contract = new ethers.Contract(
      contractAddresses(networkId).mediaFactoryAddress,
      mediaFactoryAbi,
      signer,
    )
  }

  deployMedia(
    collectionName: string,
    collectionSymbol: string,
    permissive: boolean,
    collectionMetadta: string
  ): Promise<void> {
    return this.contract.deployMedia(
      collectionName,
      collectionSymbol,
      contractAddresses(this.networkId).zapMarketAddress,
      permissive,
      collectionMetadta,
    )
  };

}

export default MediaFactory;
