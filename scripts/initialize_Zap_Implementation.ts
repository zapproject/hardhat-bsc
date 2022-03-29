import { ethers } from "hardhat";
import {ZapMedia } from "../typechain";

const ZapMarketAddress = '0x8E85743faA25b305967609E2a5E4FA32Ea092cc4';
const ZapMediaImplementationAddress = '0x6852ee80fb02ED5e7bEB2B11E4f1F4FAFA24a82d';

async function main() {
    const chainId = await (await ethers.provider.getNetwork()).chainId;

    if (chainId == 1) {
        console.log('ON MAINNET!!!');
        // return;
    } else {
        console.log("Not on MAINNET")
    }

    const signers = await ethers.getSigners();

    // create zapMediaImplementation from already deployed address
    const zapMediaImplementationFactory = await ethers.getContractFactory('ZapMedia');    
    const zapMediaImplementation = await zapMediaImplementationFactory.attach(ZapMediaImplementationAddress) as ZapMedia;

    console.log('Owner Before: ', await zapMediaImplementation.getOwner());

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
    console.log("Gas Estimate: ", gas.toString());

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

    console.log('Owner After: ', await zapMediaImplementation.getOwner());
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
