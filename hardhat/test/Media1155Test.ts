import { ethers, upgrades, deployments } from 'hardhat';

import { EventFilter, Event } from 'ethers';

import { solidity } from 'ethereum-waffle';

import chai, { expect } from 'chai';

import { ZapTokenBSC } from '../typechain/ZapTokenBSC';

import { deploy1155Medias } from './utils';

import { Media1155 } from '../typechain/Media1155';
import { ZapMarketV2 } from '../typechain/ZapMarketV2';
import { Media1155Factory, ZapMarket, ZapMedia } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { formatBytes32String } from 'ethers/lib/utils';
import { DeployResult } from 'hardhat-deploy/dist/types';

const { BigNumber } = ethers;

const { deploy } = deployments;

chai.use(solidity);

describe.only('Media1155 Test', async () => {
  let zapTokenBsc: ZapTokenBSC;
  let zapMarket: ZapMarket;
  let zapMarketV2: ZapMarketV2;
  let media1: Media1155;
  let media2: Media1155;
  let media3: Media1155;
  let media1155Factory: Media1155Factory;

  let signers: SignerWithAddress[];

  let bidShares = {
    collaborators: ['', '', ''],
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
  };

  let ask = {
    amount: 100,
    currency: '',
    sellOnShare: 0
  };

  let tokenURI: any;
  let collaborators: any;

  beforeEach(async () => {
    // Hardhat test accounts
    signers = await ethers.getSigners();

    // Localhost deployment fixtures from the hardhat-deploy plugin
    await deployments.fixture();

    // ZapTokenBSC fixture
    const zapTokenBscFixture = await deployments.get('ZapTokenBSC');

    // Creates the ZapTokenBSC instance
    zapTokenBsc = (await ethers.getContractAt(
      'ZapTokenBSC',
      zapTokenBscFixture.address,
      signers[0]
    )) as ZapTokenBSC;

    // ZapMarket deployment fixture
    const zapMarketFixture = await deployments.get('ZapMarket');

    // Creates an instance of ZapMarket
    zapMarket = (await ethers.getContractAt(
      'ZapMarket',
      zapMarketFixture.address,
      signers[0]
    )) as ZapMarket;

    // Collaborators set on mint
    collaborators = {
      collaboratorTwo: signers[10].address,
      collaboratorThree: signers[11].address,
      collaboratorFour: signers[12].address,
      creator: signers[1].address
    };

    // BidShares set on mint
    bidShares = {
      ...bidShares,
      collaborators: [
        signers[9].address,
        signers[10].address,
        signers[12].address
      ]
    };

    tokenURI = String('media contract 1 - token 1 uri');

    // Upgrade ZapMarket to ZapMarketV2
    const marketUpgradeTx = await deployments.deploy('ZapMarket', {
      from: signers[0].address,
      contract: 'ZapMarketV2',
      proxy: {
        proxyContract: 'OpenZeppelinTransparentProxy'
      },
      log: true
    });

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

    // Deploys the
    const medias1155: Media1155[] = await deploy1155Medias(
      signers,
      zapMarketV2,
      media1155Factory
    );

    // Owned by signers[1]
    media1 = medias1155[0];

    // Owned by signers[2]
    media2 = medias1155[1];

    // Owned by signers[3]
    media3 = medias1155[2];

    // signers[1] claims ownership
    await media1.claimTransferOwnership();

    // signers[2] claims ownership
    await media2.claimTransferOwnership();

    // signers[3] claims ownership
    await media3.claimTransferOwnership();

    ask.currency = zapTokenBsc.address;

    // signer[1] is the owner of media1 and is minting a batch on their collection
    await media1.mintBatch(
      signers[1].address,
      [1, 2, 3],
      [1, 2, 3],
      [bidShares, bidShares, bidShares]
    );
  });

  describe('Configure', () => {
    it('Should have the same address between ZapMarketV1 and ZapMarketV2 after upgrading', async () => {
      expect(zapMarketV2.address).to.equal(zapMarketV2.address);
    });

    it('Should get the owners of the 1155 media contracts', async () => {
      const media1Owner: string = await media1.getOwner();
      expect(media1Owner).to.equal(signers[1].address);

      const media2Owner: string = await media2.getOwner();
      expect(media2Owner).to.equal(signers[2].address);

      const media3Owner: string = await media3.getOwner();
      expect(media3Owner).to.equal(signers[3].address);
    });

    it('Should get the 1155 media contracts', async () => {
      const media1Address: string = await zapMarketV2.mediaContracts(
        signers[1].address,
        BigNumber.from('0')
      );
      expect(media1Address).to.equal(media1.address);

      const media2Address: string = await zapMarketV2.mediaContracts(
        signers[2].address,
        BigNumber.from('0')
      );
      expect(media2Address).to.equal(media2.address);

      const media3Address: string = await zapMarketV2.mediaContracts(
        signers[3].address,
        BigNumber.from('0')
      );
      expect(media3Address).to.equal(media3.address);
    });

    it('Should reject if a registered 1155 media is configured twice', async () => {
      await expect(
        zapMarket
          .connect(signers[1])
          .configure(
            signers[1].address,
            media1.address,
            formatBytes32String('TEST MEDIA 1'),
            formatBytes32String('TM1')
          )
      ).to.be.revertedWith('Market: Only the media factory can do this action');
    });
  });

  describe('#mint', () => {
    it('Should not mint a token if the caller is not approved', async () => {
      await expect(
        media2.connect(signers[4]).mint(signers[4].address, 1, 1, bidShares)
      ).to.be.revertedWith('Media: Only Approved users can mint');
    });

    it("Should not mint if a collaborator's share has not been defined", async () => {
      let testBidShares = bidShares;
      testBidShares = {
        ...testBidShares,
        collabShares: [
          BigNumber.from('15000000000000000000'),
          BigNumber.from('15000000000000000000'),
          BigNumber.from('0')
        ]
      };

      await expect(
        media2.mint(signers[0].address, 1, 1, testBidShares)
      ).to.be.revertedWith(
        'Media: Each collaborator must have a share of the nft'
      );
    });

    it('Should mint token if caller is approved', async () => {
      await media2.approveToMint(signers[3].address);

      // expect(
      await media2
        .connect(signers[3])
        .mint(signers[3].address, 1, 1, bidShares);
      // ).to.be.ok;

      const balance = await media2.balanceOf(signers[3].address, 1);
      expect(balance.eq(1));
    });

    it('Should mint a permissive token without approval', async () => {
      expect(
        await media1
          .connect(signers[4])
          .mint(signers[4].address, 4, 1, bidShares)
      ).to.be.ok;

      const balance = await media1.balanceOf(signers[4].address, 1);
      expect(balance.eq(1));
    });

    it('Should mint token', async () => {
      await media1
        .connect(signers[5])
        .mint(signers[5].address, 4, 1, bidShares);

      const balance = await media2.balanceOf(signers[3].address, 1);
      expect(balance.eq(1));
    });

    it('Should not be able to mint a token with bid shares summing to less than 100', async () => {
      await expect(
        media1.mint(signers[1].address, 1, 1, {
          ...bidShares,
          creator: {
            value: BigInt(50000000000000000000)
          }
        })
      ).to.be.revertedWith('Market: Invalid bid shares, must sum to 100');
    });

    describe('#mintBatch', () => {
      it('Should not mint batch if caller is unapproved', async () => {
        await expect(
          media2
            .connect(signers[4])
            .mintBatch(signers[1].address, [2], [2], [bidShares])
        ).to.be.revertedWith('Media: Only Approved users can mint batch');
      });

      it("Should not mint batch if a collaborator's share has not been defined", async () => {
        let testBidShares = bidShares;
        testBidShares = {
          ...testBidShares,
          collabShares: [
            BigNumber.from('15000000000000000000'),
            BigNumber.from('15000000000000000000'),
            BigNumber.from('0')
          ]
        };

        await expect(
          media2.mintBatch(signers[0].address, [1], [1], [testBidShares])
        ).to.be.revertedWith(
          'Media: Each collaborator must have a share of the nft'
        );
      });

      it('Should mint batch token if caller is approved', async () => {
        expect(await media2.approveToMint(signers[3].address)).to.be.ok;

        expect(
          await media2
            .connect(signers[3])
            .mintBatch(signers[3].address, [1], [1], [bidShares])
        ).to.be.ok;

        const balance = await media2.balanceOf(signers[3].address, 1);
        expect(balance.eq(1));
      });

      it('Should mint batch a permissive token without approval', async () => {
        expect(
          await media1
            .connect(signers[4])
            .mintBatch(signers[4].address, [4], [1], [bidShares])
        ).to.be.ok;

        const balance = await media1.balanceOf(signers[4].address, 4);
        expect(balance.eq(1));
      });

      it('Should mint token', async () => {
        await media1
          .connect(signers[5])
          .mintBatch(
            signers[5].address,
            [4, 5],
            [1, 2],
            [bidShares, bidShares]
          );

        const balance1 = await media1.balanceOf(signers[5].address, 1);
        expect(balance1.eq(1));

        const balance2 = await media1.balanceOf(signers[5].address, 2);
        expect(balance2.eq(2));
      });

      it('Should not be able to mint a token with bid shares summing to less than 100', async () => {
        await expect(
          media1.mintBatch(
            signers[1].address,
            [1],
            [1],
            [
              {
                ...bidShares,
                creator: {
                  value: BigInt(50000000000000000000)
                }
              }
            ]
          )
        ).to.be.revertedWith('Market: Invalid bid shares, must sum to 100');
      });

      it('Should not be able to mint a token if token exists and call is not creator', async () => {
        await media1
          .connect(signers[5])
          .mintBatch(signers[5].address, [4], [1], [bidShares]);

        const balance = await media1.balanceOf(signers[5].address, 4);
        expect(balance.eq(1));

        await expect(
          media1
            .connect(signers[6])
            .mintBatch(signers[6].address, [4], [10], [bidShares])
        ).to.be.revertedWith(
          'Media: Cannot mint an existing token as non creator'
        );
      });
    });

    describe('#setAsk', () => {
      it('Should set the ask', async () => {
        await media1.setAsk(1, ask, signers[1].address);

        let currentAsk = await zapMarketV2.currentAskForToken(
          media1.address,
          1
        );

        expect(currentAsk.amount.toNumber() == ask.amount);
        expect(currentAsk.currency == ask.currency);
      });

      it('Should reject if the ask is 0', async () => {
        await expect(
          media1.setAsk(1, { ...ask, amount: 0 }, signers[1].address)
        ).to.be.revertedWith('Market: Ask invalid for share splitting');
      });

      it('Should reject if the ask amount is invalid and cannot be split', async () => {
        await expect(
          media1.setAsk(1, { ...ask, amount: 7 }, signers[1].address)
        ).to.be.revertedWith('Market: Ask invalid for share splitting');
      });
    });

    describe.only('#setAskBatch', () => {
      it('Should set the ask of batch', async () => {
        await media1.setAskBatch(
          [1, 2, 3],
          [ask, ask, ask],
          signers[0].address
        );

        let currentAsk = await zapMarketV2.currentAskForToken(
          media1.address,
          1
        );

        expect(currentAsk.amount.toNumber() == ask.amount);
        expect(currentAsk.currency == ask.currency);

        currentAsk = await zapMarketV2.currentAskForToken(media1.address, 2);
        expect(currentAsk.amount.toNumber() == ask.amount);
        expect(currentAsk.currency == ask.currency);

        currentAsk = await zapMarketV2.currentAskForToken(media1.address, 3);
        expect(currentAsk.amount.toNumber() == ask.amount);
        expect(currentAsk.currency == ask.currency);
      });

      it('Should reject if the ask batch is 0', async () => {
        await expect(
          media1.setAskBatch([1], [{ ...ask, amount: 0 }], signers[0].address)
        ).revertedWith('Market: Ask invalid for share splitting');
      });

      it('Should reject if the ask amount is invalid and cannot be split', async () => {
        await expect(
          media1.setAskBatch([1], [{ ...ask, amount: 101 }], signers[0].address)
        ).revertedWith('Market: Ask invalid for share splitting');
      });

      it('Should reject if the tokenId and ask arrays do not have the same length', async () => {
        await expect(
          media1.setAskBatch([1, 2], [ask, ask, ask], signers[1].address)
        ).to.be.revertedWith(
          'Market: TokenId and Ask arrays do not have the same length'
        );
      });
    });

    describe('#setBid-without-setupAuction', () => {
      let bid1: any;

      beforeEach(async () => {
        bid1 = {
          amount: 100,
          currency: zapTokenBsc.address,
          bidder: signers[1].address,
          recipient: signers[1].address,
          spender: signers[0].address,
          sellOnShare: {
            value: BigInt(0)
          }
        };

        await media1.mint(signers[0].address, 1, 1, bidShares);
        await media1.setApprovalForAll(zapMarketV2.address, true);
      });

      it('Should revert if the token bidder does not have a high enough allowance for their bidding currency', async () => {
        await zapTokenBsc.mint(signers[1].address, bid1.amount);

        await zapTokenBsc
          .connect(signers[1])
          .approve(zapMarketV2.address, bid1.amount - 1);

        await expect(
          media1.connect(signers[1]).setBid(1, bid1, signers[1].address)
        ).to.be.revertedWith('SafeERC20: low-level call failed');
      });

      it('Should revert if the token bidder does not have a high enough balance for their bidding currency', async () => {
        await zapTokenBsc.mint(signers[1].address, bid1.amount / 2);

        await zapTokenBsc
          .connect(signers[1])
          .approve(zapMarketV2.address, bid1.amount / 2);

        await expect(
          media1.connect(signers[1]).setBid(1, bid1, signers[1].address)
        ).to.be.revertedWith('SafeERC20: low-level call failed');
      });

      it('Should set a bid', async () => {
        await zapTokenBsc.mint(signers[1].address, 100000);

        const prevBalance = await zapTokenBsc.balanceOf(signers[1].address);

        await zapTokenBsc
          .connect(signers[1])
          .approve(zapMarketV2.address, 100000);
        await zapTokenBsc.connect(signers[1]).approve(media3.address, 100000);

        expect(
          await media1.connect(signers[1]).setBid(1, bid1, signers[0].address)
        );

        const balance = await zapTokenBsc.balanceOf(signers[1].address);
        expect(balance.toNumber()).eq(prevBalance.toNumber() - 100);
      });
    });

    async function setupAuction(
      ownerContract: Media1155,
      ownerWallet: SignerWithAddress
    ) {
      const bid1 = {
        amount: 100,
        currency: zapTokenBsc.address,
        bidder: ownerWallet.address,
        recipient: ownerWallet.address,
        spender: ownerWallet.address,
        sellOnShare: {
          value: BigInt(0)
        }
      };

      await zapTokenBsc.mint(ownerWallet.address, 10000);
      await zapTokenBsc.mint(signers[3].address, 10000);
      await zapTokenBsc.mint(signers[4].address, 10000);
      await zapTokenBsc.mint(signers[5].address, 10000);
      await zapTokenBsc.mint(signers[6].address, 10000);
      await zapTokenBsc
        .connect(ownerWallet)
        .approve(zapMarketV2.address, 10000);
      await zapTokenBsc
        .connect(signers[1])
        .approve(ownerContract.address, 100000);
      await zapTokenBsc.connect(signers[3]).approve(zapMarketV2.address, 10000);
      await zapTokenBsc.connect(signers[4]).approve(zapMarketV2.address, 10000);
      await zapTokenBsc.connect(signers[5]).approve(zapMarketV2.address, 10000);
      await zapTokenBsc.connect(signers[6]).approve(zapMarketV2.address, 10000);

      await ownerContract
        .connect(ownerWallet)
        .mint(ownerWallet.address, 1, 1, bidShares);

      await ownerContract.connect(signers[3]).setBid(
        1,
        {
          ...bid1,
          bidder: signers[3].address,
          recipient: signers[3].address
        },
        ownerWallet.address
      );

      await ownerContract.connect(ownerWallet).acceptBid(
        1,
        {
          ...bid1,
          bidder: signers[3].address,
          recipient: signers[3].address
        },
        ownerWallet.address
      );

      let balance = await ownerContract.balanceOf(signers[3].address, 1);
      expect(balance).to.equal(1);

      await ownerContract.connect(signers[4]).setBid(
        1,
        {
          ...bid1,
          bidder: signers[4].address,
          recipient: signers[4].address
        },
        ownerWallet.address
      );

      await ownerContract.connect(signers[3]).acceptBid(
        1,
        {
          ...bid1,
          bidder: signers[4].address,
          recipient: signers[4].address
        },
        signers[3].address
      );

      balance = await ownerContract.balanceOf(signers[4].address, 1);
      expect(balance).to.equal(1);

      await ownerContract.connect(signers[5]).setBid(
        1,
        {
          ...bid1,
          bidder: signers[5].address,
          recipient: signers[5].address
        },
        signers[4].address
      );

      await ownerContract.connect(signers[6]).setBid(
        1,
        {
          ...bid1,
          bidder: signers[6].address,
          recipient: signers[6].address
        },
        signers[4].address
      );

      balance = await ownerContract.balanceOf(signers[4].address, 1);
      expect(balance).to.equal(1);
    }

    describe('#removeBid', () => {
      let bid1: any;
      beforeEach(async () => {
        bid1 = {
          amount: 100,
          currency: zapTokenBsc.address,
          bidder: signers[4].address,
          recipient: signers[4].address,
          spender: signers[4].address,
          sellOnShare: {
            value: BigInt(0)
          }
        };
        await setupAuction(media1, signers[1]);
      });

      it('Should revert if the bidder has not placed a bid', async () => {
        await expect(media1.connect(signers[4]).removeBid(1)).revertedWith(
          'Market: cannot remove bid amount of 0'
        );
      });

      it('Should revert if the tokenId has not yet been created', async () => {
        await expect(media1.connect(signers[4]).removeBid(100)).revertedWith(
          'Market: cannot remove bid amount of 0'
        );
      });

      it('Should remove a bid and refund the bidder', async () => {
        const beforeBalance = await zapTokenBsc.balanceOf(signers[6].address);
        const { amount } = await zapMarketV2.bidForTokenBidder(
          media1.address,
          1,
          signers[6].address
        );

        expect(beforeBalance.toNumber()).to.equal(10000 - amount.toNumber());

        await media1.connect(signers[6]).removeBid(1);

        const afterBalance = await zapTokenBsc.balanceOf(signers[6].address);

        expect(afterBalance.toNumber()).to.equal(
          beforeBalance.toNumber() + amount.toNumber()
        );
      });

      it('Should set a bid', async () => {
        await zapTokenBsc.mint(signers[4].address, 100000);

        const prevBalance = await zapTokenBsc.balanceOf(signers[4].address);

        await zapTokenBsc
          .connect(signers[4])
          .approve(zapMarketV2.address, 100000);

        await media1.connect(signers[4]).setBid(1, bid1, signers[1].address);

        const balance = await zapTokenBsc.balanceOf(signers[4].address);
        expect(balance.toNumber()).eq(prevBalance.toNumber() - 100);
      });
    });

    describe('#removeBid', () => {
      beforeEach(async () => {
        await setupAuction(media1, signers[1]);
      });

      it('Should revert if the bidder has not placed a bid', async () => {
        await expect(media1.connect(signers[4]).removeBid(1)).revertedWith(
          'Market: cannot remove bid amount of 0'
        );
      });

      it('Should revert if the tokenId has not yet been created', async () => {
        await expect(media1.connect(signers[4]).removeBid(100)).revertedWith(
          'Market: cannot remove bid amount of 0'
        );
      });

      it('Should remove a bid and refund the bidder', async () => {
        const beforeBalance = await zapTokenBsc.balanceOf(signers[6].address);

        await media1.connect(signers[6]).removeBid(1);

        const afterBalance = await zapTokenBsc.balanceOf(signers[6].address);

        expect(afterBalance.toNumber()).eq(beforeBalance.toNumber() + 100);
      });

      it('Should not be able to remove a bid twice', async () => {
        await media1.connect(signers[6]).removeBid(1);

        await expect(media1.connect(signers[6]).removeBid(0)).revertedWith(
          'Market: cannot remove bid amount of 0'
        );
      });

      it('Should remove a bid, even if the token is burned', async () => {
        await media1
          .connect(signers[4])
          .transferFrom(signers[4].address, signers[1].address, 1, 1);

        await media1.connect(signers[1]).burn(1, 1, signers[1].address);

        const beforeBalance = await zapTokenBsc.balanceOf(signers[6].address);

        await media1.connect(signers[6]).removeBid(1);

        const afterBalance = await zapTokenBsc.balanceOf(signers[6].address);

        expect(afterBalance.toNumber()).eq(beforeBalance.toNumber() + 100);
      });
    });

    describe('#acceptBid', () => {
      let bid: any;

      beforeEach(async () => {
        bid = {
          amount: 100,
          currency: zapTokenBsc.address,
          bidder: signers[5].address,
          recipient: signers[5].address,
          spender: signers[5].address,
          sellOnShare: {
            value: BigInt(10000000000000000000)
          }
        };

        await setupAuction(media1, signers[1]);
      });

      it('Should accept a bid', async () => {
        await media1.connect(signers[5]).setBid(1, bid, signers[4].address);

        const postBidderBal = await zapTokenBsc.balanceOf(signers[5].address);
        expect(postBidderBal.toNumber()).to.equal(9900);

        const creatorPreAcceptBal = await zapTokenBsc.balanceOf(
          signers[1].address
        );

        await media1.connect(signers[4]).acceptBid(1, bid, signers[4].address);

        const newOwnerBalance = await media1.balanceOf(signers[5].address, 1);
        expect(newOwnerBalance.toNumber()).to.equal(1);
      });

      it('Should emit a bid finalized event if the bid is accepted', async () => {
        await media1.connect(signers[5]).setBid(1, bid, signers[4].address);

        await media1.connect(signers[4]).acceptBid(1, bid, signers[4].address);

        const zapMarketFilter: EventFilter = zapMarketV2.filters.BidFinalized(
          null,
          null,
          null
        );

        const event: Event = (
          await zapMarketV2.queryFilter(zapMarketFilter)
        ).slice(-1)[0];

        const logDescription = zapMarketV2.interface.parseLog(event);

        expect(logDescription.args.tokenId.toNumber()).to.eq(1);

        expect(logDescription.args.bid.amount.toNumber()).to.eq(bid.amount);

        expect(logDescription.args.bid.currency).to.eq(bid.currency);

        expect(logDescription.args.bid.sellOnShare.value).to.eq(
          bid.sellOnShare.value
        );

        expect(logDescription.args.bid.bidder).to.eq(bid.bidder);
      });

      it('Should emit a bid shares updated event if the bid is accepted', async () => {
        await media1.connect(signers[5]).setBid(1, bid, signers[4].address);

        await media1.connect(signers[4]).acceptBid(1, bid, signers[4].address);

        const zapMarketFilter: EventFilter =
          zapMarketV2.filters.BidShareUpdated(null, null, null);

        const event: Event = (
          await zapMarketV2.queryFilter(zapMarketFilter)
        ).slice(-1)[0];

        const logDescription = zapMarketV2.interface.parseLog(event);

        expect(logDescription.args.tokenId.toNumber()).to.eq(1);

        expect(logDescription.args.bidShares.owner.value).to.eq(
          BigInt(35000000000000000000)
        );
        expect(logDescription.args.bidShares.creator.value).to.eq(
          BigInt(15000000000000000000)
        );
      });

      it('Should revert if not called by the owner', async () => {
        await expect(
          media1
            .connect(signers[3])
            .acceptBid(
              1,
              { ...bid, bidder: signers[3].address },
              signers[4].address
            )
        ).to.be.revertedWith('Media: Only approved or owner');
      });

      it('Should revert if a non-existent bid is accepted', async () => {
        await expect(
          media1
            .connect(signers[4])
            .acceptBid(
              1,
              { ...bid, bidder: '0x0000000000000000000000000000000000000000' },
              signers[4].address
            )
        ).revertedWith('Market: cannot accept bid of 0');
      });

      it('Should revert if an invalid bid is accepted', async () => {
        const invalidBid = {
          ...bid,
          bidder: signers[5].address,
          amount: 99
        };

        await media1
          .connect(signers[5])
          .setBid(1, invalidBid, signers[4].address);

        await expect(
          media1
            .connect(signers[4])
            .acceptBid(1, invalidBid, signers[4].address)
        ).revertedWith('Market: Bid invalid for share splitting');
      });
    });

    describe('#burn', () => {
      beforeEach(async () => {
        await media3.mint(signers[3].address, 1, 1, bidShares);
      });

      it('should revert when the caller is the owner, but not creator', async () => {
        await media3
          .connect(signers[3])
          .transferFrom(signers[3].address, signers[4].address, 1, 1);

        await expect(
          media3.connect(signers[4]).burn(1, 1, signers[4].address)
        ).revertedWith('Media: Must be creator of token to burn');
      });

      it('should revert when the caller is approved, but the owner is not the creator', async () => {
        await media3
          .connect(signers[3])
          .transferFrom(signers[3].address, signers[4].address, 1, 1);

        await media3
          .connect(signers[4])
          .setApprovalForAll(signers[5].address, true);

        await expect(
          media3.connect(signers[5]).burn(1, 1, signers[4].address)
        ).revertedWith('Media: Must be creator of token to burn');
      });

      it('should revert when the caller is not the owner or a creator', async () => {
        await expect(
          media3.connect(signers[5]).burn(1, 1, signers[3].address)
        ).revertedWith('Media: Only approved or owner');
      });

      it('should burn a token', async () => {
        expect(await media3.connect(signers[3]).burn(1, 1, signers[3].address));

        let balance = await media3.balanceOf(signers[3].address, 1);
        expect(balance).to.eq(0);
      });
    });

    describe.skip('#transfer', () => {
      it('should remove the ask after a transfer', async () => {
        ask.currency = zapTokenBsc.address;

        await setupAuction(media2, signers[2]);

        await media2.connect(signers[4]).setAsk(1, ask, signers[4].address);

        expect(
          await media2
            .connect(signers[4])
            .transferFrom(signers[4].address, signers[5].address, 1, 1)
        );

        const askB = await zapMarket.currentAskForToken(media2.address, 1);

        expect(await askB.amount.toNumber()).eq(0);

        expect(await askB.currency).eq(
          '0x0000000000000000000000000000000000000000'
        );
      });
    });
  });
});
