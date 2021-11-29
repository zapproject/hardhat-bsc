import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { DeployFunction } from 'hardhat-deploy/types';
import { makeDeployProxy } from '@openzeppelin/hardhat-upgrades/dist/deploy-proxy';
import { ZapVault } from '../typechain';
import { ethers, } from 'hardhat'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts, getUnnamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts();
    const unnamed = await getUnnamedAccounts();

    const useProxy = !hre.network.live;

    // Gets the chainID of the network the contracts are deploying to
    const chainId = await (await ethers.provider.getNetwork()).chainId;

    // Deployed ZapToken on Ethereum Mainnet
    const ethMainAddress = '0x6781a0f84c7e9e846dcb84a9a5bd49333067b104';

    // Deployed ZapToken on Rinkeby
    const rinkebyAddress = '0x5877451904f0484cc49DAFdfb8f9b33C8C31Ee2F';

    // Deployed ZapToken on BSC Testnet
    const bscTestAddress = '0x09d8AF358636D9BCC9a3e177B66EB30381a4b1a8';

    // Deployed ZapToken on BSC Mainnet
    const bscMainAddress = '0xC5326b32E8BaEF125AcD68f8bC646fD646104F1c';

    let tokenAddress = '';

    let localhostAddress = '';

    try {

        localhostAddress = (await hre.deployments.get('ZapTokenBSC')).address;

    } catch (err) {

        console.log("Localhost ZapTokenBSC deployment not detected")

    }

    switch (chainId) {

        // Ethereum mainnet deployment
        case 1:
            tokenAddress = ethMainAddress
            break;

        // Localhost deployment
        case 31337:
            tokenAddress = localhostAddress
            console.log("Localhost")
            break;

        // Rinkeby deployment
        case 4:
            tokenAddress = rinkebyAddress;
            break;

        // BSC Testnet deployment
        case 97:
            tokenAddress = bscTestAddress
            break;

        // BSC Mainnet Deployment
        case 56:
            tokenAddress = bscMainAddress
            break;
    }


    // Proxy only in non-live network (localhost and hardhat network) enabling
    // HCR (Hot Contract Replacement) in live network, proxy is disabled and
    // constructor is invoked
    await deploy('ZapVault', {
        from: deployer,
        proxy: {
            proxyContract: 'OpenZeppelinTransparentProxy',
            execute: {
                methodName: 'initializeVault',
                args: [tokenAddress]
            }
        },
        log: true,
    })
    return !useProxy // When live network, record the script as executed to prevent rexecution
}

export default func
func.id = 'deploy_zap_vault'
func.tags = ['ZapVault'];