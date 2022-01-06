import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { makeDeployProxy } from '@openzeppelin/hardhat-upgrades/dist/deploy-proxy'
import { ZapMarket } from '../typechain'
import { ethers } from 'hardhat';
import { BigNumber } from '@ethersproject/bignumber';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts, getUnnamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const unnamed = await getUnnamedAccounts();

    const useProxy = !hre.network.live

    const zapMarketFactory = await ethers.getContractFactory('ZapMarket');

    const vaultAddress = await (await hre.deployments.get('ZapVault')).address;

    // Sets the fee at to 5%
    const platformFee = {
        fee: {
            value: BigNumber.from('5000000000000000000')
        },
    };

    // Proxy only in non-live network (localhost and hardhat network) enabling
    // HCR (Hot Contract Replacement) in live network, proxy is disabled and
    // constructor is invoked
    await deploy('ZapMarket', {
        from: deployer,
        proxy: {
            proxyContract: 'OpenZeppelinTransparentProxy',
            execute: {
                methodName: 'initializeMarket',
                args: [vaultAddress]
            }
        },
        log: true,
    })

    // ZapMarket address
    const marketAddress = await (await hre.deployments.get('ZapMarket')).address;

    // ZapMarket instance
    const zapMarket = await zapMarketFactory.attach(marketAddress);

    // Set fee to 5%
    await zapMarket.setFee(platformFee);

    console.log("Platform fee set for ZapMarket", await zapMarket.viewFee());

    return !useProxy // When live network, record the script as executed to prevent rexecution

}

export default func
func.id = 'deploy_zap_market'
func.tags = ['ZapMarket'];