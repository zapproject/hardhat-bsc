import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    const useProxy = !hre.network.live

    const mediaAddress = (await deployments.get('ZapMedia')).address
    const tokenAddress = (await deployments.get("ZapTokenBSC")).address

    await deploy('AuctionHouse', {
        from: deployer,
        args: [mediaAddress, tokenAddress],
        log: true,
    })

    return !useProxy
}

export default func
func.id = 'deploy_auction_house'
func.tags = ['AuctionHouse'];
func.dependencies = ['ZapMedia', 'ZapMarket'];

