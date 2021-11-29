import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { DeployFunction } from 'hardhat-deploy/types'
import { makeDeployProxy } from '@openzeppelin/hardhat-upgrades/dist/deploy-proxy'
import { ZapMarket, MediaFactory } from '../typechain'
import { ethers } from 'hardhat'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts, getUnnamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const unnamed = await getUnnamedAccounts();

    const useProxy = !hre.network.live

    const zapMarketFactory = await ethers.getContractFactory('ZapMarket');

    // ZapMarket address
    const marketAddress = await (await hre.deployments.get('ZapMarket')).address;

    // ZapMedia Impl address
    const mediaInterfaceAddress = await (await hre.deployments.get('ZapMedia')).address;

    // Proxy only in non-live network (localhost and hardhat network) enabling
    // HCR (Hot Contract Replacement) in live network, proxy is disabled and
    // constructor is invoked
    await deploy('MediaFactory', {
        from: deployer,
        proxy: {
            proxyContract: 'OpenZeppelinTransparentProxy',
            execute: {
                methodName: 'initialize',
                args: [marketAddress, mediaInterfaceAddress]
            }
        },
        log: true,
    })

    // const zapMarket = await zapMarketFactory.attach(marketAddress);

    // const factoryAddress = await (await hre.deployments.get('MediaFactory')).address;

    // await zapMarket.setMediaFactory(factoryAddress);

    // console.log("MediaFactory set to ZapMarket");

    return !useProxy // When live network, record the script as executed to prevent rexecution
}

export default func
func.id = 'deploy_media_factory'
func.tags = ['MediaFactory'];