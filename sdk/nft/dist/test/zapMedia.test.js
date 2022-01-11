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
    var bid;
    var signers = (0, test_utils_1.getSigners)(provider);
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
        it('Should throw an error if the networkId is invalid', function () { return __awaiter(void 0, void 0, void 0, function () {
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
                var metadataHex, metadataHashRaw, metadataHashBytes, contentHex, contentHashRaw, contentHashBytes, contentHash, metadataHash, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            metadataHex = ethers_1.ethers.utils.formatBytes32String('Test');
                            metadataHashRaw = ethers_1.ethers.utils.keccak256(metadataHex);
                            metadataHashBytes = ethers_1.ethers.utils.arrayify(metadataHashRaw);
                            contentHex = ethers_1.ethers.utils.formatBytes32String('Test Car');
                            contentHashRaw = ethers_1.ethers.utils.keccak256(contentHex);
                            contentHashBytes = ethers_1.ethers.utils.arrayify(contentHashRaw);
                            contentHash = contentHashBytes;
                            metadataHash = metadataHashBytes;
                            mediaData = (0, utils_1.constructMediaData)(tokenURI, metadataURI, contentHash, metadataHash);
                            _a = utils_1.constructBidShares;
                            return [4 /*yield*/, provider.getSigner(1).getAddress()];
                        case 1:
                            _b = [
                                _c.sent()
                            ];
                            return [4 /*yield*/, provider.getSigner(2).getAddress()];
                        case 2:
                            _b = _b.concat([
                                _c.sent()
                            ]);
                            return [4 /*yield*/, provider.getSigner(3).getAddress()];
                        case 3:
                            bidShares = _a.apply(void 0, [_b.concat([
                                    _c.sent()
                                ]), [15, 15, 15],
                                15,
                                35]);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe("test fetchContentHash, fetchMetadataHash", function () {
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
                it('fetchContentHash should get 0x0 if tokenId doesn\'t exist', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, onChainContentHash;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchContentHash(56)
                                    // tokenId doesn't exists, so we expect a default return value of 0x0000...
                                ];
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
                it('fetchMetadataHash should get 0x0 if tokenId doesn\'t exist', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, onChainMetadataHash;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchMetadataHash(56)
                                    // tokenId doesn't exists, so we expect a default return value of 0x0000...
                                ];
                            case 2:
                                onChainMetadataHash = _a.sent();
                                // tokenId doesn't exists, so we expect a default return value of 0x0000...
                                (0, chai_1.expect)(onChainMetadataHash).eq(ethers_1.ethers.constants.HashZero);
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
                var metadataHex, metadataHashRaw, metadataHashBytes, contentHex, contentHashRaw, contentHashBytes, contentHash, metadataHash, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            metadataHex = ethers_1.ethers.utils.formatBytes32String('Test');
                            metadataHashRaw = ethers_1.ethers.utils.keccak256(metadataHex);
                            metadataHashBytes = ethers_1.ethers.utils.arrayify(metadataHashRaw);
                            contentHex = ethers_1.ethers.utils.formatBytes32String('Test Car');
                            contentHashRaw = ethers_1.ethers.utils.keccak256(contentHex);
                            contentHashBytes = ethers_1.ethers.utils.arrayify(contentHashRaw);
                            contentHash = contentHashBytes;
                            metadataHash = metadataHashBytes;
                            mediaData = (0, utils_1.constructMediaData)(tokenURI, metadataURI, contentHash, metadataHash);
                            _a = utils_1.constructBidShares;
                            return [4 /*yield*/, signers[1].getAddress()];
                        case 1:
                            _b = [
                                _c.sent()
                            ];
                            return [4 /*yield*/, signers[2].getAddress()];
                        case 2:
                            _b = _b.concat([
                                _c.sent()
                            ]);
                            return [4 /*yield*/, signers[3].getAddress()];
                        case 3:
                            bidShares = _a.apply(void 0, [_b.concat([
                                    _c.sent()
                                ]), [15, 15, 15],
                                15,
                                35]);
                            return [2 /*return*/];
                    }
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
                    var media, preTotalSupply, owner, creator, onChainBidShares, onChainContentURI, onChainMetadataURI, _a, _b, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.fetchTotalMedia()];
                            case 1:
                                preTotalSupply = (_e.sent()).toNumber();
                                (0, chai_1.expect)(preTotalSupply).to.equal(0);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 2:
                                _e.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 3:
                                owner = _e.sent();
                                return [4 /*yield*/, media.fetchCreator(0)];
                            case 4:
                                creator = _e.sent();
                                return [4 /*yield*/, media.fetchCurrentBidShares(zapMedia.address, 0)];
                            case 5:
                                onChainBidShares = _e.sent();
                                return [4 /*yield*/, media.fetchContentURI(0)];
                            case 6:
                                onChainContentURI = _e.sent();
                                return [4 /*yield*/, media.fetchMetadataURI(0)];
                            case 7:
                                onChainMetadataURI = _e.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 8:
                                _b.apply(_a, [_e.sent()]);
                                _d = (_c = (0, chai_1.expect)(creator).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 9:
                                _d.apply(_c, [_e.sent()]);
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
                    var media, creator, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _c.sent();
                                return [4 /*yield*/, media.fetchCreator(0)];
                            case 2:
                                creator = _c.sent();
                                _b = (_a = (0, chai_1.expect)(creator).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 3:
                                _b.apply(_a, [_c.sent()]);
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
                    var media, tokenId, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _c.sent();
                                _b = (_a = media).fetchMediaOfOwnerByIndex;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_c.sent(), 0])];
                            case 3:
                                tokenId = _c.sent();
                                (0, chai_1.expect)(parseInt(tokenId._hex)).to.equal(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#setAsk', function () {
                it('Should throw an error if the signer is not approved nor the owner', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var signer1, media, media1, owner, getApproved, _a, _b, _c, _d, _e, _f;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                ask = (0, utils_1.constructAsk)(zapMedia.address, 100);
                                signer1 = signers[1];
                                media = new zapMedia_1.default(1337, signer);
                                media1 = new zapMedia_1.default(1337, signer1);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _g.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 2:
                                owner = _g.sent();
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 3:
                                getApproved = _g.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to.not).equal;
                                return [4 /*yield*/, signer1.getAddress()];
                            case 4:
                                _b.apply(_a, [_g.sent()]);
                                _d = (_c = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 5:
                                _d.apply(_c, [_g.sent()]);
                                _f = (_e = (0, chai_1.expect)(getApproved).to.not).equal;
                                return [4 /*yield*/, signer1.getAddress()];
                            case 6:
                                _f.apply(_e, [_g.sent()]);
                                (0, chai_1.expect)(getApproved).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [4 /*yield*/, media1
                                        .setAsk(0, ask)
                                        .then(function (res) {
                                        console.log(res);
                                    })
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal('Invariant failed: ZapMedia (setAsk): Media: Only approved or owner.');
                                    })];
                            case 7:
                                _g.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should set an ask by the owner', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, owner, _a, _b, getApproved, onChainAsk;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                ask = (0, utils_1.constructAsk)(zapMedia.address, 100);
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _c.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 2:
                                owner = _c.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 3:
                                _b.apply(_a, [_c.sent()]);
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 4:
                                getApproved = _c.sent();
                                (0, chai_1.expect)(getApproved).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [4 /*yield*/, media.setAsk(0, ask)];
                            case 5:
                                _c.sent();
                                return [4 /*yield*/, media.fetchCurrentAsk(zapMedia.address, 0)];
                            case 6:
                                onChainAsk = _c.sent();
                                (0, chai_1.expect)(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
                                (0, chai_1.expect)(onChainAsk.currency).to.equal(zapMedia.address);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should set an ask by the approved', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var signer1, media, media1, _a, _b, owner, _c, _d, getApproved, _e, _f, onChainAsk;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                ask = (0, utils_1.constructAsk)(zapMedia.address, 100);
                                signer1 = signers[1];
                                media = new zapMedia_1.default(1337, signer);
                                media1 = new zapMedia_1.default(1337, signer1);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _g.sent();
                                _b = (_a = media).approve;
                                return [4 /*yield*/, signer1.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_g.sent(), 0])];
                            case 3:
                                _g.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 4:
                                owner = _g.sent();
                                _d = (_c = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 5:
                                _d.apply(_c, [_g.sent()]);
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 6:
                                getApproved = _g.sent();
                                _f = (_e = (0, chai_1.expect)(getApproved).to).equal;
                                return [4 /*yield*/, signer1.getAddress()];
                            case 7:
                                _f.apply(_e, [_g.sent()]);
                                return [4 /*yield*/, media1.setAsk(0, ask)];
                            case 8:
                                _g.sent();
                                return [4 /*yield*/, media.fetchCurrentAsk(zapMedia.address, 0)];
                            case 9:
                                onChainAsk = _g.sent();
                                (0, chai_1.expect)(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
                                (0, chai_1.expect)(onChainAsk.currency).to.equal(zapMedia.address);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#setbid', function () {
                it('creates a new bid on chain', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var zap, signer1, zap1, nullOnChainBid, _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                zap = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, zap.mint(mediaData, bidShares)];
                            case 1:
                                _d.sent();
                                signer1 = provider.getSigner(1);
                                zap1 = new zapMedia_1.default(1337, signer1);
                                _b = (_a = zap1).fetchCurrentBidForBidder;
                                _c = [zapMedia.address, 0];
                                return [4 /*yield*/, signer1.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent()]))];
                            case 3:
                                nullOnChainBid = _d.sent();
                                (0, chai_1.expect)(nullOnChainBid.currency).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [2 /*return*/];
                        }
                    });
                }); });
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
                    var media, owner, _a, _b, getApproved, onChainAsk, onChainAskRemoved;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                ask = (0, utils_1.constructAsk)(zapMedia.address, 100);
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _c.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 2:
                                owner = _c.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 3:
                                _b.apply(_a, [_c.sent()]);
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 4:
                                getApproved = _c.sent();
                                (0, chai_1.expect)(getApproved).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [4 /*yield*/, media.setAsk(0, ask)];
                            case 5:
                                _c.sent();
                                return [4 /*yield*/, media.fetchCurrentAsk(zapMedia.address, 0)];
                            case 6:
                                onChainAsk = _c.sent();
                                (0, chai_1.expect)(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
                                (0, chai_1.expect)(onChainAsk.currency).to.equal(zapMedia.address);
                                return [4 /*yield*/, media.removeAsk(0)];
                            case 7:
                                _c.sent();
                                return [4 /*yield*/, media.fetchCurrentAsk(zapMedia.address, 0)];
                            case 8:
                                onChainAskRemoved = _c.sent();
                                (0, chai_1.expect)(parseInt(onChainAskRemoved.amount.toString())).to.equal(0);
                                (0, chai_1.expect)(onChainAskRemoved.currency).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#revokeApproval', function () {
                it("revokes an addresses approval of another address's media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var signer1, media, _a, _b, approved, _c, _d, media1, revokedStatus;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                signer1 = signers[1];
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _e.sent();
                                _b = (_a = media).approve;
                                return [4 /*yield*/, signer1.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 3:
                                _e.sent();
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 4:
                                approved = _e.sent();
                                _d = (_c = (0, chai_1.expect)(approved).to).equal;
                                return [4 /*yield*/, signer1.getAddress()];
                            case 5:
                                _d.apply(_c, [_e.sent()]);
                                media1 = new zapMedia_1.default(1337, signer1);
                                return [4 /*yield*/, media1.revokeApproval(0)];
                            case 6:
                                _e.sent();
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 7:
                                revokedStatus = _e.sent();
                                (0, chai_1.expect)(revokedStatus).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#burn', function () {
                it('Should burn a token', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, owner, _a, _b, preTotalSupply, postTotalSupply;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _c.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 2:
                                owner = _c.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 3:
                                _b.apply(_a, [_c.sent()]);
                                return [4 /*yield*/, media.fetchTotalMedia()];
                            case 4:
                                preTotalSupply = _c.sent();
                                (0, chai_1.expect)(preTotalSupply.toNumber()).to.equal(1);
                                return [4 /*yield*/, media.burn(0)];
                            case 5:
                                _c.sent();
                                return [4 /*yield*/, media.fetchTotalMedia()];
                            case 6:
                                postTotalSupply = _c.sent();
                                (0, chai_1.expect)(postTotalSupply.toNumber()).to.equal(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#approve', function () {
                it('Should approve another address for a token', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var signer1, media, preApprovedStatus, _a, _b, postApprovedStatus, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                signer1 = signers[1];
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _e.sent();
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 2:
                                preApprovedStatus = _e.sent();
                                (0, chai_1.expect)(preApprovedStatus).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = media).approve;
                                return [4 /*yield*/, signer1.getAddress()];
                            case 3: return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 4:
                                _e.sent();
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 5:
                                postApprovedStatus = _e.sent();
                                _d = (_c = (0, chai_1.expect)(postApprovedStatus).to).equal;
                                return [4 /*yield*/, signer1.getAddress()];
                            case 6:
                                _d.apply(_c, [_e.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#setApprovalForAll', function () {
                it('Should set approval for another address for all tokens owned by owner', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var signer1, media, preApprovalStatus, _a, _b, _c, _d, _e, postApprovalStatus, _f, _g, _h, _j, _k, revoked, _l, _m, _o;
                    return __generator(this, function (_p) {
                        switch (_p.label) {
                            case 0:
                                signer1 = signers[1];
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _p.sent();
                                _b = (_a = media).fetchIsApprovedForAll;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2:
                                _c = [_p.sent()];
                                return [4 /*yield*/, signer1.getAddress()];
                            case 3: return [4 /*yield*/, _b.apply(_a, _c.concat([_p.sent()]))];
                            case 4:
                                preApprovalStatus = _p.sent();
                                (0, chai_1.expect)(preApprovalStatus).to.be.false;
                                _e = (_d = media).setApprovalForAll;
                                return [4 /*yield*/, signer1.getAddress()];
                            case 5: return [4 /*yield*/, _e.apply(_d, [_p.sent(), true])];
                            case 6:
                                _p.sent();
                                _g = (_f = media).fetchIsApprovedForAll;
                                return [4 /*yield*/, signer.getAddress()];
                            case 7:
                                _h = [_p.sent()];
                                return [4 /*yield*/, signer1.getAddress()];
                            case 8: return [4 /*yield*/, _g.apply(_f, _h.concat([_p.sent()]))];
                            case 9:
                                postApprovalStatus = _p.sent();
                                (0, chai_1.expect)(postApprovalStatus).to.be.true;
                                _k = (_j = media).setApprovalForAll;
                                return [4 /*yield*/, signer1.getAddress()];
                            case 10: return [4 /*yield*/, _k.apply(_j, [_p.sent(), false])];
                            case 11:
                                _p.sent();
                                _m = (_l = media).fetchIsApprovedForAll;
                                return [4 /*yield*/, signer.getAddress()];
                            case 12:
                                _o = [_p.sent()];
                                return [4 /*yield*/, signer1.getAddress()];
                            case 13: return [4 /*yield*/, _m.apply(_l, _o.concat([_p.sent()]))];
                            case 14:
                                revoked = _p.sent();
                                (0, chai_1.expect)(revoked).to.be.false;
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#transferFrom', function () {
                it('Should transfer token to another address', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var recipient, media, owner, _a, _b, newOwner;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, signers[1].getAddress()];
                            case 1:
                                recipient = _c.sent();
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 2:
                                _c.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 3:
                                owner = _c.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 4:
                                _b.apply(_a, [_c.sent()]);
                                return [4 /*yield*/, media.transferFrom(owner, recipient, 0)];
                            case 5:
                                _c.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 6:
                                newOwner = _c.sent();
                                (0, chai_1.expect)(newOwner).to.equal(recipient);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('#safeTransferFrom', function () {
                it('Should revert if the tokenId does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var recipient, media, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, signers[1].getAddress()];
                            case 1:
                                recipient = _c.sent();
                                media = new zapMedia_1.default(1337, signer);
                                _b = (_a = media)
                                    .safeTransferFrom;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_c.sent(), recipient, 0])
                                    .then(function (res) {
                                    console.log(res);
                                })
                                    .catch(function (err) {
                                    (0, chai_1.expect)(err.message).to.equal('Invariant failed: ZapMedia (safeTransferFrom): TokenId does not exist.');
                                })];
                            case 3:
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should revert if the (from) is a zero address', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var recipient, media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, signers[1].getAddress()];
                            case 1:
                                recipient = _a.sent();
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, media
                                        .safeTransferFrom(ethers_1.ethers.constants.AddressZero, recipient, 0)
                                        .then(function (res) {
                                        console.log(res);
                                    })
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal('Invariant failed: ZapMedia (safeTransferFrom): The (from) address cannot be a zero address.');
                                    })];
                            case 3:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should revert if the (to) is a zero address', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _c.sent();
                                _b = (_a = media)
                                    .safeTransferFrom;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_c.sent(), ethers_1.ethers.constants.AddressZero, 0])
                                    .then(function (res) {
                                    console.log(res);
                                })
                                    .catch(function (err) {
                                    (0, chai_1.expect)(err.message).to.equal('Invariant failed: ZapMedia (safeTransferFrom): The (to) address cannot be a zero address.');
                                })];
                            case 3:
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('Should safe transfer a token to an address', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var recipient, media, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, signers[1].getAddress()];
                            case 1:
                                recipient = _c.sent();
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 2:
                                _c.sent();
                                _b = (_a = media).safeTransferFrom;
                                return [4 /*yield*/, signer.getAddress()];
                            case 3: return [4 /*yield*/, _b.apply(_a, [_c.sent(), recipient, 0])];
                            case 4:
                                _c.sent();
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
        });
    });
});
//# sourceMappingURL=zapMedia.test.js.map