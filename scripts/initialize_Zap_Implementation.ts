import { ethers, upgrades } from "hardhat";
import { BigNumber, Event } from 'ethers';
import { getImplementationAddress } from '@openzeppelin/upgrades-core';
import { MediaFactory, ZapMedia, ZapVault } from "../typechain";
import hre from 'hardhat';

const ZapMarketAddress = '0x8E85743faA25b305967609E2a5E4FA32Ea092cc4';
const ZapMediaImplementationAddress = '0x6852ee80fb02ED5e7bEB2B11E4f1F4FAFA24a82d';

// const ZapMarketABI = require('./artifacts/contracts/nft/ZapMarket.sol/ZapMarket.json').abi;
// const ZapMediaABI = require('./artifacts/contracts/nft/ZapMedia.sol/ZapMedia.json').abi;

async function main() {
    const chainId = await (await ethers.provider.getNetwork()).chainId;

    if (chainId == 1) {
        console.log('ON REAL MAINNET!!!');
        return;
    } else {
        console.log("Not on MAINNET")
    }

    const signers = await ethers.getSigners();

    // create zapMarket from already deployed address
    const zapMarketFactory = await ethers.getContractFactory('ZapMarket');    
    const zapMarket = await zapMarketFactory.attach(ZapMarketAddress);
    
    console.log(await zapMarket.getOwner());
    console.log(await zapMarket.viewFee());
    
    
    // create zapMediaImplementation from already deployed address
    const zapMediaImplementationFactory = await ethers.getContractFactory('ZapMedia');    
    const zapMediaImplementation = await zapMediaImplementationFactory.attach(ZapMediaImplementationAddress);

    console.log('Owner before: ', await zapMediaImplementation.getOwner());
    console.log(await zapMediaImplementation.contractURI());
    

    const name = '';    
    let symbol = '';    
    let contractURI = '';
    // const name = 'Zap Implementation';    
    // let symbol = 'ZAPI';    
    // let contractURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/mainnet';
    
    const gas = await zapMediaImplementation.estimateGas.initialize(
        name,
        symbol,
        ZapMarketAddress,
        false,
        contractURI
    );
    console.log("gas estimate: ", gas);

    await zapMediaImplementation
    .connect(signers[0])
    .initialize(
        name,
        symbol,
        ZapMarketAddress,
        false,
        contractURI,
        { gasLimit: gas}
    );

    console.log('Owner after: ', await zapMediaImplementation.getOwner());
    console.log("Name: ", await zapMediaImplementation.name());
    console.log("Symbol: ", await zapMediaImplementation.symbol());
    console.log("ContractURI: ",
      ethers.utils.toUtf8String(await zapMediaImplementation.contractURI())
    );
}

main()
.then(() =>
    process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
