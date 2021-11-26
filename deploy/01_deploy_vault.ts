import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts, getUnnamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const unnamed = await getUnnamedAccounts();

    const useProxy = !hre.network.live

    // Proxy only in non-live network (localhost and hardhat network) enabling
    // HCR (Hot Contract Replacement) in live network, proxy is disabled and
    // constructor is invoked
    await deploy('ZapVault', {
        from: deployer,
        proxy: {
            methodName: 'initialize',
        },
        args: ['0x5877451904f0484cc49DAFdfb8f9b33C8C31Ee2F'],
        log: true,
    })
    return !useProxy // When live network, record the script as executed to prevent rexecution
}

export default func
func.id = 'deploy_zap_vault'
func.tags = ['ZapVault'];