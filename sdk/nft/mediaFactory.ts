import { Contract, ethers, Signer } from 'ethers';
import { mediaFactoryAddresses, zapMarketAddresses } from './addresses';
import { mediaFactoryAbi, zapMediaAbi } from './abi';
import { Address } from 'cluster';

let mediaFactoryAddress: string;

let zapMarketAddress: string;

/**
   * Returns sthe MediaFactory & ZapMarket contract addresses depending on the networkId.
   * @param {string} networkId- The numeric value that routes to a blockchain network.
   */
const contractAddresses = (networkId: number) => {
  switch (networkId) {
    // Localhost
    case 31337:
      mediaFactoryAddress = mediaFactoryAddresses['31337'];
      zapMarketAddress = zapMarketAddresses['31337'];
      break;

    // Rinkeby
    case 4:
      mediaFactoryAddress = mediaFactoryAddresses['4'];
      zapMarketAddress = zapMarketAddresses['4'];
      break;

    // BSC Testnet
    case 97:
      mediaFactoryAddress = mediaFactoryAddresses['97'];
      zapMarketAddress = zapMarketAddresses['97'];
      break;

    // Ethereum Mainnet
    case 1:
      mediaFactoryAddress = mediaFactoryAddresses['1'];
      zapMarketAddress = zapMarketAddresses['1'];
      break;

    // BSC Mainnet
    case 56:
      mediaFactoryAddress = mediaFactoryAddresses['56'];
      zapMarketAddress = zapMarketAddresses['56'];
      break;
  }

  return {
    mediaFactoryAddress,
    zapMarketAddress,
  };
};

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
    );
  }

  /**
   * Deploys a NFT collection.
   * @param {string} collectionName - The name of the NFT collection.
   * @param {string} collectionSymbol - The symbol of the NFT collection.
   * @param {boolean} permissive - Determines if minting can be performed other than the collection owner.
   * @param {string} collectionMetadta - Contract level metadata.
   */
  async deployMedia(
    collectionName: string,
    collectionSymbol: string,
    permissive: boolean,
    collectionMetadta: string,
  ): Promise<void> {
    const tx = await this.contract.deployMedia(
      collectionName,
      collectionSymbol,
      contractAddresses(this.networkId).zapMarketAddress,
      permissive,
      collectionMetadta,
    );

    const receipt = await tx.wait();

    const eventLog = receipt.events[receipt.events.length - 1];

    console.log('\n', {
      transactionHash: eventLog.transactionHash,
      event: eventLog.event,
      deployedCollectionAddress: eventLog.args.mediaContract,
    });

    return eventLog;
  }
}

export default MediaFactory;
