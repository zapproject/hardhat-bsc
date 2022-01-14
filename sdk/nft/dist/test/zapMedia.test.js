"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var ethers_1 = require("ethers");
var utils_1 = require("../src/utils");
var zapMedia_1 = __importDefault(require("../src/zapMedia"));
var addresses_1 = require("../src/contract/addresses");
var deploy_1 = require("../src/deploy");
var test_utils_1 = require("./test_utils");
var provider = new ethers_1.ethers.providers.JsonRpcProvider('http://localhost:8545');
describe('ZapMedia', function () {
    var bidShares;
    var ask;
    var mediaData;
    var token;
    var zapVault;
    var zapMarket;
    var zapMediaImpl;
    var mediaFactory;
    var signer;
    var zapMedia;
    var fetchMediaByIndex;
    var signers = (0, test_utils_1.getWallets)(provider);
    // const signers = getSigners(provider);
    var test = (0, test_utils_1.getTestAccounts)();
    console.log(test);
    console.log(signers);
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    signer = signers[0];
                    return [4 /*yield*/, (0, deploy_1.deployZapToken)()];
                case 1:
                    // signer = provider.getSigner(0);
                    token = _a.sent();
                    return [4 /*yield*/, (0, deploy_1.deployZapVault)()];
                case 2:
                    zapVault = _a.sent();
                    return [4 /*yield*/, (0, deploy_1.deployZapMarket)()];
                case 3:
                    zapMarket = _a.sent();
                    return [4 /*yield*/, (0, deploy_1.deployZapMediaImpl)()];
                case 4:
                    zapMediaImpl = _a.sent();
                    return [4 /*yield*/, (0, deploy_1.deployMediaFactory)()];
                case 5:
                    mediaFactory = _a.sent();
                    return [4 /*yield*/, (0, deploy_1.deployZapMedia)()];
                case 6:
                    zapMedia = _a.sent();
                    addresses_1.zapMarketAddresses['1337'] = zapMarket.address;
                    addresses_1.mediaFactoryAddresses['1337'] = mediaFactory.address;
                    addresses_1.zapMediaAddresses['1337'] = zapMedia.address;
                    return [2 /*return*/];
            }
        });
    }); });
    describe('#constructor', function () {
        it.only('Should throw an error if the networkId is invalid', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, chai_1.expect)(function () {
                    new zapMedia_1.default(300, signer);
                }).to.throw('ZapMedia Constructor: Network Id is not supported.');
                return [2 /*return*/];
            });
        }); });
    });
    describe('Contract Functions', function () {
        describe('View Functions', function () {
            var tokenURI = 'https://bafkreievpmtbofalpowrcbr5oaok33e6xivii62r6fxh6fontaglngme2m.ipfs.dweb.link/';
            var metadataURI = 'https://bafkreihhu7xo7knc3vn42jj26gz3jkvh3uu3rwurkb4djsoo5ayqs2s25a.ipfs.dweb.link/';
            beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
                var metadataHex, metadataHashRaw, metadataHashBytes, contentHex, contentHashRaw, contentHashBytes, contentHash, metadataHash;
                return __generator(this, function (_a) {
                    metadataHex = ethers_1.ethers.utils.formatBytes32String('Test');
                    metadataHashRaw = ethers_1.ethers.utils.keccak256(metadataHex);
                    metadataHashBytes = ethers_1.ethers.utils.arrayify(metadataHashRaw);
                    contentHex = ethers_1.ethers.utils.formatBytes32String('Test Car');
                    contentHashRaw = ethers_1.ethers.utils.keccak256(contentHex);
                    contentHashBytes = ethers_1.ethers.utils.arrayify(contentHashRaw);
                    contentHash = contentHashBytes;
                    metadataHash = metadataHashBytes;
                    mediaData = (0, utils_1.constructMediaData)(tokenURI, metadataURI, contentHash, metadataHash);
                    bidShares = (0, utils_1.constructBidShares)([
                        signers[1].address,
                        signers[2].address,
                        signers[3].address,
                    ], [15, 15, 15], 15, 35);
                    return [2 /*return*/];
                });
            }); });
            describe('test fetchContentHash, fetchMetadataHash, fetchPermitNonce', function () {
                it('Should be able to fetch contentHash', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, onChainContentHash;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchContentHash(0)];
                            case 2:
                                onChainContentHash = _a.sent();
                                (0, chai_1.expect)(onChainContentHash).eq(ethers_1.ethers.utils.hexlify(mediaData.contentHash));
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("fetchContentHash should get 0x0 if tokenId doesn't exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, onChainContentHash;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchContentHash(56)];
                            case 2:
                                onChainContentHash = _a.sent();
                                // tokenId doesn't exists, so we expect a default return value of 0x0000...
                                (0, chai_1.expect)(onChainContentHash).eq(ethers_1.ethers.constants.HashZero);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should be able to fetch metadataHash', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, onChainMetadataHash;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchMetadataHash(0)];
                            case 2:
                                onChainMetadataHash = _a.sent();
                                (0, chai_1.expect)(onChainMetadataHash).eq(ethers_1.ethers.utils.hexlify(mediaData.metadataHash));
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("fetchMetadataHash should get 0x0 if tokenId doesn't exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, onChainMetadataHash;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchMetadataHash(56)];
                            case 2:
                                onChainMetadataHash = _a.sent();
                                // tokenId doesn't exists, so we expect a default return value of 0x0000...
                                (0, chai_1.expect)(onChainMetadataHash).eq(ethers_1.ethers.constants.HashZero);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it.skip('Should be able to fetch permitNonce', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var zap_media, anotherMedia, mainWallet, otherWallet, deadline, domain, nonce;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                zap_media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, zap_media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                anotherMedia = new zapMedia_1.default(1337, signers[1]);
                                mainWallet = new ethers_1.ethers.Wallet("0x89e2d8a81beffed50f4d29f642127f18b5c8c1212c54b18ef66a784d0a172819");
                                otherWallet = new ethers_1.ethers.Wallet("0x043192f7a8fb472d04ef7bb0ba1fbb3667198253cc8046e9e56626b804966cb3");
                                deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 // 24 hours
                                ;
                                domain = zap_media.eip712Domain();
                                return [4 /*yield*/, anotherMedia.fetchPermitNonce(otherWallet.address, 0)
                                    // console.log(nonce)
                                    // const eipSig = await signPermitMessage(
                                    //   mainWallet,
                                    //   otherWallet.address,
                                    //   0,
                                    //   0,
                                    //   deadline,
                                    //   domain
                                    // )
                                    // await anotherMedia.permit(otherWallet.address, 0, eipSig)
                                    // const approved = await anotherMedia.fetchApproved(0)
                                    // console.log(approved)
                                    // // const approved2 = await anotherMedia.fetchApproved(3)
                                    // // console.log(approved2)
                                    // expect(approved.toLowerCase()).to.equal(otherWallet.address.toLowerCase())
                                    // const nonce2 = await anotherMedia.fetchPermitNonce(otherWallet.address, 0)
                                    // console.log(nonce2.toString())
                                ];
                            case 2:
                                nonce = _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        });
        describe('Write Functions', function () {
            var tokenURI = 'https://bafkreievpmtbofalpowrcbr5oaok33e6xivii62r6fxh6fontaglngme2m.ipfs.dweb.link/';
            var metadataURI = 'https://bafkreihhu7xo7knc3vn42jj26gz3jkvh3uu3rwurkb4djsoo5ayqs2s25a.ipfs.dweb.link/';
            beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
                var metadataHex, metadataHashRaw, metadataHashBytes, contentHex, contentHashRaw, contentHashBytes, contentHash, metadataHash;
                return __generator(this, function (_a) {
                    metadataHex = ethers_1.ethers.utils.formatBytes32String('Test');
                    metadataHashRaw = ethers_1.ethers.utils.keccak256(metadataHex);
                    metadataHashBytes = ethers_1.ethers.utils.arrayify(metadataHashRaw);
                    contentHex = ethers_1.ethers.utils.formatBytes32String('Test Car');
                    contentHashRaw = ethers_1.ethers.utils.keccak256(contentHex);
                    contentHashBytes = ethers_1.ethers.utils.arrayify(contentHashRaw);
                    contentHash = contentHashBytes;
                    metadataHash = metadataHashBytes;
                    mediaData = (0, utils_1.constructMediaData)(tokenURI, metadataURI, contentHash, metadataHash);
                    bidShares = (0, utils_1.constructBidShares)([
                        signers[1].address,
                        signers[2].address,
                        signers[3].address,
                    ], [15, 15, 15], 15, 35);
                    return [2 /*return*/];
                });
            }); });
            describe('#updateContentURI', function () {
                it('Should thrown an error if the tokenURI does not begin with `https://`', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                mediaData.tokenURI = 'http://example.com';
                                return [4 /*yield*/, media
                                        .mint(mediaData, bidShares)
                                        .then(function (res) {
                                        return res;
                                    })
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err).to.equal('Invariant failed: http://example.com must begin with `https://`');
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should throw an error if the updateContentURI tokenId does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media
                                        .updateContentURI(0, 'www.newURI.com')
                                        .then(function (res) {
                                        console.log(res);
                                    })
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal('Invariant failed: ZapMedia (updateContentURI): TokenId does not exist.');
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should throw an error if the fetchContentURI tokenId does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media
                                        .fetchContentURI(0)
                                        .then(function (res) {
                                        console.log(res);
                                    })
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal('Invariant failed: ZapMedia (fetchContentURI): TokenId does not exist.');
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should update the content uri', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, fetchTokenURI, fetchNewURI;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                // Mints tokenId 0
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                // Mints tokenId 0
                                _a.sent();
                                return [4 /*yield*/, media.fetchContentURI(0)];
                            case 2:
                                fetchTokenURI = _a.sent();
                                // The returned tokenURI should equal the tokenURI configured in the mediaData
                                (0, chai_1.expect)(fetchTokenURI).to.equal(mediaData.tokenURI);
                                // Updates tokenId 0's tokenURI
                                return [4 /*yield*/, media.updateContentURI(0, 'https://newURI.com')];
                            case 3:
                                // Updates tokenId 0's tokenURI
                                _a.sent();
                                return [4 /*yield*/, media.fetchContentURI(0)];
                            case 4:
                                fetchNewURI = _a.sent();
                                // The new tokenURI returned should equal the updatedURI
                                (0, chai_1.expect)(fetchNewURI).to.equal('https://newURI.com');
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#updateMetadataURI', function () {
                it('Should thrown an error if the metadataURI does not begin with `https://`', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                mediaData.metadataURI = 'http://example.com';
                                return [4 /*yield*/, media
                                        .mint(mediaData, bidShares)
                                        .then(function (res) {
                                        return res;
                                    })
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err).to.equal('Invariant failed: http://example.com must begin with `https://`');
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should update the metadata uri', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, fetchMetadataURI, newMetadataURI;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchMetadataURI(0)];
                            case 2:
                                fetchMetadataURI = _a.sent();
                                (0, chai_1.expect)(fetchMetadataURI).to.equal(mediaData.metadataURI);
                                return [4 /*yield*/, media.updateMetadataURI(0, 'https://newMetadataURI.com')];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, media.fetchMetadataURI(0)];
                            case 4:
                                newMetadataURI = _a.sent();
                                (0, chai_1.expect)(newMetadataURI).to.equal('https://newMetadataURI.com');
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#mint', function () {
                it('throws an error if bid shares do not sum to 100', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var bidShareSum, media, i;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                bidShareSum = 0;
                                media = new zapMedia_1.default(1337, signer);
                                bidShares.creator.value = bidShares.creator.value.add(BigInt(1e18));
                                for (i = 0; i < bidShares.collabShares.length; i++) {
                                    bidShareSum += parseInt(bidShares.collabShares[i]);
                                }
                                bidShareSum += parseInt(bidShares.creator.value) + parseInt(bidShares.owner.value) + 5e18;
                                return [4 /*yield*/, media
                                        .mint(mediaData, bidShares)
                                        .then(function (res) {
                                        return res;
                                    })
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err).to.equal("Invariant failed: The BidShares sum to ".concat(bidShareSum, ", but they must sum to 100000000000000000000"));
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should be able to mint', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, preTotalSupply, owner, creator, onChainBidShares, onChainContentURI, onChainMetadataURI;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.fetchTotalMedia()];
                            case 1:
                                preTotalSupply = (_a.sent()).toNumber();
                                (0, chai_1.expect)(preTotalSupply).to.equal(0);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 3:
                                owner = _a.sent();
                                return [4 /*yield*/, media.fetchCreator(0)];
                            case 4:
                                creator = _a.sent();
                                return [4 /*yield*/, media.fetchCurrentBidShares(zapMedia.address, 0)];
                            case 5:
                                onChainBidShares = _a.sent();
                                return [4 /*yield*/, media.fetchContentURI(0)];
                            case 6:
                                onChainContentURI = _a.sent();
                                return [4 /*yield*/, media.fetchMetadataURI(0)];
                            case 7:
                                onChainMetadataURI = _a.sent();
                                (0, chai_1.expect)(owner).to.equal(signer.address);
                                (0, chai_1.expect)(creator).to.equal(signer.address);
                                (0, chai_1.expect)(onChainContentURI).to.equal(mediaData.tokenURI);
                                (0, chai_1.expect)(onChainMetadataURI).to.equal(mediaData.metadataURI);
                                (0, chai_1.expect)(parseInt(onChainBidShares.creator.value)).to.equal(parseInt(bidShares.creator.value));
                                (0, chai_1.expect)(parseInt(onChainBidShares.owner.value)).to.equal(parseInt(onChainBidShares.owner.value));
                                (0, chai_1.expect)(onChainBidShares.collaborators).to.eql(bidShares.collaborators);
                                (0, chai_1.expect)(onChainBidShares.collabShares).to.eql(bidShares.collabShares);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#getTokenCreators', function () {
                it('Should throw an error if the tokenId does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media
                                        .fetchCreator(0)
                                        .then(function (res) {
                                        console.log(res);
                                    })
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal('Invariant failed: ZapMedia (fetchCreator): TokenId does not exist.');
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should return the token creator', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, creator;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchCreator(0)];
                            case 2:
                                creator = _a.sent();
                                (0, chai_1.expect)(creator).to.equal(signer.address);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#tokenOfOwnerByIndex', function () {
                it('Should throw an error if the (owner) is a zero address', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media
                                        .fetchMediaOfOwnerByIndex(ethers_1.ethers.constants.AddressZero, 0)
                                        .then(function (res) {
                                        console.log(res);
                                    })
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal('Invariant failed: ZapMedia (fetchMediaOfOwnerByIndex): The (owner) address cannot be a zero address.');
                                    })];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should return the token of the owner by index', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, tokenId;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchMediaOfOwnerByIndex(signer.address, 0)];
                            case 2:
                                tokenId = _a.sent();
                                (0, chai_1.expect)(parseInt(tokenId._hex)).to.equal(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#setAsk', function () {
                it('Should throw an error if the signer is not approved nor the owner', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var signer1, media, media1, owner, getApproved;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ask = (0, utils_1.constructAsk)(zapMedia.address, 100);
                                signer1 = signers[1];
                                media = new zapMedia_1.default(1337, signer);
                                media1 = new zapMedia_1.default(1337, signer1);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 2:
                                owner = _a.sent();
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 3:
                                getApproved = _a.sent();
                                (0, chai_1.expect)(owner).to.not.equal(signer1.address);
                                (0, chai_1.expect)(owner).to.equal(signer.address);
                                (0, chai_1.expect)(getApproved).to.not.equal(signer1.address);
                                (0, chai_1.expect)(getApproved).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [4 /*yield*/, media1
                                        .setAsk(0, ask)
                                        .then(function (res) {
                                        console.log(res);
                                    })
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal('Invariant failed: ZapMedia (setAsk): Media: Only approved or owner.');
                                    })];
                            case 4:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should set an ask by the owner', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, owner, getApproved, onChainAsk;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ask = (0, utils_1.constructAsk)(zapMedia.address, 100);
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 2:
                                owner = _a.sent();
                                (0, chai_1.expect)(owner).to.equal(signer.address);
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 3:
                                getApproved = _a.sent();
                                (0, chai_1.expect)(getApproved).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [4 /*yield*/, media.setAsk(0, ask)];
                            case 4:
                                _a.sent();
                                return [4 /*yield*/, media.fetchCurrentAsk(zapMedia.address, 0)];
                            case 5:
                                onChainAsk = _a.sent();
                                (0, chai_1.expect)(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
                                (0, chai_1.expect)(onChainAsk.currency).to.equal(zapMedia.address);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should set an ask by the approved', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var signer1, media, media1, owner, getApproved, onChainAsk;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ask = (0, utils_1.constructAsk)(zapMedia.address, 100);
                                signer1 = signers[1];
                                media = new zapMedia_1.default(1337, signer);
                                media1 = new zapMedia_1.default(1337, signer1);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.approve(signer1.address, 0)];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 3:
                                owner = _a.sent();
                                (0, chai_1.expect)(owner).to.equal(signer.address);
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 4:
                                getApproved = _a.sent();
                                (0, chai_1.expect)(getApproved).to.equal(signer1.address);
                                return [4 /*yield*/, media1.setAsk(0, ask)];
                            case 5:
                                _a.sent();
                                return [4 /*yield*/, media.fetchCurrentAsk(zapMedia.address, 0)];
                            case 6:
                                onChainAsk = _a.sent();
                                (0, chai_1.expect)(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
                                (0, chai_1.expect)(onChainAsk.currency).to.equal(zapMedia.address);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#setbid', function () {
                // it('creates a new bid on chain', async () => {
                //   const zap = new ZapMedia(1337, signer);
                //   await zap.mint(mediaData, bidShares);
                //   const onChainCurrentBidForBidder = await zap.fetchCurrentBidForBidder(zapMedia.address, 0);
                //   const nullOnChainBid = await zap.()
                // }
            });
            describe('#removeAsk', function () {
                it('Should throw an error if the removeAsk tokenId does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ask = (0, utils_1.constructAsk)(zapMedia.address, 100);
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media
                                        .removeAsk(0)
                                        .then(function (res) {
                                        console.log(res);
                                    })
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal('Invariant failed: ZapMedia (removeAsk): TokenId does not exist.');
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should throw an error if the tokenId exists but an ask was not set', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media
                                        .removeAsk(0)
                                        .then(function (res) {
                                        console.log(res);
                                    })
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal('Invariant failed: ZapMedia (removeAsk): Ask was never set.');
                                    })];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should remove an ask', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, owner, getApproved, onChainAsk, onChainAskRemoved;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ask = (0, utils_1.constructAsk)(zapMedia.address, 100);
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 2:
                                owner = _a.sent();
                                (0, chai_1.expect)(owner).to.equal(signer.address);
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 3:
                                getApproved = _a.sent();
                                (0, chai_1.expect)(getApproved).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [4 /*yield*/, media.setAsk(0, ask)];
                            case 4:
                                _a.sent();
                                return [4 /*yield*/, media.fetchCurrentAsk(zapMedia.address, 0)];
                            case 5:
                                onChainAsk = _a.sent();
                                (0, chai_1.expect)(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
                                (0, chai_1.expect)(onChainAsk.currency).to.equal(zapMedia.address);
                                return [4 /*yield*/, media.removeAsk(0)];
                            case 6:
                                _a.sent();
                                return [4 /*yield*/, media.fetchCurrentAsk(zapMedia.address, 0)];
                            case 7:
                                onChainAskRemoved = _a.sent();
                                (0, chai_1.expect)(parseInt(onChainAskRemoved.amount.toString())).to.equal(0);
                                (0, chai_1.expect)(onChainAskRemoved.currency).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#revokeApproval', function () {
                it("revokes an addresses approval of another address's media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var signer1, media, approved, media1, revokedStatus;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                signer1 = signers[1];
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.approve(signer1.address, 0)];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 3:
                                approved = _a.sent();
                                (0, chai_1.expect)(approved).to.equal(signer1.address);
                                media1 = new zapMedia_1.default(1337, signer1);
                                return [4 /*yield*/, media1.revokeApproval(0)];
                            case 4:
                                _a.sent();
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 5:
                                revokedStatus = _a.sent();
                                (0, chai_1.expect)(revokedStatus).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#burn', function () {
                it('Should burn a token', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, owner, preTotalSupply, postTotalSupply;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 2:
                                owner = _a.sent();
                                (0, chai_1.expect)(owner).to.equal(signer.address);
                                return [4 /*yield*/, media.fetchTotalMedia()];
                            case 3:
                                preTotalSupply = _a.sent();
                                (0, chai_1.expect)(preTotalSupply.toNumber()).to.equal(1);
                                return [4 /*yield*/, media.burn(0)];
                            case 4:
                                _a.sent();
                                return [4 /*yield*/, media.fetchTotalMedia()];
                            case 5:
                                postTotalSupply = _a.sent();
                                (0, chai_1.expect)(postTotalSupply.toNumber()).to.equal(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#approve', function () {
                it('Should approve another address for a token', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var signer1, media, preApprovedStatus, postApprovedStatus;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                signer1 = signers[1];
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 2:
                                preApprovedStatus = _a.sent();
                                (0, chai_1.expect)(preApprovedStatus).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [4 /*yield*/, media.approve(signer1.address, 0)];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 4:
                                postApprovedStatus = _a.sent();
                                (0, chai_1.expect)(postApprovedStatus).to.equal(signer1.address);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#setApprovalForAll', function () {
                it('Should set approval for another address for all tokens owned by owner', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var signer1, media, preApprovalStatus, postApprovalStatus, revoked;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                signer1 = signers[1];
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchIsApprovedForAll(signer.address, signer1.address)];
                            case 2:
                                preApprovalStatus = _a.sent();
                                (0, chai_1.expect)(preApprovalStatus).to.be.false;
                                return [4 /*yield*/, media.setApprovalForAll(signer1.address, true)];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, media.fetchIsApprovedForAll(signer.address, signer1.address)];
                            case 4:
                                postApprovalStatus = _a.sent();
                                (0, chai_1.expect)(postApprovalStatus).to.be.true;
                                return [4 /*yield*/, media.setApprovalForAll(signer1.address, false)];
                            case 5:
                                _a.sent();
                                return [4 /*yield*/, media.fetchIsApprovedForAll(signer.address, signer1.address)];
                            case 6:
                                revoked = _a.sent();
                                (0, chai_1.expect)(revoked).to.be.false;
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#transferFrom', function () {
                it('Should transfer token to another address', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var recipient, media, owner, newOwner;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                recipient = signers[1].address;
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 2:
                                owner = _a.sent();
                                (0, chai_1.expect)(owner).to.equal(signer.address);
                                return [4 /*yield*/, media.transferFrom(owner, recipient, 0)];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 4:
                                newOwner = _a.sent();
                                (0, chai_1.expect)(newOwner).to.equal(recipient);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#safeTransferFrom', function () {
                it('Should revert if the tokenId does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var recipient, media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                recipient = signers[1].address;
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media
                                        .safeTransferFrom(signer.address, recipient, 0)
                                        .then(function (res) {
                                        console.log(res);
                                    })
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal('Invariant failed: ZapMedia (safeTransferFrom): TokenId does not exist.');
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should revert if the (from) is a zero address', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var recipient, media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                recipient = signers[1].address;
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media
                                        .safeTransferFrom(ethers_1.ethers.constants.AddressZero, recipient, 0)
                                        .then(function (res) {
                                        console.log(res);
                                    })
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal('Invariant failed: ZapMedia (safeTransferFrom): The (from) address cannot be a zero address.');
                                    })];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should revert if the (to) is a zero address', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media
                                        .safeTransferFrom(signer.address, ethers_1.ethers.constants.AddressZero, 0)
                                        .then(function (res) {
                                        console.log(res);
                                    })
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal('Invariant failed: ZapMedia (safeTransferFrom): The (to) address cannot be a zero address.');
                                    })];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should safe transfer a token to an address', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var recipient, media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                recipient = signers[1].address;
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.safeTransferFrom(signer.address, recipient, 0)];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#isValidBid', function () {
                it('Should return true if the bid amount can be evenly split by current bidShares', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#permit', function () {
                it("should allow a wallet to set themselves to approved with a valid signature", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var zap_media, anotherMedia, mainWallet, otherWallet, deadline, domain, eipSig, approved;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                zap_media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, zap_media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                anotherMedia = new zapMedia_1.default(1337, signers[1]);
                                mainWallet = new ethers_1.ethers.Wallet("0x89e2d8a81beffed50f4d29f642127f18b5c8c1212c54b18ef66a784d0a172819");
                                otherWallet = new ethers_1.ethers.Wallet("0x043192f7a8fb472d04ef7bb0ba1fbb3667198253cc8046e9e56626b804966cb3");
                                deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 // 24 hours
                                ;
                                domain = zap_media.eip712Domain();
                                return [4 /*yield*/, (0, test_utils_1.signPermitMessage)(mainWallet, otherWallet.address, 0, 0, deadline, domain)];
                            case 2:
                                eipSig = _a.sent();
                                return [4 /*yield*/, anotherMedia.permit(otherWallet.address, 0, eipSig)];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, anotherMedia.fetchApproved(0)];
                            case 4:
                                approved = _a.sent();
                                (0, chai_1.expect)(approved.toLowerCase()).to.equal(otherWallet.address.toLowerCase());
                                // test to see if approved for another token. should fail.
                                return [4 /*yield*/, anotherMedia.fetchApproved(1)
                                        .then(function (res) {
                                        console.log(res);
                                    })
                                        .catch(function (err) {
                                        // // ERC721: approved query for nonexistent token
                                        (0, chai_1.expect)(err);
                                    })];
                            case 5:
                                // test to see if approved for another token. should fail.
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#fetchMedia', function () {
                it('Should get media instance by index in the media contract', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, tokenId;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchMediaByIndex(0)];
                            case 2:
                                tokenId = _a.sent();
                                (0, chai_1.expect)(parseInt(tokenId._hex)).to.equal(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should throw an error index out of range', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media
                                        .fetchMediaByIndex(1)
                                        .then(function (res) {
                                        return res;
                                    })
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal('Invariant failed: ZapMedia (tokenByIndex): Index out of range.');
                                    })];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        });
    });
});
//# sourceMappingURL=zapMedia.test.js.map