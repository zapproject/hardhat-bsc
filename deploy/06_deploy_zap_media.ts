import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { DeployFunction } from 'hardhat-deploy/types'
import { makeDeployProxy } from '@openzeppelin/hardhat-upgrades/dist/deploy-proxy'
import { ZapMarket, MediaFactory, ZapMedia } from '../typechain'
import { ethers, } from 'hardhat'
import { Event } from 'ethers';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts, getUnnamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const unnamed = await getUnnamedAccounts();
    const signers = await ethers.getSigners();

    const useProxy = !hre.network.live

    const factoryAddress = await (await hre.deployments.get('MediaFactory')).address;

    const mediaFactoryFactory = await ethers.getContractFactory('MediaFactory');

    const zapMediaAbi = await (await hre.deployments.get('ZapMedia'));

    const mediaFactory = await mediaFactoryFactory.attach(factoryAddress);

    const marketAddress = await (await hre.deployments.get('ZapMarket')).address;

    const name = 'Zap Collection';

    const symbol = "ZAPRKBY";

    const contractURI = 'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/rinkeby';

    const tx = await mediaFactory.deployMedia(
        name,
        symbol,
        marketAddress,
        true,
        contractURI
    );

    const receipt = await tx.wait();
    const mediaDeployedEvents = receipt.events as Event[];
    const mediaDeployedEvent = mediaDeployedEvents.slice(-1);
    const zapMediaAddress = mediaDeployedEvent[0].args?.mediaContract;

    const zapMedia = new ethers.Contract(zapMediaAddress, zapMediaAbi.abi, signers[0]) as ZapMedia;
    await zapMedia.deployed();

    console.log(zapMedia.address)

    console.log(await zapMedia.symbol())
}

export default func
func.id = 'deploy_zap_media'
func.tags = ['ZapMedia'];