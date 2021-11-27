import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { makeDeployProxy } from '@openzeppelin/hardhat-upgrades/dist/deploy-proxy'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts, getUnnamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const unnamed = await getUnnamedAccounts();

    const useProxy = !hre.network.live

    // ZapMarket address
    const marketAddress = await (await hre.deployments.get('ZapMarket')).address;

    // Proxy only in non-live network (localhost and hardhat network) enabling
    // HCR (Hot Contract Replacement) in live network, proxy is disabled and
    // constructor is invoked
    await deploy('AuctionHouse', {
        from: deployer,
        proxy: {
            proxyContract: 'OpenZeppelinTransparentProxy',
            execute: {
                methodName: 'initialize',
                args: ['0x5877451904f0484cc49DAFdfb8f9b33C8C31Ee2F', marketAddress]
            }
        },
        log: true,
    })
    return !useProxy // When live network, record the script as executed to prevent rexecution
}

export default func
func.id = 'deploy_auction_house'
func.tags = ['AuctionHouse'];