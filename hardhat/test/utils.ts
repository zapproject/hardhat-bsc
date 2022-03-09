// @ts-ignore
import { ethers, upgrades } from 'hardhat';
import {
  ZapMarket,
  ZapMedia,
  ZapVault,
  ZapTokenBSC,
  Media1155,
  ZapMarketV2,
  ZapMediaV2,
  AuctionHouseV2
} from '../typechain';
import {
  BadMedia1155,
  BadBidder,
  AuctionHouse,
  WETH,
  BadERC721,
  TestERC721,
  MediaFactory,
  Media1155Factory
} from '../typechain';
import { keccak256 } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { ContractFactory, Event } from '@ethersproject/contracts';
import { fromRpcSig } from 'ethereumjs-util';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

export default class Decimal {
  static new(value: number) {
    const decimalPlaces = countDecimals(value);
    const difference = 18 - decimalPlaces;
    const zeros = BigNumber.from(10).pow(difference);
    const abs = BigNumber.from(`${value.toString().replace('.', '')}`);
    return { value: abs.mul(zeros) };
  }

  static raw(value: number) {
    return { value: BigNumber.from(value) };
  }
}

function countDecimals(value: any) {
  if (Math.floor(value) !== value)
    return value.toString().split('.')[1].length || 0;
  return 0;
}

export const THOUSANDTH_ETH = ethers.utils.parseUnits(
  '0.001',
  'ether'
) as BigNumber;
export const TENTH_ETH = ethers.utils.parseUnits('0.1', 'ether') as BigNumber;
export const ONE_ETH = ethers.utils.parseUnits('1', 'ether') as BigNumber;
export const TWO_ETH = ethers.utils.parseUnits('2', 'ether') as BigNumber;
export const THREE_ETH = ethers.utils.parseUnits('3', 'ether') as BigNumber;

export const deployWETH = async () => {
  const [deployer] = await ethers.getSigners();
  return (await (await ethers.getContractFactory('WETH')).deploy()) as WETH;
};

export const deployOtherNFTs = async () => {
  const bad = (await (
    await ethers.getContractFactory('BadERC721')
  ).deploy()) as BadERC721;
  const test = (await (
    await ethers.getContractFactory('TestERC721')
  ).deploy()) as TestERC721;

  return { bad, test };
};

export const deployJustMedias = async (
  signers: SignerWithAddress[],
  zapMarket: ZapMarket,
  mediaDeploy: MediaFactory
) => {
  await zapMarket.setMediaFactory(mediaDeploy.address);

  const mediaArgs = [
    {
      name: 'TEST MEDIA 1',
      symbol: 'TM1',
      marketContractAddr: zapMarket.address,
      permissive: true,
      collectionURI:
        'https://ipfs.moralis.io:2053/ipfs/QmeWPdpXmNP4UF9Urxyrp7NQZ9unaHfE2d43fbuur6hWWV'
    },
    {
      name: 'TEST MEDIA 2',
      symbol: 'TM2',
      marketContractAddr: zapMarket.address,
      permissive: false,
      collectionURI:
        'https://ipfs.io/ipfs/QmTDCTPF6CpUK7DTqcUvRpGysfA1EbgRob5uGsStcCZie6'
    },
    {
      name: 'TEST MEDIA 2',
      symbol: 'TM2',
      marketContractAddr: zapMarket.address,
      permissive: false,
      collectionURI:
        'https://ipfs.moralis.io:2053/ipfs/QmXtZVM1JwnCXax1y5r6i4ARxADUMLm9JSq5Rnn3vq9qsN'
    }
  ];

  const medias: ZapMedia[] = [];
  const mediaDeployers = [signers[1], signers[2], signers[3]];

  let filter;
  let eventLog: Event;
  let mediaAddress: string;
  const zmABI =
    require('../artifacts/contracts/nft/ZapMedia.sol/ZapMedia.json').abi;

  for (let i = 0; i < mediaArgs.length; i++) {
    const args = mediaArgs[i];

    await mediaDeploy
      .connect(mediaDeployers[i])
      .deployMedia(
        args.name,
        args.symbol,
        args.marketContractAddr,
        args.permissive,
        args.collectionURI
      );

    filter = mediaDeploy.filters.MediaDeployed(null);
    eventLog = (await mediaDeploy.queryFilter(filter))[i];
    mediaAddress = eventLog.args?.mediaContract;

    medias.push(
      new ethers.Contract(mediaAddress, zmABI, mediaDeployers[i]) as ZapMedia
    );
  }

  return medias;
};

export const deployOneMedia = async (
  signer: SignerWithAddress,
  zapMarket: ZapMarket,
  fact: MediaFactory,
  q: number
) => {
  const mediaArgs = {
    name: 'TEST MEDIA ' + `${q}`,
    symbol: 'TM' + `${q}`,
    marketContractAddr: zapMarket.address,
    permissive: false,
    collectionURI:
      'https://ipfs.moralis.io:2053/ipfs/QmeWPdpXmNP4UF9Urxyrp7NQZ9unaHfE2d43fbuur6hWWV'
  };

  let media: ZapMedia;
  let filter;
  let eventLog: Event;
  let mediaAddress: string;
  const zmABI =
    require('../artifacts/contracts/nft/ZapMedia.sol/ZapMedia.json').abi;

  await fact
    .connect(signer)
    .deployMedia(
      mediaArgs.name,
      mediaArgs.symbol,
      mediaArgs.marketContractAddr,
      mediaArgs.permissive,
      mediaArgs.collectionURI
    );

  filter = fact.filters.MediaDeployed(null);
  eventLog = (await fact.queryFilter(filter))[0];
  mediaAddress = eventLog.args?.mediaContract;

  media = new ethers.Contract(mediaAddress, zmABI, signer) as ZapMedia;

  return media;
};

export const deployZapNFTMarketplace = async () => {
  let market: ZapMarket;
  let media1: ZapMedia;
  let media2: ZapMedia;
  let media3: ZapMedia;
  let zapVault: ZapVault;
  let zapTokenBsc: ZapTokenBSC;
  let mediaFactory: MediaFactory;

  let platformFee = {
    fee: {
      value: BigNumber.from('5000000000000000000')
    }
  };

  const [deployer0, deployer1, deployer2, deployer3] =
    await ethers.getSigners();

  const zapTokenFactory = await ethers.getContractFactory(
    'ZapTokenBSC',
    deployer0
  );

  zapTokenBsc = (await zapTokenFactory.deploy()) as ZapTokenBSC;
  await zapTokenBsc.deployed();

  const zapVaultFactory = await ethers.getContractFactory('ZapVault');

  zapVault = (await upgrades.deployProxy(
    zapVaultFactory,
    [zapTokenBsc.address],
    {
      initializer: 'initializeVault'
    }
  )) as ZapVault;

  const marketFactory = await ethers.getContractFactory('ZapMarket', deployer0);

  market = (await upgrades.deployProxy(marketFactory, [zapVault.address], {
    initializer: 'initializeMarket'
  })) as ZapMarket;

  await market.setFee(platformFee);

  const unInitMediaFactory = await ethers.getContractFactory('ZapMedia');

  const unInitMedia = (await unInitMediaFactory.deploy()) as ZapMedia;

  const mediaFactoryFactory = await ethers.getContractFactory(
    'MediaFactory',
    deployer0
  );
  mediaFactory = (await upgrades.deployProxy(
    mediaFactoryFactory,
    [market.address, unInitMedia.address],
    { initializer: 'initialize' }
  )) as MediaFactory;
  await market.setMediaFactory(mediaFactory.address);

  const mediaArgs = [
    {
      name: 'Test Media 1',
      symbol: 'TM1',
      marketContractAddr: market.address,
      permissive: true,
      collectionURI:
        'https://ipfs.moralis.io:2053/ipfs/QmeWPdpXmNP4UF9Urxyrp7NQZ9unaHfE2d43fbuur6hWWV'
    },
    {
      name: 'Test Media 1',
      symbol: 'TM1',
      marketContractAddr: market.address,
      permissive: false,
      collectionURI:
        'https://ipfs.io/ipfs/QmTDCTPF6CpUK7DTqcUvRpGysfA1EbgRob5uGsStcCZie6'
    },
    {
      name: 'Test Media 1',
      symbol: 'TM1',
      marketContractAddr: market.address,
      permissive: false,
      collectionURI:
        'https://ipfs.moralis.io:2053/ipfs/QmXtZVM1JwnCXax1y5r6i4ARxADUMLm9JSq5Rnn3vq9qsN'
    }
  ];

  const medias: ZapMedia[] = [];
  const mediaDeployers = [deployer1, deployer2, deployer3];

  let filter;
  let eventLog: Event;
  let mediaAddress: string;
  const zmABI =
    require('../artifacts/contracts/nft/ZapMedia.sol/ZapMedia.json').abi;

  for (let i = 0; i < mediaArgs.length; i++) {
    const args = mediaArgs[i];
    await mediaFactory
      .connect(mediaDeployers[i])
      .deployMedia(
        args.name,
        args.symbol,
        args.marketContractAddr,
        args.permissive,
        args.collectionURI
      );

    filter = mediaFactory.filters.MediaDeployed(null);
    eventLog = (await mediaFactory.queryFilter(filter))[i];
    mediaAddress = eventLog.args?.mediaContract;

    medias.push(
      new ethers.Contract(mediaAddress, zmABI, mediaDeployers[i]) as ZapMedia
    );
  }
  return { market, medias, zapTokenBsc, zapVault, mediaFactory };
};

export const deployBidder = async (auction: string, nftContract: string) => {
  return (await (
    await (
      await ethers.getContractFactory('BadBidder')
    ).deploy(auction, nftContract)
  ).deployed()) as BadBidder;
};

export const mint = async (media: ZapMedia | ZapMediaV2) => {
  const metadataHex = ethers.utils.formatBytes32String('{}');
  const metadataHash = await keccak256(metadataHex);
  const hash = ethers.utils.arrayify(metadataHash);

  const signers = await ethers.getSigners();

  let collaborators = {
    collaboratorTwo: signers[10].address,
    collaboratorThree: signers[11].address,
    collaboratorFour: signers[12].address
  };

  await media.mint(
    {
      tokenURI: 'zap.co',
      metadataURI: 'zap.co',
      contentHash: hash,
      metadataHash: hash
    },
    {
      collaborators: [
        signers[10].address,
        signers[11].address,
        signers[12].address
      ],
      collabShares: [
        BigNumber.from('15000000000000000000'),
        BigNumber.from('15000000000000000000'),
        BigNumber.from('15000000000000000000')
      ],
      creator: {
        value: BigNumber.from('15000000000000000000')
      },
      owner: {
        value: BigNumber.from('35000000000000000000')
      }
    }
  );
};

export const approveAuction = async (
  media: ZapMedia | ZapMediaV2,
  auctionHouse: AuctionHouse | AuctionHouseV2
) => {
  await media.approve(auctionHouse.address, 0);
};

export const revert = (messages: TemplateStringsArray) =>
  `VM Exception while processing transaction: revert ${messages[0]}`;

export async function signPermit(
  zapMedia: ZapMedia,
  toAddress: any,
  signers: any,
  tokenId: any,
  version: string
) {
  const nonce = (
    await zapMedia.getPermitNonce(signers[4].address, tokenId)
  ).toNumber();

  const deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24; // 24 hours
  const name = await zapMedia.name();

  const chainId = await signers[5].getChainId();
  const domain = {
    name,
    version,
    chainId,
    verifyingContract: zapMedia.address
  };
  const types = {
    Permit: [
      { name: 'spender', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  };
  const value = {
    spender: toAddress,
    tokenId,
    nonce,
    deadline
  };
  let sig = await signers[4]._signTypedData(domain, types, value);
  sig = fromRpcSig(sig);
  sig = {
    v: sig.v,
    r: sig.r,
    s: sig.s,
    deadline: deadline.toString()
  };

  return sig;
}

export async function signMintWithSig(
  zapMedia: ZapMedia,
  signers: any,
  contentHash: any,
  metadataHash: any,
  version: string
) {
  const nonce = (await zapMedia.getSigNonces(signers[1].address)).toNumber();
  const deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24; // 24 hours
  const name = await zapMedia.name();

  const chainId = await signers[1].getChainId();
  const creatorShare = BigInt(15000000000000000000);
  const domain = {
    name,
    version,
    chainId,
    verifyingContract: zapMedia.address
  };
  const types = {
    MintWithSig: [
      { name: 'contentHash', type: 'bytes32' },
      { name: 'metadataHash', type: 'bytes32' },
      { name: 'creatorShare', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  };
  const value = {
    contentHash,
    metadataHash,
    creatorShare,
    nonce,
    deadline
  };
  let sig = await signers[1]._signTypedData(domain, types, value);
  sig = fromRpcSig(sig);
  sig = {
    r: sig.r,
    s: sig.s,
    v: sig.v,

    deadline: deadline.toString()
  };
  return sig;
}

export const deploy1155Medias = async (
  signers: SignerWithAddress[],
  zapMarket: ZapMarketV2,
  media1155Deploy: Media1155Factory
) => {
  await zapMarket.setMediaFactory(media1155Deploy.address);

  const mediaArgs = [
    {
      uri: 'https://test1',
      marketContractAddr: zapMarket.address,
      permissive: true,
      collectionURI:
        'https://ipfs.moralis.io:2053/ipfs/QmeWPdpXmNP4UF9Urxyrp7NQZ9unaHfE2d43fbuur6hWWV'
    },
    {
      uri: 'https://test2',
      marketContractAddr: zapMarket.address,
      permissive: false,
      collectionURI:
        'https://ipfs.io/ipfs/QmTDCTPF6CpUK7DTqcUvRpGysfA1EbgRob5uGsStcCZie6'
    },
    {
      uri: 'https://test3',
      marketContractAddr: zapMarket.address,
      permissive: false,
      collectionURI:
        'https://ipfs.moralis.io:2053/ipfs/QmXtZVM1JwnCXax1y5r6i4ARxADUMLm9JSq5Rnn3vq9qsN'
    }
  ];

  const medias: Media1155[] = [];
  const mediaDeployers = [signers[1], signers[2], signers[3]];

  let filter;
  let eventLog: Event;
  let mediaAddress: string;
  const zmABI =
    require('../artifacts/contracts/nft/Media1155.sol/Media1155.json').abi;

  for (let i = 0; i < mediaArgs.length; i++) {
    const args = mediaArgs[i];

    await media1155Deploy
      .connect(mediaDeployers[i])
      .deployMedia(
        args.uri,
        args.marketContractAddr,
        args.permissive,
        args.collectionURI
      );

    filter = media1155Deploy.filters.Media1155Deployed(null);
    eventLog = (await media1155Deploy.queryFilter(filter))[i];
    mediaAddress = eventLog.args?.mediaContract;

    medias.push(
      new ethers.Contract(mediaAddress, zmABI, mediaDeployers[i]) as Media1155
    );
  }

  return medias;
};

export const deployV2ZapNFTMarketplace = async (market: ZapMarketV2) => {
  let mediaFactory: MediaFactory;

  let platformFee = {
    fee: {
      value: BigNumber.from('5000000000000000000')
    }
  };

  const [deployer0, deployer1, deployer2, deployer3] =
    await ethers.getSigners();

  const unInitMediaFactory = await ethers.getContractFactory('ZapMediaV2');

  const unInitMedia = (await unInitMediaFactory.deploy()) as ZapMediaV2;

  const mediaFactoryFactory = await ethers.getContractFactory(
    'MediaFactory',
    deployer0
  );
  mediaFactory = (await upgrades.deployProxy(
    mediaFactoryFactory,
    [market.address, unInitMedia.address],
    { initializer: 'initialize' }
  )) as MediaFactory;
  await market.setMediaFactory(mediaFactory.address);

  const mediaArgs = [
    {
      name: 'Test Media 1',
      symbol: 'TM1',
      marketContractAddr: market.address,
      permissive: true,
      collectionURI:
        'https://ipfs.moralis.io:2053/ipfs/QmeWPdpXmNP4UF9Urxyrp7NQZ9unaHfE2d43fbuur6hWWV'
    },
    {
      name: 'Test Media 1',
      symbol: 'TM1',
      marketContractAddr: market.address,
      permissive: false,
      collectionURI:
        'https://ipfs.io/ipfs/QmTDCTPF6CpUK7DTqcUvRpGysfA1EbgRob5uGsStcCZie6'
    },
    {
      name: 'Test Media 1',
      symbol: 'TM1',
      marketContractAddr: market.address,
      permissive: false,
      collectionURI:
        'https://ipfs.moralis.io:2053/ipfs/QmXtZVM1JwnCXax1y5r6i4ARxADUMLm9JSq5Rnn3vq9qsN'
    }
  ];

  const medias: ZapMediaV2[] = [];
  const mediaDeployers = [deployer1, deployer2, deployer3];

  let filter;
  let eventLog: Event;
  let mediaAddress: string;
  const zmABI =
    require('../artifacts/contracts/nft/ZapMedia.sol/ZapMedia.json').abi;

  for (let i = 0; i < mediaArgs.length; i++) {
    const args = mediaArgs[i];
    await mediaFactory
      .connect(mediaDeployers[i])
      .deployMedia(
        args.name,
        args.symbol,
        args.marketContractAddr,
        args.permissive,
        args.collectionURI
      );

    filter = mediaFactory.filters.MediaDeployed(null);
    eventLog = (await mediaFactory.queryFilter(filter))[i];
    mediaAddress = eventLog.args?.mediaContract;

    medias.push(
      new ethers.Contract(mediaAddress, zmABI, mediaDeployers[i]) as ZapMediaV2
    );
  }

  const metadataHex = ethers.utils.formatBytes32String('{}');
  const metadataHash = await keccak256(metadataHex);
  const hash = ethers.utils.arrayify(metadataHash);

  const signers = await ethers.getSigners();

  let collaborators = {
    collaboratorTwo: signers[10].address,
    collaboratorThree: signers[11].address,
    collaboratorFour: signers[12].address
  };

  await medias[0].connect(signers[0]).mint(
    {
      tokenURI: 'zap.co',
      metadataURI: 'zap.co',
      contentHash: hash,
      metadataHash: hash
    },
    {
      collaborators: [
        signers[10].address,
        signers[11].address,
        signers[12].address
      ],
      collabShares: [
        BigNumber.from('15000000000000000000'),
        BigNumber.from('15000000000000000000'),
        BigNumber.from('15000000000000000000')
      ],
      creator: {
        value: BigNumber.from('15000000000000000000')
      },
      owner: {
        value: BigNumber.from('35000000000000000000')
      }
    }
  );

  return { medias, mediaFactory };
};

export const approveAuctionBatch = async (
  media: Media1155 | BadMedia1155,
  auctionHouse: AuctionHouse | AuctionHouseV2
) => {
  await media.setApprovalForAll(auctionHouse.address, true);
};