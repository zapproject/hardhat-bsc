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

export default async function deployMedia(
  networkId: number,
  signer: Signer,
  collectionName: string,
  collectionSymbol: string,
  permissive: boolean,
  collectionMetadta: string,
) {
  const mediaFactory: Contract = new ethers.Contract(
    contractAddresses(networkId).mediaFactoryAddress,
    mediaFactoryAbi,
    signer,
  );

  await mediaFactory.deployMedia(
    collectionName,
    collectionSymbol,
    contractAddresses(networkId).zapMarketAddress,
    permissive,
    collectionMetadta,
  );
}
