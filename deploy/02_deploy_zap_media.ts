import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre
  const { deploy } = deployments
  const {deployer} = await getNamedAccounts()

  const useProxy = !hre.network.live

  const marketAddress = (await deployments.get('ZapMarket')).address

  // Proxy only in non-live network (localhost and hardhat network) enabling
  // HCR (Hot Contract Replacement) in live network, proxy is disabled and
  // constructor is invoked
  await deploy('ZapMedia', {
    from: deployer,
    args: ['ZapMedia1', 'ZAPBSC', marketAddress],
    log: true,
  })

  return !useProxy // When live network, record the script as executed to prevent rexecution
}

export default func
func.id = 'deploy_zap_media' // ID required to prevent reexecution
func.tags = ['ZapMedia']
func.dependencies = ['ZapMarket']; // this ensure the Token script above is executed first, so `deployments.get('Token')` succeeds
