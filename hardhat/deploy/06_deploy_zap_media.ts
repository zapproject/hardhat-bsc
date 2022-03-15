import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { DeployFunction } from 'hardhat-deploy/types';
import { makeDeployProxy } from '@openzeppelin/hardhat-upgrades/dist/deploy-proxy';
import { ZapMarket, MediaFactory, ZapMedia } from '../typechain';
import { ethers } from 'hardhat';
import { Event } from 'ethers';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getUnnamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const unnamed = await getUnnamedAccounts();
  const signers = await ethers.getSigners();

  // Gets the chainID of the network the contracts are deploying to
  const chainId = await (await ethers.provider.getNetwork()).chainId;

  const factoryAddress = await (
    await hre.deployments.get('MediaFactory')
  ).address;

  const mediaFactoryFactory = await ethers.getContractFactory('MediaFactory');

  const zapMediaAbi = await await hre.deployments.get('ZapMedia');

  const mediaFactory = await mediaFactoryFactory.attach(factoryAddress);

  const marketAddress = await (await hre.deployments.get('ZapMarket')).address;

  const name = 'Zap Collection';

  let symbol = '';

  let contractURI = '';

  switch (chainId) {
    // Ethereum mainnet deployment
    case 1:
      symbol = 'ZAP';
      contractURI =
        'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/mainnet';
      break;

    // Localhost deployment
    case 31337:
      symbol = 'ZAPLCL';
      contractURI =
        'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/';
      break;

    // Rinkeby deployment
    case 4:
      symbol = 'ZAPRKBY';
      contractURI =
        'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/rinkeby';
      break;

    // BSC Testnet deployment
    case 97:
      symbol = 'ZAPBSC';
      contractURI =
        'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/bscTest';
      break;

    // BSC Mainnet Deployment
    case 56:
      symbol = 'ZAP';
      contractURI =
        'https://bafybeiev76hwk2gu7xmy5h3dn2f6iquxkhu4dhwpjgmt6ookrn6ykbtfi4.ipfs.dweb.link/bsc';
  }

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

  const zapMedia = new ethers.Contract(
    zapMediaAddress,
    zapMediaAbi.abi,
    signers[0]
  ) as ZapMedia;
  await zapMedia.deployed();

  console.log('ZapMedia deployed to:', zapMedia.address);

  await zapMedia.claimTransferOwnership();
};

export default func;
func.id = 'deploy_zap_media';
func.tags = ['ZapMedia'];
