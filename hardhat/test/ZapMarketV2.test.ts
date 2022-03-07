import { ethers, deployments } from 'hardhat';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

import {
  Media1155Factory,
  Media1155,
  ZapMarket,
  ZapMarketV2,
  ZapVault,
  ZapMedia,
  ZapMedia__factory,
  ZapToken,
  ZapTokenBSC
} from '../typechain';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DeployResult } from 'hardhat-deploy/dist/types';

import * as zapMediaAbi from '../artifacts/contracts/nft/ZapMedia.sol/ZapMedia.json';

chai.use(solidity);

describe.only('ZapMarketV2', () => {
  let signers: SignerWithAddress[];
  let zapMarket: ZapMarket;
  let zapMarketV2: ZapMarketV2;
  let zapVault: ZapVault;
  let media1155Factory: Media1155Factory;
  let zapMedia: ZapMedia;
  let media1155: Media1155;
  let zapMediaAddress: string;
  let bidShares: any;
  let data: any;
  let zapToken: ZapTokenBSC;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    await deployments.fixture();

    let tokenURI = 'www.example.com';
    let metadataURI = 'www.example2.com';

    let metadataHex = ethers.utils.formatBytes32String('{}');
    let metadataHashRaw = ethers.utils.keccak256(metadataHex);
    let metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

    let contentHex = ethers.utils.formatBytes32String('invert');
    let contentHashRaw = ethers.utils.keccak256(contentHex);
    let contentHashBytes = ethers.utils.arrayify(contentHashRaw);

    let contentHash = contentHashBytes;
    let metadataHash = metadataHashBytes;

    data = {
      tokenURI,
      metadataURI,
      contentHash,
      metadataHash
    };

    bidShares = {
      collaborators: [
        signers[17].address,
        signers[18].address,
        signers[19].address
      ],
      collabShares: [
        ethers.BigNumber.from('15000000000000000000'),
        ethers.BigNumber.from('15000000000000000000'),
        ethers.BigNumber.from('15000000000000000000')
      ],
      creator: {
        value: ethers.BigNumber.from('15000000000000000000')
      },
      owner: {
        value: ethers.BigNumber.from('35000000000000000000')
      }
    };

    const zapTokenFixture = await deployments.get('ZapTokenBSC');

    // Creates an instance of ZapVault
    zapToken = (await ethers.getContractAt(
      'ZapTokenBSC',
      zapTokenFixture.address,
      signers[0]
    )) as ZapTokenBSC;

    const zapVaultFixture = await deployments.get('ZapVault');

    // Creates an instance of ZapVault
    zapVault = (await ethers.getContractAt(
      'ZapMarket',
      zapVaultFixture.address,
      signers[0]
    )) as ZapVault;

    const zapMarketFixture = await deployments.get('ZapMarket');

    // Creates an instance of ZapMarket
    zapMarket = (await ethers.getContractAt(
      'ZapMarket',
      zapMarketFixture.address,
      signers[0]
    )) as ZapMarket;

    const zapMediaAddress = await zapMarket.mediaContracts(
      signers[0].address,
      ethers.BigNumber.from('0')
    );

    zapMedia = (await ethers.getContractAt(
      zapMediaAbi.abi,
      zapMediaAddress,
      signers[0]
    )) as ZapMedia;

    let ask = {
      amount: 100,
      currency: zapToken.address
    };

    await zapMedia.mint(data, bidShares);

    // await zapMedia.setAsk(0, ask);

    // Upgrade ZapMarket to ZapMarketV2
    const marketUpgradeTx = await deployments.deploy('ZapMarket', {
      from: signers[0].address,
      contract: 'ZapMarketV2',
      proxy: {
        proxyContract: 'OpenZeppelinTransparentProxy'
      },
      log: true
    });

    // await zapMedia.setAsk(0, ask);

    // Fetch the address of ZapMarketV2 from the transaction receipt
    const zapMarketV2Address: string | any =
      marketUpgradeTx.receipt?.contractAddress;

    // Create the ZapMarketV2 contract instance
    zapMarketV2 = (await ethers.getContractAt(
      'ZapMarketV2',
      zapMarketV2Address,
      signers[0]
    )) as ZapMarketV2;

    // Deploy the Media1155 implementation through hardhat-deploy
    const deployMedia1155ImpTx: DeployResult = await deployments.deploy(
      'Media1155',
      {
        from: signers[0].address,
        args: []
      }
    );

    // Fetch the address of Media1155 implementation from the transaction receipt
    const media1155ImpAddress: string | any =
      deployMedia1155ImpTx.receipt?.contractAddress;

    // Deploy the Media1155Factory through hardhat-deploy
    const deployMedia1155Factory: DeployResult = await deployments.deploy(
      'Media1155Factory',
      {
        from: signers[0].address,
        proxy: {
          proxyContract: 'OpenZeppelinTransparentProxy',
          execute: {
            methodName: 'initialize',
            args: [zapMarketV2.address, media1155ImpAddress]
          }
        }
      }
    );

    // Fetch the Media1155Factory address from the transaction receipt
    const media1155FactoryAddress: string | any =
      deployMedia1155Factory.receipt?.contractAddress;

    // Creates the Media1155 contract instance
    media1155Factory = (await ethers.getContractAt(
      'Media1155Factory',
      media1155FactoryAddress,
      signers[0]
    )) as Media1155Factory;

    // ZapMarketV2 sets the Media1155Factory
    await zapMarketV2.setMediaFactory(media1155Factory.address);
  });

  describe('#intitialize', () => {
    it.only('Should not initialize twice', async () => {
      await expect(
        zapMarketV2.initializeMarket(zapVault.address)
      ).to.be.revertedWith('Initializable: contract is already initialized');
    });

    it('Should revert if a non owner tries to set the plaform fee', async () => {
      let platformFee = {
        fee: {
          value: ethers.BigNumber.from('5000000000000000000')
        }
      };
      await expect(
        zapMarketV2.connect(signers[2]).setFee(platformFee)
      ).to.be.revertedWith('Ownable: Only owner has access to this function');
    });

    it('Should get an owners media contract', async () => {
      const registerStatus = await zapMarketV2.isRegistered(zapMedia.address);

      const configureStatus = await zapMarketV2.isConfigured(zapMedia.address);

      expect(registerStatus).to.be.true;

      expect(configureStatus).to.be.true;

      it('Should get the market owner', async () => {
        const owner = await zapMarketV2.getOwner();

        expect(owner).to.equal(signers[0].address);
      });

      it('Should get the the platform fee', async () => {
        const fee = await zapMarketV2.viewFee();
        expect(parseInt(fee.value._hex)).to.equal(5e18);
      });
    });

    it('Should revert if configure is not called by the media factory', async () => {
      await expect(
        zapMarketV2.configure(
          signers[0].address,
          (
            await deployments.get('ZapMedia')
          ).address,
          ethers.utils.formatBytes32String('Test Media'),
          ethers.utils.formatBytes32String('TM')
        )
      ).to.be.revertedWith('Market: Only the media factory can do this action');
    });
  });

  describe('#bidShareForToken', () => {
    beforeEach(async () => {
      // await zapMedia.mint(data, bidShares);
    });

    it('Should emit the BidShareUpdated event', async () => {
      const filter = zapMarketV2.filters.BidShareUpdated(null, null, null);
      const queryFilter = await zapMarketV2.queryFilter(filter);
      const eventLog = queryFilter[0];

      expect(eventLog.args.tokenId).to.equal(0);

      expect(eventLog.args.bidShares.collaborators).to.eql(
        bidShares.collaborators
      );
      expect(eventLog.args.bidShares.collabShares).to.eql(
        bidShares.collabShares
      );
      expect(eventLog.args.bidShares.creator.value).to.equal(
        bidShares.creator.value
      );
      expect(eventLog.args.bidShares.owner.value).to.equal(
        bidShares.owner.value
      );
      expect(eventLog.args.mediaContract).to.equal(zapMedia.address);
    });

    it('Should return null values if the token id does not exsist', async () => {
      const fetchBidShares = await zapMarketV2.bidSharesForToken(
        zapMedia.address,
        1
      );

      expect(fetchBidShares.collaborators).to.have.lengthOf(0);
      expect(fetchBidShares.collabShares).to.have.lengthOf(0);
      expect(fetchBidShares.owner.value.toNumber()).to.equal(0);
      expect(fetchBidShares.creator.value.toNumber()).to.equal(0);
    });

    it('Should return the bid shares for a token', async () => {
      const fetchBidShares = await zapMarketV2.bidSharesForToken(
        zapMedia.address,
        0
      );

      expect(fetchBidShares.collaborators).to.eql(bidShares.collaborators);
      expect(fetchBidShares.collabShares).to.eql(bidShares.collabShares);
      expect(fetchBidShares.creator.value).to.equal(bidShares.creator.value);
      expect(fetchBidShares.owner.value).to.equal(bidShares.owner.value);
    });
  });
});
