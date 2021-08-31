import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { upgrades } from 'hardhat'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    const useProxy = !hre.network.live

    await deploy('ZapMarket', {
        from: deployer,
        args: [],
        log: true,
        proxy: true


    })

    return !useProxy
}

export default func
func.id = 'deploy_zap_market'
func.tags = ['ZapMarket'];
func.dependencies = [];

