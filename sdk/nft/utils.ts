import { mediaFactoryAddresses, zapMarketAddresses } from './addresses';

let mediaFactoryAddress: string;

let zapMarketAddress: string;

/**
   * Returns sthe MediaFactory & ZapMarket contract addresses depending on the networkId.
   * @param {string} networkId- The numeric value that routes to a blockchain network.
   */
export const contractAddresses = (networkId: number) => {
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