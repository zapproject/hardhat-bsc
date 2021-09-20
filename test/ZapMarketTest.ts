import { ethers, upgrades } from 'hardhat';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

import { ZapTokenBSC } from '../typechain/ZapTokenBSC';

import {
  sha256,
  formatBytes32String,
  parseBytes32String
} from 'ethers/lib/utils';

import { BigNumber, Bytes, EventFilter, Event } from 'ethers';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { ZapMedia } from '../typechain/ZapMedia';

import { ZapMarket } from '../typechain/ZapMarket';

import { ZapMarketV2 } from '../typechain/ZapMarketV2';

import { ZapVault } from '../typechain/ZapVault';

chai.use(solidity);

type MediaData = {
  tokenURI: string;
  metadataURI: string;
  contentHash: Bytes;
  metadataHash: Bytes;
};

let tokenURI = 'www.example.com';
let metadataURI = 'www.example2.com';
let contentHashBytes: Bytes;
let metadataHashBytes: Bytes;
let vault: ZapVault;
let mint_tx1: any;
let mint_tx2: any;

let platformFee = {

  fee: {
    value: BigNumber.from('5000000000000000000')
  },

};

describe('ZapMarket Test', () => {
  let zapTokenBsc: any;

  beforeEach(async () => {
    signers = await ethers.getSigners();

    const zapTokenFactory = await ethers.getContractFactory(
      'ZapTokenBSC',
      signers[0]
    );

    zapTokenBsc = (await zapTokenFactory.deploy()) as ZapTokenBSC;
    await zapTokenBsc.deployed();
  });

  let zapMarket: ZapMarket;
  let zapMarketV2: ZapMarketV2;
  let zapMedia1: ZapMedia;
  let zapMedia2: ZapMedia;
  let zapMedia3: ZapMedia;
  let zapVault: ZapVault;
  let signers: SignerWithAddress[];

  let bidShares1 = {
    owner: {
      value: BigNumber.from('45000000000000000000')
    },
    creator: {
      value: BigNumber.from('50000000000000000000')
    }
  };

  let bidShares2 = {
    owner: {
      value: BigNumber.from('45000000000000000000')
    },
    creator: {
      value: BigNumber.from('50000000000000000000')
    }
  };

  let invalidBidShares = {
    platformFee: {
      value: BigInt(90000000000000000000)
    },
    owner: {
      value: BigInt(79000000000000000000)
    },
    creator: {
      value: BigInt(90000000000000000000)
    }
  };

  let ask1 = {
    amount: 100,
    currency: '',
    sellOnShare: 0
  };

  let ask2 = {
    amount: 200,
    currency: '',
    sellOnShare: 0
  };

  describe('#Configure', () => {

    beforeEach(async () => {

      const zapTokenFactory = await ethers.getContractFactory(
        'ZapTokenBSC',
        signers[0]
      );

      zapTokenBsc = await zapTokenFactory.deploy();
      await zapTokenBsc.deployed();

      const zapVaultFactory = await ethers.getContractFactory('ZapVault');

      zapVault = (await upgrades.deployProxy(zapVaultFactory, [zapTokenBsc.address], {
        initializer: 'initializeVault'
      })) as ZapVault;

      const zapMarketFactory = await ethers.getContractFactory('ZapMarket');

      zapMarket = (await upgrades.deployProxy(zapMarketFactory, [zapVault.address, platformFee], {
        initializer: 'initializeMarket'
      })) as ZapMarket;

      const mediaFactory = await ethers.getContractFactory(
        'ZapMedia',
        signers[1]
      );

      zapMedia1 = (await upgrades.deployProxy(mediaFactory, [
        'TEST MEDIA 1',
        'TM1',
        zapMarket.address,
        false,
        'https://ipfs.moralis.io:2053/ipfs/QmeWPdpXmNP4UF9Urxyrp7NQZ9unaHfE2d43fbuur6hWWV'
      ])) as ZapMedia;
      await zapMedia1.deployed();

      const mediaFactory2 = await ethers.getContractFactory(
        'ZapMedia',
        signers[2]
      );

      zapMedia2 = (await upgrades.deployProxy(mediaFactory2, [
        'TEST MEDIA 2',
        'TM2',
        zapMarket.address,
        false,
        'https://ipfs.io/ipfs/QmTDCTPF6CpUK7DTqcUvRpGysfA1EbgRob5uGsStcCZie6'
      ])) as ZapMedia;

      await zapMedia2.deployed();

      const mediaFactory3 = await ethers.getContractFactory(
        'ZapMedia',
        signers[2]
      );

      zapMedia3 = (await upgrades.deployProxy(mediaFactory3, [
        'Test MEDIA 3',
        'TM3',
        zapMarket.address,
        false,
        'https://ipfs.moralis.io:2053/ipfs/QmXtZVM1JwnCXax1y5r6i4ARxADUMLm9JSq5Rnn3vq9qsN'
      ])) as ZapMedia;

      await zapMedia3.deployed();


      ask1.currency = zapTokenBsc.address;

      let metadataHex = ethers.utils.formatBytes32String('{}');
      let metadataHash = await sha256(metadataHex);
      metadataHashBytes = ethers.utils.arrayify(metadataHash);

      let contentHex = ethers.utils.formatBytes32String('invert');
      let contentHash = await sha256(contentHex);
      contentHashBytes = ethers.utils.arrayify(contentHash);

      const zapMarketV2Factory = await ethers.getContractFactory(
        'ZapMarketV2',
        signers[0]
      );

      zapMarketV2 = (await upgrades.upgradeProxy(
        zapMarket.address,
        zapMarketV2Factory
      )) as ZapMarketV2;

    });

    it('Should get collection metadata', async () => {
      const metadata1 = await zapMedia1.collectionMetadata();
      const metadata2 = await zapMedia2.collectionMetadata();
      const metadata3 = await zapMedia3.collectionMetadata();

      expect(ethers.utils.toUtf8String(metadata1)).to.equal(
        'https://ipfs.moralis.io:2053/ipfs/QmeWPdpXmNP4UF9Urxyrp7NQZ9unaHfE2d43fbuur6hWWV'
      );

      expect(ethers.utils.toUtf8String(metadata2)).to.equal(
        'https://ipfs.io/ipfs/QmTDCTPF6CpUK7DTqcUvRpGysfA1EbgRob5uGsStcCZie6'
      );

      expect(ethers.utils.toUtf8String(metadata3)).to.equal(
        'https://ipfs.moralis.io:2053/ipfs/QmXtZVM1JwnCXax1y5r6i4ARxADUMLm9JSq5Rnn3vq9qsN'
      );
    });

    it('Should upgrade ZapMarket with the new getConfigStatus function and preserve the state', async () => {

      expect(await zapMarketV2.getConfigStatus(zapMedia1.address)).to.be.true;

      expect(await zapMarketV2.getConfigStatus(zapMedia2.address)).to.be.true;

    });

    it('Should get media owner', async () => {

      const zapMedia1Address = await zapMarket.mediaContracts(
        signers[1].address,
        BigNumber.from('0')
      );

      const zapMedia2Address = await zapMarket.mediaContracts(
        signers[2].address,
        BigNumber.from('0')
      );

      const upgradedMedia1Address = await zapMarketV2.mediaContracts(
        signers[1].address,
        BigNumber.from('0')
      );

      const upgradedMedia2Address = await zapMarketV2.mediaContracts(
        signers[2].address,
        BigNumber.from('0')
      );

      expect(zapMedia1Address).to.contain(zapMedia1.address);

      expect(upgradedMedia1Address).to.contain(zapMedia1.address);

      expect(zapMedia2Address).to.contain(zapMedia2.address);

      expect(upgradedMedia2Address).to.contain(zapMedia2.address);

    });

    it('Should revert if initialize is called twice', async () => {
      await expect(zapMarketV2.initialize()).to.be.revertedWith(
        'Initializable: contract is already initialized'
      );

      await expect(zapMarket.initialize()).to.be.revertedWith(
        'Initializable: contract is already initialized'
      );
    });

    it('Should reject if called twice', async () => {
      await expect(
        zapMarket
          .connect(signers[1])
          .configure(
            signers[1].address,
            zapMedia1.address,
            formatBytes32String('TEST MEDIA 1'),
            formatBytes32String('TM1')
          )
      ).to.be.revertedWith('Market: Already configured');

      await expect(
        zapMarket
          .connect(signers[2])
          .configure(
            signers[2].address,
            zapMedia2.address,
            formatBytes32String('TEST MEDIA 2'),
            formatBytes32String('TM2')
          )
      ).to.be.revertedWith('Market: Already configured');

      await expect(
        zapMarket
          .connect(signers[3])
          .configure(
            signers[3].address,
            zapMedia3.address,
            formatBytes32String('TEST MEDIA 3'),
            formatBytes32String('TM3')
          )
      ).to.be.revertedWith('Market: Already configured');

      await expect(
        zapMarketV2
          .connect(signers[1])
          .configure(
            signers[1].address,
            zapMedia1.address,
            formatBytes32String('TEST MEDIA 1'),
            formatBytes32String('TM1')
          )
      ).to.be.revertedWith('Market: Already configured');

      expect(await zapMarket.isConfigured(zapMedia1.address)).to.be.true;

      expect(await zapMarketV2.isConfigured(zapMedia1.address)).to.be.true;

      expect(await zapMarket.isConfigured(zapMedia2.address)).to.be.true;

      expect(await zapMarketV2.isConfigured(zapMedia2.address)).to.be.true;

    });

    it('Should emit a MediaContractCreated event on media contract deployment', async () => {

      const zapMarketFilter: EventFilter =
        zapMarket.filters.MediaContractCreated(zapMedia1.address, null, null);

      const event: Event = (await zapMarket.queryFilter(zapMarketFilter))[0];

      const upgradedMarketFilter: EventFilter =
        zapMarketV2.filters.MediaContractCreated(zapMedia2.address, null, null);

      const upgradedEvent: Event = (
        await zapMarketV2.queryFilter(upgradedMarketFilter)
      )[0];

      expect(event).to.not.be.undefined;

      expect(upgradedEvent).to.not.be.undefined;

      expect(event.event).to.eq('MediaContractCreated');

      expect(upgradedEvent.event).to.eq('MediaContractCreated');

      expect(event.args?.mediaContract).to.eq(zapMedia1.address);

      expect(upgradedEvent.args?.mediaContract).to.eq(zapMedia2.address);

      expect(parseBytes32String(event.args?.name)).to.eq('TEST MEDIA 1');

      expect(parseBytes32String(upgradedEvent.args?.name)).to.eq(
        'TEST MEDIA 2'
      );

      expect(parseBytes32String(event.args?.symbol)).to.eq('TM1');

      expect(parseBytes32String(upgradedEvent.args?.symbol)).to.eq('TM2');

    });

  });

  describe('#setBidShares', () => {
    let data: MediaData;

    beforeEach(async () => {
      signers = await ethers.getSigners();

      const zapTokenFactory = await ethers.getContractFactory(
        'ZapTokenBSC',
        signers[0]
      );

      zapTokenBsc = await zapTokenFactory.deploy();
      await zapTokenBsc.deployed();

      const zapVaultFactory = await ethers.getContractFactory('ZapVault');

      zapVault = (await upgrades.deployProxy(zapVaultFactory, [zapTokenBsc.address], {
        initializer: 'initializeVault'
      })) as ZapVault;

      const zapMarketFactory = await ethers.getContractFactory('ZapMarket');

      zapMarket = (await upgrades.deployProxy(zapMarketFactory, [zapVault.address, platformFee], {
        initializer: 'initializeMarket'
      })) as ZapMarket;

      const mediaFactory = await ethers.getContractFactory(
        'ZapMedia',
        signers[1]
      );

      zapMedia1 = (await upgrades.deployProxy(mediaFactory, [
        'TEST MEDIA 1',
        'TM1',
        zapMarket.address,
        false,
        'https://ipfs.moralis.io:2053/ipfs/QmeWPdpXmNP4UF9Urxyrp7NQZ9unaHfE2d43fbuur6hWWV'
      ])) as ZapMedia;

      await zapMedia1.deployed();

      const mediaFactory2 = await ethers.getContractFactory(
        'ZapMedia',
        signers[2]
      );

      zapMedia2 = (await upgrades.deployProxy(mediaFactory2, [
        'TEST MEDIA 2',
        'TM2',
        zapMarket.address,
        false,
        'https://ipfs.io/ipfs/QmTDCTPF6CpUK7DTqcUvRpGysfA1EbgRob5uGsStcCZie6'
      ])) as ZapMedia;

      await zapMedia2.deployed();

      const mediaFactory3 = await ethers.getContractFactory(
        'ZapMedia',
        signers[3]
      );

      zapMedia3 = (await upgrades.deployProxy(mediaFactory3, [
        'Test MEDIA 3',
        'TM3',
        zapMarket.address,
        false,
        'https://ipfs.moralis.io:2053/ipfs/QmXtZVM1JwnCXax1y5r6i4ARxADUMLm9JSq5Rnn3vq9qsN'
      ])) as ZapMedia;

      await zapMedia3.deployed();

      ask1.currency = zapTokenBsc.address;

      let metadataHex = ethers.utils.formatBytes32String('{}');
      let metadataHashRaw = await sha256(metadataHex);
      metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

      let contentHex = ethers.utils.formatBytes32String('invert');
      let contentHashRaw = await sha256(contentHex);
      contentHashBytes = ethers.utils.arrayify(contentHashRaw);

      let contentHash = contentHashBytes;
      let metadataHash = metadataHashBytes;

      data = {
        tokenURI,
        metadataURI,
        contentHash,
        metadataHash
      };

      mint_tx1 = await zapMedia1.connect(signers[1]).mint(data, bidShares1);
      mint_tx2 = await zapMedia2.connect(signers[2]).mint(data, bidShares2);

      const zapMarketV2Factory = await ethers.getContractFactory(
        'ZapMarketV2',
        signers[0]
      );

      zapMarketV2 = (await upgrades.upgradeProxy(
        zapMarket.address,
        zapMarketV2Factory
      )) as ZapMarketV2;

    });

    it('Should emit a Minted event when a token is minted', async () => {

      const zapMarketFilter: EventFilter = zapMarket.filters.Minted(
        0,
        zapMedia1.address
      );

      const upgradedMarketFilter: EventFilter = zapMarketV2.filters.Minted(
        0,
        zapMedia2.address
      );

      const event: Event = (await zapMarket.queryFilter(zapMarketFilter))[0];

      const upgradedEvent: Event = (
        await zapMarketV2.queryFilter(upgradedMarketFilter)
      )[0];

      expect(event).to.not.be.undefined;

      expect(upgradedEvent).to.not.be.undefined;

      expect(event.event).to.eq('Minted');
      expect(event.args?.token).to.eq(0);
      expect(event.args?.mediaContract).to.eq(zapMedia1.address);

    });

    it('Should emit a Burned event when a token is burned', async () => {

      expect(await zapMedia1.connect(signers[1]).burn(0)).to.be.ok;
      expect(await zapMedia2.connect(signers[2]).burn(0)).to.be.ok;

      const zapMarketFilter: EventFilter = zapMarket.filters.Burned(
        0,
        zapMedia1.address
      );

      const event: Event = (await zapMarket.queryFilter(zapMarketFilter))[0];

      const upgradedMarketFilter: EventFilter = zapMarketV2.filters.Burned(
        0,
        zapMedia2.address
      );

      const upgradedEvent: Event = (
        await zapMarketV2.queryFilter(upgradedMarketFilter)
      )[0];

      expect(event).to.not.be.undefined;

      expect(upgradedEvent).to.not.be.undefined;

      expect(event.event).to.eq('Burned');

      expect(upgradedEvent.event).to.eq('Burned');

      expect(event.args?.token).to.eq(0);

      expect(upgradedEvent.args?.token).to.eq(0);

      expect(event.args?.mediaContract).to.eq(zapMedia1.address);

      expect(upgradedEvent.args?.mediaContract).to.eq(zapMedia2.address);

    });

    it('Should reject if not called by the media address', async () => {

      await expect(
        zapMarket
          .connect(signers[3])
          .setBidShares(zapMedia1.address, 1, bidShares1)
      ).to.be.revertedWith('Market: Only media contract');

      await expect(
        zapMarketV2
          .connect(signers[3])
          .setBidShares(zapMedia1.address, 1, bidShares1)
      ).to.be.revertedWith('Market: Only media contract');

      await expect(
        zapMarket
          .connect(signers[4])
          .setBidShares(zapMedia2.address, 1, bidShares1)
      ).to.be.revertedWith('Market: Only media contract');

      await expect(
        zapMarketV2
          .connect(signers[4])
          .setBidShares(zapMedia2.address, 1, bidShares1)
      ).to.be.revertedWith('Market: Only media contract');

    });

    it('Should set the bid shares if called by the media address', async () => {

      const sharesForToken1 = await zapMarket.bidSharesForToken(
        zapMedia1.address,
        0
      );

      const upgradedShares1 = await zapMarketV2.bidSharesForToken(
        zapMedia1.address,
        0
      );

      const sharesForToken2 = await zapMarket.bidSharesForToken(
        zapMedia2.address,
        0
      );

      const upgradedShares2 = await zapMarket.bidSharesForToken(
        zapMedia2.address,
        0
      );

      expect(sharesForToken1.creator.value).to.be.equal(
        bidShares1.creator.value
      );

      expect(upgradedShares1.creator.value).to.be.equal(
        bidShares1.creator.value
      );

      expect(sharesForToken1.owner.value).to.be.equal(bidShares1.owner.value);

      expect(upgradedShares1.owner.value).to.be.equal(bidShares1.owner.value);

      expect(sharesForToken2.creator.value).to.be.equal(
        bidShares2.creator.value
      );

      expect(upgradedShares2.creator.value).to.be.equal(
        bidShares2.creator.value
      );

      expect(sharesForToken2.owner.value).to.be.equal(bidShares2.owner.value);

      expect(upgradedShares2.owner.value).to.be.equal(bidShares2.owner.value);

    });

    it('Should emit an event when bid shares are updated', async () => {

      const receipt1 = await mint_tx1.wait();

      const eventLog1 = receipt1.events[0];

      const receipt2 = await mint_tx2.wait();

      const eventLog2 = receipt2.events[0];

      expect(eventLog1.event).to.be.equal('Transfer');

      expect(eventLog1.args.tokenId.toNumber()).to.be.equal(0);

      expect(eventLog2.event).to.be.equal('Transfer');

      expect(eventLog2.args.tokenId.toNumber()).to.be.equal(0);

    });

    it('Should reject if the bid shares are invalid', async () => {

      let metadataHex = ethers.utils.formatBytes32String('{tool: box}');
      let metadataHashRaw = await sha256(metadataHex);
      metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

      let contentHex = ethers.utils.formatBytes32String('re-invert');
      let contentHashRaw = await sha256(contentHex);
      contentHashBytes = ethers.utils.arrayify(contentHashRaw);

      let contentHash = contentHashBytes;
      let metadataHash = metadataHashBytes;

      const data: MediaData = {
        tokenURI,
        metadataURI,
        contentHash,
        metadataHash
      };

      await expect(
        zapMedia1.connect(signers[1]).mint(data, invalidBidShares)
      ).to.be.revertedWith('Market: Invalid bid shares, must sum to 100');
    });

  });

  describe('#setAsk', () => {

    beforeEach(async () => {

      const zapTokenFactory = await ethers.getContractFactory(
        'ZapTokenBSC',
        signers[0]
      );

      zapTokenBsc = await zapTokenFactory.deploy();
      await zapTokenBsc.deployed();

      const zapVaultFactory = await ethers.getContractFactory('ZapVault');

      zapVault = (await upgrades.deployProxy(zapVaultFactory, [zapTokenBsc.address], {
        initializer: 'initializeVault'
      })) as ZapVault;

      const zapMarketFactory = await ethers.getContractFactory('ZapMarket');

      zapMarket = (await upgrades.deployProxy(zapMarketFactory, [zapVault.address, platformFee], {
        initializer: 'initializeMarket'
      })) as ZapMarket;

      const mediaFactory = await ethers.getContractFactory(
        'ZapMedia',
        signers[1]
      );

      zapMedia1 = (await upgrades.deployProxy(mediaFactory, [
        'TEST MEDIA 1',
        'TM1',
        zapMarket.address,
        false,
        'https://ipfs.moralis.io:2053/ipfs/QmeWPdpXmNP4UF9Urxyrp7NQZ9unaHfE2d43fbuur6hWWV'
      ])) as ZapMedia;
      await zapMedia1.deployed();

      const mediaFactory2 = await ethers.getContractFactory(
        'ZapMedia',
        signers[2]
      );

      zapMedia2 = (await upgrades.deployProxy(mediaFactory2, [
        'TEST MEDIA 2',
        'TM2',
        zapMarket.address,
        false,
        'https://ipfs.io/ipfs/QmTDCTPF6CpUK7DTqcUvRpGysfA1EbgRob5uGsStcCZie6'
      ])) as ZapMedia;

      await zapMedia2.deployed();

      const mediaFactory3 = await ethers.getContractFactory(
        'ZapMedia',
        signers[2]
      );

      zapMedia3 = (await upgrades.deployProxy(mediaFactory3, [
        'Test MEDIA 3',
        'TM3',
        zapMarket.address,
        false,
        'https://ipfs.moralis.io:2053/ipfs/QmXtZVM1JwnCXax1y5r6i4ARxADUMLm9JSq5Rnn3vq9qsN'
      ])) as ZapMedia;

      await zapMedia3.deployed();

      ask1.currency = zapTokenBsc.address;
      ask2.currency = zapTokenBsc.address;

      let metadataHex = ethers.utils.formatBytes32String('{}');
      let metadataHashRaw = await sha256(metadataHex);
      metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

      let contentHex = ethers.utils.formatBytes32String('invert');
      let contentHashRaw = await sha256(contentHex);
      contentHashBytes = ethers.utils.arrayify(contentHashRaw);

      let contentHash = contentHashBytes;
      let metadataHash = metadataHashBytes;

      const data: MediaData = {
        tokenURI,
        metadataURI,
        contentHash,
        metadataHash
      };

      mint_tx1 = await zapMedia1.connect(signers[1]).mint(data, bidShares1);
      mint_tx2 = await zapMedia2.connect(signers[2]).mint(data, bidShares1);

      const zapMarketV2Factory = await ethers.getContractFactory(
        'ZapMarketV2',
        signers[0]
      );

      zapMarketV2 = (await upgrades.upgradeProxy(
        zapMarket.address,
        zapMarketV2Factory
      )) as ZapMarketV2;

    });

    it('Should reject if not called by the media address', async () => {
      await expect(
        zapMarket.connect(signers[5]).setAsk(zapMedia1.address, 1, ask1)
      ).to.be.revertedWith('Market: Only media contract');

      await expect(
        zapMarketV2.connect(signers[5]).setAsk(zapMedia1.address, 1, ask1)
      ).to.be.revertedWith('Market: Only media contract');

      await expect(
        zapMarket.connect(signers[5]).setAsk(zapMedia2.address, 1, ask1)
      ).to.be.revertedWith('Market: Only media contract');

      await expect(
        zapMarketV2.connect(signers[5]).setAsk(zapMedia2.address, 1, ask1)
      ).to.be.revertedWith('Market: Only media contract');

    });

    it('Should set the ask if called by the media address', async () => {
      await zapMedia1.connect(signers[1]).setAsk(0, ask1);

      await zapMedia2.connect(signers[2]).setAsk(0, ask2);

      const getAsk1 = await zapMarket.currentAskForToken(zapMedia1.address, 0);

      const upgradedAsk1 = await zapMarketV2.currentAskForToken(
        zapMedia1.address,
        0
      );

      const getAsk2 = await zapMarket.currentAskForToken(zapMedia2.address, 0);

      const upgradedAsk2 = await zapMarketV2.currentAskForToken(
        zapMedia2.address,
        0
      );

      expect(getAsk1.amount.toNumber()).to.equal(ask1.amount);

      expect(upgradedAsk1.amount.toNumber()).to.equal(ask1.amount);

      expect(getAsk2.amount.toNumber()).to.equal(ask2.amount);

      expect(upgradedAsk2.amount.toNumber()).to.equal(ask2.amount);

      expect(getAsk1.currency).to.equal(zapTokenBsc.address);

      expect(upgradedAsk1.currency).to.equal(zapTokenBsc.address);

    });

    it('Should emit an event if the ask is updated', async () => {

      const askTx1 = await zapMedia1.connect(signers[1]).setAsk(0, ask1);

      const askTx2 = await zapMedia2.connect(signers[2]).setAsk(0, ask2);

      const filter_media1: EventFilter = zapMarket.filters.AskCreated(
        zapMedia1.address,
        null,
        null
      );

      const upgraded_media1: EventFilter = zapMarketV2.filters.AskCreated(
        zapMedia1.address,
        null,
        null
      );

      const filter_media2: EventFilter = zapMarket.filters.AskCreated(
        zapMedia2.address,
        null,
        null
      );

      const upgraded_media2: EventFilter = zapMarketV2.filters.AskCreated(
        zapMedia2.address,
        null,
        null
      );

      const event_media1: Event = (
        await zapMarket.queryFilter(filter_media1)
      )[0];

      const upgraded_event1: Event = (
        await zapMarketV2.queryFilter(upgraded_media1)
      )[0];

      const event_media2: Event = (
        await zapMarket.queryFilter(filter_media2)
      )[0];

      const upgraded_event2: Event = (
        await zapMarketV2.queryFilter(upgraded_media2)
      )[0];

      expect(event_media1.event).to.be.equal('AskCreated');

      expect(upgraded_event1.event).to.be.equal('AskCreated');

      expect(event_media1.args?.tokenId.toNumber()).to.be.equal(0);

      expect(upgraded_event1.args?.tokenId.toNumber()).to.be.equal(0);

      expect(event_media1.args?.ask.amount.toNumber()).to.be.equal(ask1.amount);

      expect(upgraded_event1.args?.ask.amount.toNumber()).to.be.equal(
        ask1.amount
      );

      expect(event_media1.args?.ask.currency).to.be.equal(zapTokenBsc.address);

      expect(upgraded_event1.args?.ask.currency).to.be.equal(
        zapTokenBsc.address
      );

      expect(event_media2.event).to.be.equal('AskCreated');

      expect(upgraded_event2.event).to.be.equal('AskCreated');

      expect(event_media2.args?.tokenId.toNumber()).to.be.equal(0);

      expect(upgraded_event2.args?.tokenId.toNumber()).to.be.equal(0);

      expect(event_media2.args?.ask.amount.toNumber()).to.be.equal(ask2.amount);

      expect(upgraded_event2.args?.ask.amount.toNumber()).to.be.equal(
        ask2.amount
      );

      expect(event_media2.args?.ask.currency).to.be.equal(zapTokenBsc.address);

      expect(upgraded_event2.args?.ask.currency).to.be.equal(
        zapTokenBsc.address
      );

    });

    it('Should reject if the ask is too low', async () => {
      await expect(
        zapMedia1.connect(signers[1]).setAsk(0, {
          amount: 1,
          currency: zapTokenBsc.address
        })
      ).to.be.revertedWith('Market: Ask invalid for share splitting');

      await expect(
        zapMedia2.connect(signers[2]).setAsk(0, {
          amount: 13,
          currency: zapTokenBsc.address
        })
      ).to.be.revertedWith('Market: Ask invalid for share splitting');
    });

    // it.skip("Should reject if the bid shares haven't been set yet", async () => {
    //   // Bid shares are't set only when they have not been minted

    //   await expect(
    //     zapMarket.connect(signers[1]).setAsk(zapMedia1.address, 0, ask1)
    //   ).to.be.revertedWith('Market: Invalid bid shares for token');

    //   await expect(
    //     zapMarket.connect(signers[2]).setAsk(zapMedia2.address, 0, ask2)
    //   ).to.be.revertedWith('Market: Invalid bid shares for token');
    // });
  });

  describe('#setBid', () => {
    let bid1: any;
    let bid2: any;

    beforeEach(async () => {

      const zapTokenFactory = await ethers.getContractFactory(
        'ZapTokenBSC',
        signers[0]
      );

      zapTokenBsc = await zapTokenFactory.deploy();
      await zapTokenBsc.deployed();

      const zapVaultFactory = await ethers.getContractFactory('ZapVault');

      zapVault = (await upgrades.deployProxy(zapVaultFactory, [zapTokenBsc.address], {
        initializer: 'initializeVault'
      })) as ZapVault;

      const zapMarketFactory = await ethers.getContractFactory('ZapMarket');

      zapMarket = (await upgrades.deployProxy(zapMarketFactory, [zapVault.address, platformFee], {
        initializer: 'initializeMarket'
      })) as ZapMarket;

      const mediaFactory = await ethers.getContractFactory(
        'ZapMedia',
        signers[1]
      );
      zapMedia1 = (await upgrades.deployProxy(mediaFactory, [
        'TEST MEDIA 1',
        'TM1',
        zapMarket.address,
        false,
        'https://ipfs.moralis.io:2053/ipfs/QmeWPdpXmNP4UF9Urxyrp7NQZ9unaHfE2d43fbuur6hWWV'
      ])) as ZapMedia;
      await zapMedia1.deployed();

      const mediaFactory2 = await ethers.getContractFactory(
        'ZapMedia',
        signers[2]
      );

      zapMedia2 = (await upgrades.deployProxy(mediaFactory2, [
        'TEST MEDIA 2',
        'TM2',
        zapMarket.address,
        false,
        'https://ipfs.io/ipfs/QmTDCTPF6CpUK7DTqcUvRpGysfA1EbgRob5uGsStcCZie6'
      ])) as ZapMedia;

      await zapMedia2.deployed();

      const mediaFactory3 = await ethers.getContractFactory(
        'ZapMedia',
        signers[2]
      );

      zapMedia3 = (await upgrades.deployProxy(mediaFactory3, [
        'Test MEDIA 3',
        'TM3',
        zapMarket.address,
        false,
        'https://ipfs.moralis.io:2053/ipfs/QmXtZVM1JwnCXax1y5r6i4ARxADUMLm9JSq5Rnn3vq9qsN'
      ])) as ZapMedia;

      await zapMedia3.deployed();

      bid1 = {
        amount: 100,
        currency: zapTokenBsc.address,
        bidder: signers[1].address,
        recipient: signers[8].address,
        spender: signers[1].address,
        sellOnShare: {
          value: BigInt(10000000000000000000)
        }
      };

      bid2 = {
        amount: 100,
        currency: zapTokenBsc.address,
        bidder: signers[2].address,
        recipient: signers[9].address,
        spender: signers[2].address,
        sellOnShare: {
          value: BigInt(10000000000000000000)
        }
      };

      let metadataHex = ethers.utils.formatBytes32String('{}');
      let metadataHashRaw = sha256(metadataHex);
      metadataHashBytes = ethers.utils.arrayify(metadataHashRaw);

      let contentHex = ethers.utils.formatBytes32String('invert');
      let contentHashRaw = sha256(contentHex);
      contentHashBytes = ethers.utils.arrayify(contentHashRaw);

      let contentHash = contentHashBytes;
      let metadataHash = metadataHashBytes;

      const data: MediaData = {
        tokenURI,
        metadataURI,
        contentHash,
        metadataHash
      };

      await zapMedia1.connect(signers[1]).mint(data, bidShares1);
      await zapMedia2.connect(signers[2]).mint(data, bidShares2);

      const zapMarketV2Factory = await ethers.getContractFactory(
        'ZapMarketV2',
        signers[0]
      );

      zapMarketV2 = (await upgrades.upgradeProxy(
        zapMarket.address,
        zapMarketV2Factory
      )) as ZapMarketV2;

    });

    it('Should revert if not called by the media contract', async () => {
      await expect(
        zapMarket
          .connect(signers[2])
          .setBid(zapMedia1.address, 0, bid1, bid1.spender)
      ).to.be.revertedWith('Market: Only media contract');

      await expect(
        zapMarketV2
          .connect(signers[2])
          .setBid(zapMedia1.address, 0, bid1, bid1.spender)
      ).to.be.revertedWith('Market: Only media contract');

      await expect(
        zapMarket
          .connect(signers[1])
          .setBid(zapMedia2.address, 0, bid2, bid2.spender)
      ).to.be.revertedWith('Market: Only media contract');

      await expect(
        zapMarketV2
          .connect(signers[1])
          .setBid(zapMedia2.address, 0, bid2, bid2.spender)
      ).to.be.revertedWith('Market: Only media contract');

    });

    it('Should revert if the bidder does not have a high enough allowance for their bidding currency', async () => {
      await zapTokenBsc.mint(signers[1].address, bid1.amount);
      await zapTokenBsc.mint(signers[2].address, bid2.amount);

      await zapTokenBsc
        .connect(signers[1])
        .approve(zapMarket.address, bid1.amount - 1);
      await zapTokenBsc
        .connect(signers[2])
        .approve(zapMarket.address, bid2.amount - 1);

      await expect(
        zapMedia1.connect(signers[1]).setBid(0, bid1)
      ).to.be.revertedWith('SafeERC20: low-level call failed');

      await expect(
        zapMedia2.connect(signers[2]).setBid(0, bid2)
      ).to.be.revertedWith('SafeERC20: low-level call failed');
    });

    it('Should revert if the bidder does not have enough tokens to bid with', async () => {
      await zapTokenBsc.mint(signers[1].address, bid1.amount - 1);
      await zapTokenBsc.mint(signers[2].address, bid2.amount - 1);

      await zapTokenBsc
        .connect(signers[1])
        .approve(zapMarket.address, bid1.amount);
      await zapTokenBsc
        .connect(signers[2])
        .approve(zapMarket.address, bid2.amount);

      await expect(
        zapMedia1.connect(signers[1]).setBid(0, bid1)
      ).to.be.revertedWith('SafeERC20: low-level call failed');

      await expect(
        zapMedia2.connect(signers[2]).setBid(0, bid2)
      ).to.be.revertedWith('SafeERC20: low-level call failed');
    });

    it('Should revert if the bid currency is 0 address', async () => {
      await zapTokenBsc.mint(bid1.bidder, bid1.amount);
      await zapTokenBsc.mint(bid2.bidder, bid2.amount);

      await zapTokenBsc.connect(signers[0]).approve(bid1.bidder, bid1.amount);
      await zapTokenBsc.connect(signers[0]).approve(bid2.bidder, bid2.amount);

      bid1.currency = '0x0000000000000000000000000000000000000000';
      bid2.currency = '0x0000000000000000000000000000000000000000';

      await expect(
        zapMedia1.connect(signers[1]).setBid(0, bid1)
      ).to.be.revertedWith('Market: bid currency cannot be 0 address');

      await expect(
        zapMedia2.connect(signers[2]).setBid(0, bid2)
      ).to.be.revertedWith('Market: bid currency cannot be 0 address');
    });

    it('Should revert if the bid recipient is 0 address', async () => {
      await zapTokenBsc.mint(signers[1].address, bid1.amount);
      await zapTokenBsc.mint(signers[2].address, bid2.amount);

      await zapTokenBsc
        .connect(signers[1])
        .approve(zapMarket.address, bid1.amount - 1);
      await zapTokenBsc
        .connect(signers[2])
        .approve(zapMarket.address, bid2.amount - 1);

      bid1.recipient = '0x0000000000000000000000000000000000000000';
      bid2.recipient = '0x0000000000000000000000000000000000000000';

      await expect(
        zapMedia1.connect(signers[1]).setBid(0, bid1)
      ).to.be.revertedWith('Market: bid recipient cannot be 0 address');

      await expect(
        zapMedia2.connect(signers[2]).setBid(0, bid2)
      ).to.be.revertedWith('Market: bid recipient cannot be 0 address');
    });

    it('Should revert if the bidder bids 0 tokens', async () => {
      await zapTokenBsc.mint(signers[1].address, bid1.amount);
      await zapTokenBsc.mint(signers[2].address, bid2.amount);

      await zapTokenBsc
        .connect(signers[1])
        .approve(zapMarket.address, bid1.amount);
      await zapTokenBsc
        .connect(signers[2])
        .approve(zapMarket.address, bid2.amount);

      bid1.amount = 0;
      bid2.amount = 0;

      await expect(
        zapMedia1.connect(signers[1]).setBid(0, bid1)
      ).to.be.revertedWith('Market: cannot bid amount of 0');

      await expect(
        zapMedia2.connect(signers[2]).setBid(0, bid2)
      ).to.be.revertedWith('Market: cannot bid amount of 0');
    });

    it('Should accept a valid bid', async () => {

      await zapTokenBsc.mint(signers[1].address, bid1.amount);
      await zapTokenBsc.mint(signers[2].address, bid2.amount);

      await zapTokenBsc
        .connect(signers[1])
        .approve(zapMarket.address, bid1.amount);

      await zapTokenBsc
        .connect(signers[2])
        .approve(zapMarket.address, bid2.amount);

      const beforeBalance1 = await zapTokenBsc.balanceOf(bid1.bidder);
      const beforeBalance2 = await zapTokenBsc.balanceOf(bid2.bidder);

      await zapMedia1.connect(signers[1]).setBid(0, bid1);
      await zapMedia2.connect(signers[2]).setBid(0, bid2);

      const afterBalance1 = await zapTokenBsc.balanceOf(bid1.bidder);
      const afterBalance2 = await zapTokenBsc.balanceOf(bid2.bidder);

      const getBid1 = await zapMarket.bidForTokenBidder(
        zapMedia1.address,
        0,
        bid1.bidder
      );

      const upgradedBid1 = await zapMarketV2.bidForTokenBidder(
        zapMedia1.address,
        0,
        bid1.bidder
      );

      const getBid2 = await zapMarket.bidForTokenBidder(
        zapMedia2.address,
        0,
        bid2.bidder
      );

      const upgradedBid2 = await zapMarketV2.bidForTokenBidder(
        zapMedia2.address,
        0,
        bid2.bidder
      );

      expect(getBid1.currency).to.equal(zapTokenBsc.address);

      expect(upgradedBid1.currency).to.equal(zapTokenBsc.address);

      expect(getBid1.amount.toNumber()).to.equal(bid1.amount);

      expect(getBid1.bidder).to.equal(bid1.bidder);

      expect(upgradedBid1.bidder).to.equal(bid1.bidder);

      expect(beforeBalance1.toNumber()).to.equal(
        afterBalance1.toNumber() + bid1.amount
      );

      expect(getBid2.currency).to.equal(zapTokenBsc.address);

      expect(upgradedBid2.currency).to.equal(zapTokenBsc.address);

      expect(getBid2.amount.toNumber()).to.equal(bid2.amount);

      expect(upgradedBid2.amount.toNumber()).to.equal(bid2.amount);

      expect(getBid2.bidder).to.equal(bid2.bidder);

      expect(upgradedBid2.bidder).to.equal(bid2.bidder);

      expect(beforeBalance2.toNumber()).to.equal(
        afterBalance2.toNumber() + bid2.amount
      );

    });

    it('Should accept a valid bid larger than the min bid', async () => {
      const largerBid1 = {
        amount: 1000,
        currency: zapTokenBsc.address,
        bidder: signers[1].address,
        recipient: signers[8].address,
        spender: signers[1].address,
        sellOnShare: {
          value: BigInt(10000000000000000000)
        }
      };

      const largerBid2 = {
        amount: 2000,
        currency: zapTokenBsc.address,
        bidder: signers[2].address,
        recipient: signers[9].address,
        spender: signers[2].address,
        sellOnShare: {
          value: BigInt(10000000000000000000)
        }
      };

      await zapTokenBsc.mint(signers[1].address, largerBid1.amount);
      await zapTokenBsc.mint(signers[2].address, largerBid2.amount);

      await zapTokenBsc
        .connect(signers[1])
        .approve(zapMarket.address, largerBid1.amount);
      await zapTokenBsc
        .connect(signers[2])
        .approve(zapMarket.address, largerBid2.amount);

      await zapTokenBsc
        .connect(signers[1])
        .approve(zapMarket.address, largerBid1.amount);
      await zapTokenBsc
        .connect(signers[2])
        .approve(zapMarket.address, largerBid2.amount);

      const beforeBalance1 = await zapTokenBsc.balanceOf(largerBid1.bidder);
      const beforeBalance2 = await zapTokenBsc.balanceOf(largerBid2.bidder);

      await zapMedia1.connect(signers[1]).setBid(0, largerBid1);

      await zapMedia2.connect(signers[2]).setBid(0, largerBid2);

      const afterBalance1 = await zapTokenBsc.balanceOf(largerBid1.bidder);
      const afterBalance2 = await zapTokenBsc.balanceOf(largerBid2.bidder);

      const getBid1 = await zapMarket.bidForTokenBidder(
        zapMedia1.address,
        0,
        largerBid1.bidder
      );

      const upgradedBid1 = await zapMarketV2.bidForTokenBidder(
        zapMedia1.address,
        0,
        largerBid1.bidder
      );

      const getBid2 = await zapMarket.bidForTokenBidder(
        zapMedia2.address,
        0,
        largerBid2.bidder
      );

      const upgradedBid2 = await zapMarketV2.bidForTokenBidder(
        zapMedia2.address,
        0,
        largerBid2.bidder
      );

      expect(getBid1.currency).to.equal(zapTokenBsc.address);

      expect(upgradedBid1.currency).to.equal(zapTokenBsc.address);

      expect(getBid1.amount.toNumber()).to.equal(largerBid1.amount);

      expect(upgradedBid1.amount.toNumber()).to.equal(largerBid1.amount);

      expect(getBid1.bidder).to.equal(largerBid1.bidder);

      expect(upgradedBid1.bidder).to.equal(largerBid1.bidder);

      expect(beforeBalance1.toNumber()).to.equal(
        afterBalance1.toNumber() + largerBid1.amount
      );

      expect(getBid2.currency).to.equal(zapTokenBsc.address);

      expect(upgradedBid2.currency).to.equal(zapTokenBsc.address);

      expect(getBid2.amount.toNumber()).to.equal(largerBid2.amount);

      expect(upgradedBid2.amount.toNumber()).to.equal(largerBid2.amount);

      expect(getBid2.bidder).to.equal(largerBid2.bidder);

      expect(upgradedBid2.bidder).to.equal(largerBid2.bidder);

      expect(beforeBalance2.toNumber()).to.equal(
        afterBalance2.toNumber() + largerBid2.amount
      );

    });

    it('Should refund the original bid if the bidder bids again', async () => {
      await zapTokenBsc.mint(signers[1].address, 5000);
      await zapTokenBsc.mint(signers[2].address, 5000);

      await zapTokenBsc.connect(signers[1]).approve(zapMarket.address, 10000);
      await zapTokenBsc.connect(signers[2]).approve(zapMarket.address, 10000);

      const bidderBal1 = await zapTokenBsc.balanceOf(bid1.bidder);

      const bidderBal2 = await zapTokenBsc.balanceOf(bid2.bidder);

      await zapMedia1.connect(signers[1]).setBid(0, bid1);

      await zapMedia2.connect(signers[2]).setBid(0, bid2);

      bid1.amount = bid1.amount * 2;
      bid2.amount = bid2.amount * 2;

      await zapMedia1.connect(signers[1]).setBid(0, bid1);

      await zapMedia2.connect(signers[2]).setBid(0, bid2);

      const afterBalance1 = await zapTokenBsc.balanceOf(bid1.bidder);

      const afterBalance2 = await zapTokenBsc.balanceOf(bid2.bidder);

      expect(afterBalance1.toNumber()).to.equal(
        bidderBal1.toNumber() - bid1.amount
      );
      expect(afterBalance2.toNumber()).to.equal(
        bidderBal2.toNumber() - bid2.amount
      );
    });

    it('Should emit a bid event', async () => {
      await zapTokenBsc.mint(signers[1].address, 5000);
      await zapTokenBsc.mint(signers[2].address, 5000);

      await zapTokenBsc.connect(signers[1]).approve(zapMarket.address, 10000);
      await zapTokenBsc.connect(signers[2]).approve(zapMarket.address, 10000);

      await zapMedia1.connect(signers[1]).setBid(0, bid1);

      await zapMedia2.connect(signers[2]).setBid(0, bid2);

      const filter1: EventFilter = zapMarket.filters.BidCreated(
        zapMedia1.address,
        null,
        null
      );

      const upgraded_filter1: EventFilter = zapMarketV2.filters.BidCreated(
        zapMedia1.address,
        null,
        null
      );

      const eventLog1: Event = (await zapMarket.queryFilter(filter1))[0];

      const upgradedLog1: Event = (
        await zapMarketV2.queryFilter(upgraded_filter1)
      )[0];

      const filter2: EventFilter = zapMarket.filters.BidCreated(
        zapMedia2.address,
        null,
        null
      );

      const upgraded_filter2: EventFilter = zapMarketV2.filters.BidCreated(
        zapMedia2.address,
        null,
        null
      );

      const eventLog2: Event = (await zapMarket.queryFilter(filter2))[0];

      expect(eventLog1.event).to.be.equal('BidCreated');

      expect(upgradedLog1.event).to.be.equal('BidCreated');

      expect(eventLog1.args?.tokenId).to.equal(0);

      expect(upgradedLog1.args?.tokenId).to.equal(0);

      expect(eventLog1.args?.bid.amount.toNumber()).to.equal(bid1.amount);

      expect(upgradedLog1.args?.bid.amount.toNumber()).to.equal(bid1.amount);

      expect(eventLog1.args?.bid.currency).to.equal(bid1.currency);

      expect(upgradedLog1.args?.bid.currency).to.equal(bid1.currency);

      expect(eventLog2.event).to.be.equal('BidCreated');

      expect(eventLog2.args?.tokenId).to.equal(0);

      expect(eventLog2.args?.bid.amount.toNumber()).to.equal(bid2.amount);

      expect(eventLog2.args?.bid.currency).to.equal(bid2.currency);

    });

    it.only('Should accept bid', async () => {

      await zapTokenBsc.mint(signers[1].address, 5000);
      await zapTokenBsc.mint(signers[2].address, 5000);

      await zapTokenBsc.connect(signers[1]).approve(zapMarket.address, 10000);
      await zapTokenBsc.connect(signers[2]).approve(zapMarket.address, 10000);

      const marketPreBal = await zapTokenBsc.balanceOf(zapMarket.address);
      expect(parseInt(marketPreBal._hex)).to.equal(0);

      const recipientPreBal = await zapMedia1.balanceOf(bid1.recipient);
      expect(parseInt(recipientPreBal._hex)).to.equal(0);

      const vaultPreBal = await zapTokenBsc.balanceOf(zapVault.address);
      expect(parseInt(vaultPreBal._hex)).to.equal(0);

      await zapMedia1.setBid(0, bid1);
      await zapMedia2.setBid(0, bid2);

      const marketPostBal = await zapTokenBsc.balanceOf(zapMarket.address);
      expect(parseInt(marketPostBal._hex)).to.equal(bid1.amount + bid2.amount);







      await zapMedia1.acceptBid(0, bid1);
      await zapMedia2.acceptBid(0, bid2);



      const zapMarketFilter: EventFilter =
        zapMarket.filters.BidFinalized(null, null, null);

      const event: Event = (await zapMarket.queryFilter(zapMarketFilter))[0];

      console.log(event)











      const marketBal = await zapTokenBsc.balanceOf(zapMarket.address);
      expect(parseInt(marketBal._hex)).to.equal(0);

      const recipientPostBal = await zapMedia1.balanceOf(bid1.recipient);
      expect(parseInt(recipientPostBal._hex)).to.equal(1);

      const vaultPostBal = await zapTokenBsc.balanceOf(zapVault.address);
      expect(parseInt(vaultPostBal._hex)).to.equal(10);

    })

  });
});
