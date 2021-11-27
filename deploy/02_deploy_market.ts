import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { makeDeployProxy } from '@openzeppelin/hardhat-upgrades/dist/deploy-proxy'
import { ZapVault } from '../typechain'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts, getUnnamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const unnamed = await getUnnamedAccounts();

    const useProxy = !hre.network.live

    const vaultAddress = await (await hre.deployments.get('ZapVault')).address

    // Proxy only in non-live network (localhost and hardhat network) enabling
    // HCR (Hot Contract Replacement) in live network, proxy is disabled and
    // constructor is invoked
    await deploy('ZapMarket', {
        from: deployer,
        proxy: {
            execute: {
                methodName: 'initializeMarket',
                args: [vaultAddress]
            }
        },
        log: true,
    })
    return useProxy // When live network, record the script as executed to prevent rexecution
}

export default func
func.id = 'deploy_zap_market'
func.tags = ['ZapMarket'];