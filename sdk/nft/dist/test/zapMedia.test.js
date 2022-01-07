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
var utils_1 = require("../utils");
var zapMedia_1 = __importDefault(require("../zapMedia"));
var addresses_1 = require("../addresses");
var contracts = require('../deploy.js');
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
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    signer = provider.getSigner(0);
                    return [4 /*yield*/, contracts.deployZapToken()];
                case 1:
                    token = _a.sent();
                    return [4 /*yield*/, contracts.deployZapVault()];
                case 2:
                    zapVault = _a.sent();
                    return [4 /*yield*/, contracts.deployZapMarket()];
                case 3:
                    zapMarket = _a.sent();
                    return [4 /*yield*/, contracts.deployZapMediaImpl()];
                case 4:
                    zapMediaImpl = _a.sent();
                    return [4 /*yield*/, contracts.deployMediaFactory()];
                case 5:
                    mediaFactory = _a.sent();
                    return [4 /*yield*/, contracts.deployZapMedia()];
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
    describe('contract Functions', function () {
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
                            ask = (0, utils_1.constructAsk)(token.address, 100);
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
                    var media, preTotalSupply, owner, onChainBidShares, onChainContentURI, onChainMetadataURI, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.fetchTotalMedia()];
                            case 1:
                                preTotalSupply = (_c.sent()).toNumber();
                                (0, chai_1.expect)(preTotalSupply).to.equal(0);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 2:
                                _c.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 3:
                                owner = _c.sent();
                                return [4 /*yield*/, media.fetchCurrentBidShares(zapMedia.address, 0)];
                            case 4:
                                onChainBidShares = _c.sent();
                                return [4 /*yield*/, media.fetchContentURI(0)];
                            case 5:
                                onChainContentURI = _c.sent();
                                return [4 /*yield*/, media.fetchMetadataURI(0)];
                            case 6:
                                onChainMetadataURI = _c.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 7:
                                _b.apply(_a, [_c.sent()]);
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
            describe.only('#setAsk', function () {
                it('sets an ask for a piece of media', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, onChainAsk;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.setAsk(0, ask)];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, media.fetchCurrentAsk(zapMedia.address, 0)];
                            case 3:
                                onChainAsk = _a.sent();
                                console.log(onChainAsk);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        });
    });
});
//# sourceMappingURL=zapMedia.test.js.map