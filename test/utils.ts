// @ts-ignore
import { ethers, upgrades } from "hardhat";
import {
  ZapMarket, ZapMedia, ZapVault, ZapTokenBSC
} from "../typechain"
import {
  BadBidder,
  AuctionHouse,
  WETH,
  BadERC721,
  TestERC721,
} from "../typechain";
import { sha256 } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { fromRpcSig } from 'ethereumjs-util';


export default class Decimal {
  static new(value: number) {
    const decimalPlaces = countDecimals(value);
    const difference = 18 - decimalPlaces;
    const zeros = BigNumber.from(10).pow(difference);
    const abs = BigNumber.from(`${value.toString().replace(".", "")}`);
    return { value: abs.mul(zeros) };
  }

  static raw(value: number) {
    return { value: BigNumber.from(value) };
  }
}

function countDecimals(value: any) {
  if (Math.floor(value) !== value)
    return value.toString().split(".")[1].length || 0;
  return 0;
}


export const THOUSANDTH_ETH = ethers.utils.parseUnits(
  "0.001",
  "ether"
) as BigNumber;
export const TENTH_ETH = ethers.utils.parseUnits("0.1", "ether") as BigNumber;
export const ONE_ETH = ethers.utils.parseUnits("1", "ether") as BigNumber;
export const TWO_ETH = ethers.utils.parseUnits("2", "ether") as BigNumber;

export const deployWETH = async () => {
  const [deployer] = await ethers.getSigners();
  return (await (await ethers.getContractFactory("WETH")).deploy()) as WETH;
};

export const deployOtherNFTs = async () => {
  const bad = (await (
    await ethers.getContractFactory("BadERC721")
  ).deploy()) as BadERC721;
  const test = (await (
    await ethers.getContractFactory("TestERC721")
  ).deploy()) as TestERC721;

  return { bad, test };
};

export const deployZapNFTMarketplace = async () => {
  let market: ZapMarket
  let media1: ZapMedia
  let media2: ZapMedia
  let media3: ZapMedia
  let zapVault: ZapVault
  let zapTokenBsc: ZapTokenBSC

  let platformFee = {

    fee: {
      value: BigNumber.from('5000000000000000000')
    },

  };

  const [deployer0, deployer1, deployer2, deployer3] = await ethers.getSigners();

  const zapTokenFactory = await ethers.getContractFactory(
    'ZapTokenBSC',
    deployer0
  );

  zapTokenBsc = (await zapTokenFactory.deploy()) as ZapTokenBSC;
  await zapTokenBsc.deployed()


  const zapVaultFactory = await ethers.getContractFactory('ZapVault');

  zapVault = (await upgrades.deployProxy(zapVaultFactory, [zapTokenBsc.address], {
    initializer: 'initializeVault'
  })) as ZapVault;

  const marketFactory = await ethers.getContractFactory("ZapMarket", deployer0);

  market = (await upgrades.deployProxy(marketFactory, [zapVault.address], {
    initializer: 'initializeMarket'
  })) as ZapMarket;

  await market.setFee(platformFee);

  const mediaFactory1 = await ethers.getContractFactory("ZapMedia", deployer1);

  media1 = await (
    await upgrades.deployProxy(mediaFactory1, [
      "Test Media 1",
      "TM1",
      market.address,
      true,
      "https://ipfs.moralis.io:2053/ipfs/QmeWPdpXmNP4UF9Urxyrp7NQZ9unaHfE2d43fbuur6hWWV"
    ])
  ).deployed() as ZapMedia;

  const mediaFactory2 = await ethers.getContractFactory("ZapMedia", deployer2);
  media2 = await (
    await upgrades.deployProxy(mediaFactory2,
      [
        "Test Media 1",
        "TM1",
        market.address,
        false,
        "https://ipfs.io/ipfs/QmTDCTPF6CpUK7DTqcUvRpGysfA1EbgRob5uGsStcCZie6"
      ])
  ).deployed() as ZapMedia;

  const mediaFactory3 = await ethers.getContractFactory("ZapMedia", deployer3);
  media3 = await (
    await upgrades.deployProxy(mediaFactory3,
      [
        "Test Media 1",
        "TM1",
        market.address,
        false,
        "https://ipfs.moralis.io:2053/ipfs/QmXtZVM1JwnCXax1y5r6i4ARxADUMLm9JSq5Rnn3vq9qsN"
      ]
    )
  ).deployed() as ZapMedia;


  return { market, media1, media2, media3, zapTokenBsc, zapVault };
};

export const deployBidder = async (auction: string, nftContract: string) => {
  return (await (
    await (await ethers.getContractFactory("BadBidder")).deploy(
      auction,
      nftContract
    )
  ).deployed()) as BadBidder;
};

export const mint = async (media: ZapMedia) => {
  const metadataHex = ethers.utils.formatBytes32String("{}");
  const metadataHash = await sha256(metadataHex);
  const hash = ethers.utils.arrayify(metadataHash);

  const signers = await ethers.getSigners();

  let collaborators = {
    collaboratorTwo: signers[10].address,
    collaboratorThree: signers[11].address,
    collaboratorFour: signers[12].address
  }

  await media.mint(
    {
      tokenURI: "zap.co",
      metadataURI: "zap.co",
      contentHash: hash,
      metadataHash: hash,
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
      ]
      ,
      creator: {
        value: BigNumber.from('15000000000000000000')
      },
      owner: {
        value: BigNumber.from('35000000000000000000')
      },

    }
  );


};

export const approveAuction = async (
  media: ZapMedia,
  auctionHouse: AuctionHouse
) => {
  await media.approve(auctionHouse.address, 0);

};

export const revert = (messages: TemplateStringsArray) =>
  `VM Exception while processing transaction: revert ${messages[0]}`;

export async function signPermit(
  zapMedia1: ZapMedia,
  toAddress: any,
  signers: any,
  tokenId: any,
  version: string
) {
  const nonce = (await zapMedia1.getPermitNonce(signers[3].address, tokenId)).toNumber();
  const deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24; // 24 hours
  const name = await zapMedia1.name();

  const chainId = await signers[5].getChainId();
  const domain = {
    name,
    version,
    chainId,
    verifyingContract: zapMedia1.address,
  };
  const types = {
    Permit: [
      { name: 'spender', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };
  const value = {
    spender: toAddress,
    tokenId,
    nonce,
    deadline,
  };
  let sig = await signers[3]._signTypedData(
    domain,
    types,
    value
  );
  sig = fromRpcSig(sig);
  sig = {
    r: sig.r,
    s: sig.s,
    v: sig.v,
    deadline: deadline.toString(),
  }

  return sig;
}

export async function signMintWithSig(
  zapMedia1: ZapMedia,
  signers: any,
  contentHash: any,
  metadataHash: any,
  version: string
) {
  const nonce = (await zapMedia1.getSigNonces(signers[1].address)).toNumber();
  const deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24; // 24 hours
  const name = await zapMedia1.name();

  const chainId = await signers[1].getChainId();
  const creatorShare = BigInt(10000000000000000000);
  const domain = {
    name,
    version,
    chainId,
    verifyingContract: zapMedia1.address,
  };
  const types = {
    MintWithSig: [
      { name: 'contentHash', type: 'bytes32' },
      { name: 'metadataHash', type: 'bytes32' },
      { name: 'creatorShare', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };
  const value = {
    contentHash,
    metadataHash,
    creatorShare,
    nonce,
    deadline,
  };
  let sig = await signers[1]._signTypedData(
    domain,
    types,
    value
  );
  sig = fromRpcSig(sig);
  sig = {
    r: sig.r,
    s: sig.s,
    v: sig.v,
    deadline: deadline.toString(),
  }
  return sig;
}
