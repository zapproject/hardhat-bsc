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
var utils_1 = require("ethers/lib/utils");
var utils_2 = require("../src/utils");
var zapMedia_1 = __importDefault(require("../src/zapMedia"));
var mediaFactory_1 = __importDefault(require("../src/mediaFactory"));
var addresses_1 = require("../src/contract/addresses");
var deploy_1 = require("../src/deploy");
var test_utils_1 = require("./test_utils");
var provider = new ethers_1.ethers.providers.JsonRpcProvider("http://localhost:8545");
describe("ZapMedia", function () {
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
    var eipSig;
    var address;
    var sig;
    var fetchMediaByIndex;
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
                    addresses_1.zapMarketAddresses["1337"] = zapMarket.address;
                    addresses_1.mediaFactoryAddresses["1337"] = mediaFactory.address;
                    addresses_1.zapMediaAddresses["1337"] = zapMedia.address;
                    return [2 /*return*/];
            }
        });
    }); });
    describe("#constructor", function () {
        it("Should throw an error if the networkId is invalid", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, chai_1.expect)(function () {
                    new zapMedia_1.default(300, signer);
                }).to.throw("Constructor: Network Id is not supported.");
                return [2 /*return*/];
            });
        }); });
    });
    describe("Contract Functions", function () {
        describe("View Functions", function () {
            var tokenURI = "https://bafkreievpmtbofalpowrcbr5oaok33e6xivii62r6fxh6fontaglngme2m.ipfs.dweb.link/";
            var metadataURI = "https://bafkreihhu7xo7knc3vn42jj26gz3jkvh3uu3rwurkb4djsoo5ayqs2s25a.ipfs.dweb.link/";
            beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
                var metadataHex, metadataHashRaw, metadataHashBytes, contentHex, contentHashRaw, contentHashBytes, contentHash, metadataHash, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            metadataHex = ethers_1.ethers.utils.formatBytes32String("Test");
                            metadataHashRaw = ethers_1.ethers.utils.keccak256(metadataHex);
                            metadataHashBytes = ethers_1.ethers.utils.arrayify(metadataHashRaw);
                            contentHex = ethers_1.ethers.utils.formatBytes32String("Test Car");
                            contentHashRaw = ethers_1.ethers.utils.keccak256(contentHex);
                            contentHashBytes = ethers_1.ethers.utils.arrayify(contentHashRaw);
                            contentHash = contentHashBytes;
                            metadataHash = metadataHashBytes;
                            mediaData = (0, utils_2.constructMediaData)(tokenURI, metadataURI, contentHash, metadataHash);
                            _a = utils_2.constructBidShares;
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
                            eipSig = {
                                deadline: 1000,
                                v: 0,
                                r: "0x00",
                                s: "0x00",
                            };
                            return [2 /*return*/];
                    }
                });
            }); });
            describe.only("#fetchBalanceOf", function () {
                it("Should fetch the balance through a custom collection", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var mediaFactory, deploy, zapCollection, tx, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                mediaFactory = new mediaFactory_1.default(1337, signer);
                                return [4 /*yield*/, mediaFactory.deployMedia("Testing", "Test", true, "www.example.com")];
                            case 1:
                                deploy = _c.sent();
                                zapCollection = new zapMedia_1.default(1337, signer);
                                _b = (_a = zapCollection).fetchBalanceOf;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_c.sent(), 0])];
                            case 3:
                                tx = _c.sent();
                                console.log(tx);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("test fetchContentHash, fetchMetadataHash, fetchPermitNonce", function () {
                it("Should be able to fetch contentHash", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                it("Should be able to fetch metadataHash", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                it("Should be able to fetch permitNonce", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var otherWallet, account9, zap_media, zapMedia1, deadline, domain, nonce, eipSig, firstApprovedAddr, nonce2, account8, secondApprovedAddr, nonce3, tokenThatDoesntExist, nonceForTokenThatDoesntExist;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                otherWallet = new ethers_1.ethers.Wallet("0x043192f7a8fb472d04ef7bb0ba1fbb3667198253cc8046e9e56626b804966cb3");
                                account9 = new ethers_1.ethers.Wallet("0x915c40257f694fef7d8058fe4db4ba53f1343b592a8175ea18e7ece20d2987d7");
                                zap_media = new zapMedia_1.default(1337, signer);
                                zapMedia1 = new zapMedia_1.default(1337, signers[1]);
                                // mint a token by zapMedia1 in preparation to give permit to accounts 9 and 8
                                return [4 /*yield*/, zapMedia1.mint(mediaData, bidShares)];
                            case 1:
                                // mint a token by zapMedia1 in preparation to give permit to accounts 9 and 8
                                _a.sent();
                                deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                                domain = zap_media.eip712Domain();
                                return [4 /*yield*/, zap_media.fetchPermitNonce(otherWallet.address, 0)];
                            case 2: return [4 /*yield*/, (_a.sent()).toNumber()];
                            case 3:
                                nonce = _a.sent();
                                return [4 /*yield*/, (0, test_utils_1.signPermitMessage)(otherWallet, account9.address, 0, nonce, deadline, domain)];
                            case 4:
                                eipSig = _a.sent();
                                // permit account9 == give approval to account 9 for tokenId 0.
                                return [4 /*yield*/, zapMedia1.permit(account9.address, 0, eipSig)];
                            case 5:
                                // permit account9 == give approval to account 9 for tokenId 0.
                                _a.sent();
                                return [4 /*yield*/, zapMedia1.fetchApproved(0)];
                            case 6:
                                firstApprovedAddr = _a.sent();
                                (0, chai_1.expect)(firstApprovedAddr.toLowerCase()).to.equal(account9.address.toLowerCase());
                                return [4 /*yield*/, zap_media.fetchPermitNonce(otherWallet.address, 0)];
                            case 7: return [4 /*yield*/, (_a.sent()).toNumber()];
                            case 8:
                                nonce2 = _a.sent();
                                (0, chai_1.expect)(nonce2).to.equal(nonce + 1);
                                account8 = new ethers_1.ethers.Wallet("0x81c92fdc4c4703cb0da2af8ceae63160426425935f3bb701edd53ffa5c227417");
                                return [4 /*yield*/, (0, test_utils_1.signPermitMessage)(otherWallet, account8.address, 0, nonce2, deadline, domain)];
                            case 9:
                                eipSig = _a.sent();
                                return [4 /*yield*/, zapMedia1.permit(account8.address, 0, eipSig)];
                            case 10:
                                _a.sent();
                                return [4 /*yield*/, zapMedia1.fetchApproved(0)];
                            case 11:
                                secondApprovedAddr = _a.sent();
                                (0, chai_1.expect)(secondApprovedAddr.toLowerCase()).to.equal(account8.address.toLowerCase());
                                return [4 /*yield*/, zap_media.fetchPermitNonce(otherWallet.address, 0)];
                            case 12: return [4 /*yield*/, (_a.sent()).toNumber()];
                            case 13:
                                nonce3 = _a.sent();
                                (0, chai_1.expect)(nonce3).to.equal(nonce2 + 1);
                                tokenThatDoesntExist = 38;
                                return [4 /*yield*/, zap_media.fetchPermitNonce(otherWallet.address, tokenThatDoesntExist)];
                            case 14: return [4 /*yield*/, (_a.sent()).toNumber()];
                            case 15:
                                nonceForTokenThatDoesntExist = _a.sent();
                                (0, chai_1.expect)(nonceForTokenThatDoesntExist).to.equal(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        });
        describe("Write Functions", function () {
            var tokenURI = "https://bafkreievpmtbofalpowrcbr5oaok33e6xivii62r6fxh6fontaglngme2m.ipfs.dweb.link/";
            var metadataURI = "https://bafkreihhu7xo7knc3vn42jj26gz3jkvh3uu3rwurkb4djsoo5ayqs2s25a.ipfs.dweb.link/";
            beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
                var metadataHex, metadataHashRaw, metadataHashBytes, contentHex, contentHashRaw, contentHashBytes, contentHash, metadataHash, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            metadataHex = ethers_1.ethers.utils.formatBytes32String("Test");
                            metadataHashRaw = ethers_1.ethers.utils.keccak256(metadataHex);
                            metadataHashBytes = ethers_1.ethers.utils.arrayify(metadataHashRaw);
                            contentHex = ethers_1.ethers.utils.formatBytes32String("Test Car");
                            contentHashRaw = ethers_1.ethers.utils.keccak256(contentHex);
                            contentHashBytes = ethers_1.ethers.utils.arrayify(contentHashRaw);
                            contentHash = contentHashBytes;
                            metadataHash = metadataHashBytes;
                            mediaData = (0, utils_2.constructMediaData)(tokenURI, metadataURI, contentHash, metadataHash);
                            _a = utils_2.constructBidShares;
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
            describe("#updateContentURI", function () {
                it("Should thrown an error if the tokenURI does not begin with `https://`", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                mediaData.tokenURI = "http://example.com";
                                return [4 /*yield*/, media.mint(mediaData, bidShares).catch(function (err) {
                                        (0, chai_1.expect)(err).to.equal("Invariant failed: http://example.com must begin with `https://`");
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should throw an error if the updateContentURI tokenId does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.updateContentURI(0, "www.newURI.com").catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (updateContentURI): TokenId does not exist.");
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should throw an error if the fetchContentURI tokenId does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.fetchContentURI(0).catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (fetchContentURI): TokenId does not exist.");
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should update the content uri", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                return [4 /*yield*/, media.updateContentURI(0, "https://newURI.com")];
                            case 3:
                                // Updates tokenId 0's tokenURI
                                _a.sent();
                                return [4 /*yield*/, media.fetchContentURI(0)];
                            case 4:
                                fetchNewURI = _a.sent();
                                // The new tokenURI returned should equal the updatedURI
                                (0, chai_1.expect)(fetchNewURI).to.equal("https://newURI.com");
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#updateMetadataURI", function () {
                it("Should thrown an error if the metadataURI does not begin with `https://`", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                mediaData.metadataURI = "http://example.com";
                                return [4 /*yield*/, media.mint(mediaData, bidShares).catch(function (err) {
                                        (0, chai_1.expect)(err).to.equal("Invariant failed: http://example.com must begin with `https://`");
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should update the metadata uri", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                return [4 /*yield*/, media.updateMetadataURI(0, "https://newMetadataURI.com")];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, media.fetchMetadataURI(0)];
                            case 4:
                                newMetadataURI = _a.sent();
                                (0, chai_1.expect)(newMetadataURI).to.equal("https://newMetadataURI.com");
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#mint", function () {
                it("throws an error if bid shares do not sum to 100", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                bidShareSum +=
                                    parseInt(bidShares.creator.value) +
                                        parseInt(bidShares.owner.value) +
                                        5e18;
                                return [4 /*yield*/, media.mint(mediaData, bidShares).catch(function (err) {
                                        (0, chai_1.expect)(err).to.equal("Invariant failed: The BidShares sum to ".concat(bidShareSum, ", but they must sum to 100000000000000000000"));
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should be able to mint", function () { return __awaiter(void 0, void 0, void 0, function () {
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
            describe("#mintWithSig", function () {
                it("throws an error if bid shares do not sum to 100", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var bidShareSum, media, i, otherWallet;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                bidShareSum = 0;
                                media = new zapMedia_1.default(1337, signer);
                                bidShares.creator.value = bidShares.creator.value.add(BigInt(1e18));
                                for (i = 0; i < bidShares.collabShares.length; i++) {
                                    bidShareSum += parseInt(bidShares.collabShares[i]);
                                }
                                bidShareSum +=
                                    parseInt(bidShares.creator.value) +
                                        parseInt(bidShares.owner.value) +
                                        5e18;
                                otherWallet = new ethers_1.ethers.Wallet("0x7a8c4ab64eaec15cab192c8e3bae1414de871a34c470c1c05a0f3541770686d9");
                                return [4 /*yield*/, media
                                        .mintWithSig(otherWallet.address, mediaData, bidShares, eipSig)
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err).to.eq("Invariant failed: The BidShares sum to ".concat(bidShareSum, ", but they must sum to 100000000000000000000"));
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("throws an error if the tokenURI does not begin with `https://`", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var otherWallet, media, metadataHex, metadataHashRaw, metadataHashBytes, contentHex, contentHashRaw, contentHashBytes, invalidMediaData;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                otherWallet = new ethers_1.ethers.Wallet("0x7a8c4ab64eaec15cab192c8e3bae1414de871a34c470c1c05a0f3541770686d9");
                                media = new zapMedia_1.default(1337, signer);
                                metadataHex = ethers_1.ethers.utils.formatBytes32String("Test");
                                metadataHashRaw = ethers_1.ethers.utils.keccak256(metadataHex);
                                metadataHashBytes = ethers_1.ethers.utils.arrayify(metadataHashRaw);
                                contentHex = ethers_1.ethers.utils.formatBytes32String("Test Car");
                                contentHashRaw = ethers_1.ethers.utils.keccak256(contentHex);
                                contentHashBytes = ethers_1.ethers.utils.arrayify(contentHashRaw);
                                invalidMediaData = {
                                    tokenURI: "http://example.com",
                                    metadataURI: "https://metadata.com",
                                    contentHash: contentHashBytes,
                                    metadataHash: metadataHashBytes,
                                };
                                return [4 /*yield*/, media
                                        .mintWithSig(otherWallet.address, invalidMediaData, bidShares, eipSig)
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err).to.eq("Invariant failed: http://example.com must begin with `https://`");
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("throws an error if the metadataURI does not begin with `https://`", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var otherWallet, media, invalidMediaData;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                otherWallet = new ethers_1.ethers.Wallet("0x7a8c4ab64eaec15cab192c8e3bae1414de871a34c470c1c05a0f3541770686d9");
                                media = new zapMedia_1.default(1337, signer);
                                invalidMediaData = {
                                    tokenURI: "https://example.com",
                                    metadataURI: "http://metadata.com",
                                    contentHash: mediaData.contentHash,
                                    metadataHash: mediaData.metadataHash,
                                };
                                return [4 /*yield*/, media
                                        .mintWithSig(otherWallet.address, invalidMediaData, bidShares, eipSig)
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err).to.eq("Invariant failed: http://metadata.com must begin with `https://`");
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("creates a new piece of media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var mainWallet, media, deadline, domain, nonce, media1ContentHash, media1MetadataHash, eipSig, totalSupply, owner, creator, onChainContentHash, onChainMetadataHash, mediaContentHash, mediaMetadataHash, onChainBidShares, onChainContentURI, onChainMetadataURI;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                mainWallet = new ethers_1.ethers.Wallet("0xb91c5477014656c1da52b3d4b6c03b59019c9a3b5730e61391cec269bc2e03e3");
                                media = new zapMedia_1.default(1337, signer);
                                deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                                domain = media.eip712Domain();
                                return [4 /*yield*/, media.fetchMintWithSigNonce(mainWallet.address)];
                            case 1:
                                nonce = _a.sent();
                                media1ContentHash = ethers_1.ethers.utils.hexlify(mediaData.contentHash);
                                media1MetadataHash = ethers_1.ethers.utils.hexlify(mediaData.metadataHash);
                                return [4 /*yield*/, (0, test_utils_1.signMintWithSigMessage)(mainWallet, media1ContentHash, media1MetadataHash, utils_2.Decimal.new(15).value, nonce.toNumber(), deadline, domain)];
                            case 2:
                                eipSig = _a.sent();
                                return [4 /*yield*/, media.fetchTotalMedia()];
                            case 3:
                                totalSupply = _a.sent();
                                (0, chai_1.expect)(totalSupply.toNumber()).to.eq(0);
                                return [4 /*yield*/, media.mintWithSig(mainWallet.address, mediaData, bidShares, eipSig)];
                            case 4:
                                _a.sent();
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 5:
                                owner = _a.sent();
                                return [4 /*yield*/, media.fetchCreator(0)];
                            case 6:
                                creator = _a.sent();
                                return [4 /*yield*/, media.fetchContentHash(0)];
                            case 7:
                                onChainContentHash = _a.sent();
                                return [4 /*yield*/, media.fetchMetadataHash(0)];
                            case 8:
                                onChainMetadataHash = _a.sent();
                                mediaContentHash = ethers_1.ethers.utils.hexlify(mediaData.contentHash);
                                mediaMetadataHash = ethers_1.ethers.utils.hexlify(mediaData.metadataHash);
                                return [4 /*yield*/, media.fetchCurrentBidShares(zapMedia.address, 0)];
                            case 9:
                                onChainBidShares = _a.sent();
                                return [4 /*yield*/, media.fetchContentURI(0)];
                            case 10:
                                onChainContentURI = _a.sent();
                                return [4 /*yield*/, media.fetchMetadataURI(0)];
                            case 11:
                                onChainMetadataURI = _a.sent();
                                (0, chai_1.expect)(owner.toLowerCase()).to.eq(mainWallet.address.toLowerCase());
                                (0, chai_1.expect)(creator.toLowerCase()).to.eq(mainWallet.address.toLowerCase());
                                (0, chai_1.expect)(onChainContentHash).to.eq(mediaContentHash);
                                (0, chai_1.expect)(onChainContentURI).to.eq(mediaData.tokenURI);
                                (0, chai_1.expect)(onChainMetadataURI).to.eq(mediaData.metadataURI);
                                (0, chai_1.expect)(onChainMetadataHash).to.eq(mediaMetadataHash);
                                (0, chai_1.expect)(parseInt(onChainBidShares.creator.value)).to.eq(parseInt(bidShares.creator.value));
                                (0, chai_1.expect)(parseInt(onChainBidShares.owner.value)).to.eq(parseInt(bidShares.owner.value));
                                (0, chai_1.expect)(onChainBidShares.collabShares).to.eql(bidShares.collabShares);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#getTokenCreators", function () {
                it("Should throw an error if the tokenId does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.fetchCreator(0).catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (fetchCreator): TokenId does not exist.");
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should return the token creator", function () { return __awaiter(void 0, void 0, void 0, function () {
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
            describe("#tokenOfOwnerByIndex", function () {
                it("Should throw an error if the (owner) is a zero address", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (fetchMediaOfOwnerByIndex): The (owner) address cannot be a zero address.");
                                    })];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should return the token of the owner by index", function () { return __awaiter(void 0, void 0, void 0, function () {
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
            describe("#setAsk", function () {
                it("Should throw an error if the signer is not approved nor the owner", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var signer1, media, media1, owner, getApproved, _a, _b, _c, _d, _e, _f;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(zapMedia.address, 100);
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
                                return [4 /*yield*/, media1.setAsk(0, ask).catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (setAsk): Media: Only approved or owner.");
                                    })];
                            case 7:
                                _g.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should set an ask by the owner", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, owner, _a, _b, getApproved, onChainAsk;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(zapMedia.address, 100);
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
                it("Should set an ask by the approved", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var signer1, media, media1, _a, _b, owner, _c, _d, getApproved, _e, _f, onChainAsk;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(zapMedia.address, 100);
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
            describe("#setbid", function () {
                var bidder;
                var bid;
                var ownerConnected;
                var bidderConnected;
                beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                bidder = signers[1];
                                _a = utils_2.constructBid;
                                _b = [token.address,
                                    200];
                                return [4 /*yield*/, bidder.getAddress()];
                            case 1:
                                _b = _b.concat([_e.sent()]);
                                return [4 /*yield*/, bidder.getAddress()];
                            case 2:
                                bid = _a.apply(void 0, _b.concat([_e.sent(), 10]));
                                // The owner(signer[0]) is connected to the ZapMedia class as a signer
                                ownerConnected = new zapMedia_1.default(1337, signer);
                                // The bidder(signer[1]) is connected to the ZapMedia class as a signer
                                bidderConnected = new zapMedia_1.default(1337, bidder);
                                // Mint a token
                                return [4 /*yield*/, ownerConnected.mint(mediaData, bidShares)];
                            case 3:
                                // Mint a token
                                _e.sent();
                                _d = (_c = token).mint;
                                return [4 /*yield*/, bidder.getAddress()];
                            case 4: 
                            // Transfer tokens to the bidder
                            return [4 /*yield*/, _d.apply(_c, [_e.sent(), 1000])];
                            case 5:
                                // Transfer tokens to the bidder
                                _e.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the token id does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            // The bidder approves zapMarket to receive the bid amount before setting the bid
                            return [4 /*yield*/, token.connect(bidder).approve(zapMarket.address, bid.amount)];
                            case 1:
                                // The bidder approves zapMarket to receive the bid amount before setting the bid
                                _a.sent();
                                // The bidder(signers[1]) attempts to setBid on a non existent token
                                return [4 /*yield*/, bidderConnected.setBid(300, bid).catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (setBid): TokenId does not exist.");
                                    })];
                            case 2:
                                // The bidder(signers[1]) attempts to setBid on a non existent token
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the bid currency is a zero address", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            // The bidder approves zapMarket to receive the bid amount before setting the bid
                            return [4 /*yield*/, token.connect(bidder).approve(zapMarket.address, bid.amount)];
                            case 1:
                                // The bidder approves zapMarket to receive the bid amount before setting the bid
                                _a.sent();
                                // Sets the bid currency to a zero address
                                bid.currency = ethers_1.ethers.constants.AddressZero;
                                // The bidder attempts to set a bid with the currenc as a zero address
                                return [4 /*yield*/, bidderConnected.setBid(0, bid).catch(function (err) {
                                        "Invariant failed: ZapMedia (setBid): Currency cannot be a zero address.";
                                    })];
                            case 2:
                                // The bidder attempts to set a bid with the currenc as a zero address
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the bid recipient is a zero address", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            // The bidder approves zapMarket to receive the bid amount before setting the bid
                            return [4 /*yield*/, token.connect(bidder).approve(zapMarket.address, bid.amount)];
                            case 1:
                                // The bidder approves zapMarket to receive the bid amount before setting the bid
                                _a.sent();
                                // Sets the bid recipient to a zero address
                                bid.recipient = ethers_1.ethers.constants.AddressZero;
                                // The bidder attempts to set a bid with the recipient as a zero address
                                return [4 /*yield*/, bidderConnected.setBid(0, bid).catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (setBid): Recipient cannot be a zero address.");
                                    })];
                            case 2:
                                // The bidder attempts to set a bid with the recipient as a zero address
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the bid amount is zero", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            // The bidder approves zapMarket to receive the bid amount before setting the bid
                            return [4 /*yield*/, token.connect(bidder).approve(zapMarket.address, bid.amount)];
                            case 1:
                                // The bidder approves zapMarket to receive the bid amount before setting the bid
                                _a.sent();
                                // Sets the bid amount to zero
                                bid.amount = 0;
                                // The bidder attempts to set a bid with zero tokens
                                return [4 /*yield*/, bidderConnected.setBid(0, bid).catch(function (err) {
                                        (0, chai_1.expect)("Invariant failed: ZapMedia (setBid): Amount cannot be zero.");
                                    })];
                            case 2:
                                // The bidder attempts to set a bid with zero tokens
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should set a bid", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var bidderPreBal, _a, _b, nullOnChainBid, _c, _d, _e, bidderPostBal, _f, _g, onChainBid, _h, _j, _k;
                    return __generator(this, function (_l) {
                        switch (_l.label) {
                            case 0:
                                _b = (_a = token).balanceOf;
                                return [4 /*yield*/, bidder.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_l.sent()])];
                            case 2:
                                bidderPreBal = _l.sent();
                                _d = (_c = ownerConnected).fetchCurrentBidForBidder;
                                _e = [zapMedia.address,
                                    0];
                                return [4 /*yield*/, bidder.getAddress()];
                            case 3: return [4 /*yield*/, _d.apply(_c, _e.concat([_l.sent()]))];
                            case 4:
                                nullOnChainBid = _l.sent();
                                // The bidder approves zapMarket to receive the bid amount before setting the bid
                                return [4 /*yield*/, token.connect(bidder).approve(zapMarket.address, bid.amount)];
                            case 5:
                                // The bidder approves zapMarket to receive the bid amount before setting the bid
                                _l.sent();
                                // The bidder balance should equal the 1000 before setting the bid
                                (0, chai_1.expect)(parseInt(bidderPreBal._hex)).to.equal(1000);
                                // The returned currency should equal a zero address before setting the bed
                                (0, chai_1.expect)(nullOnChainBid.currency).to.equal(ethers_1.ethers.constants.AddressZero);
                                // The bidder(signers[1]) sets their bid
                                // The bid amount is then transferred to the ZapMarket balance
                                // The bid amount is then withdrawn from the their balance
                                return [4 /*yield*/, bidderConnected.setBid(0, bid)];
                            case 6:
                                // The bidder(signers[1]) sets their bid
                                // The bid amount is then transferred to the ZapMarket balance
                                // The bid amount is then withdrawn from the their balance
                                _l.sent();
                                _g = (_f = token).balanceOf;
                                return [4 /*yield*/, bidder.getAddress()];
                            case 7: return [4 /*yield*/, _g.apply(_f, [_l.sent()])];
                            case 8:
                                bidderPostBal = _l.sent();
                                // The bidder balance after setting a bid should be 200 less than the start balance
                                (0, chai_1.expect)(parseInt(bidderPostBal._hex)).equal(parseInt(bidderPreBal._hex) - 200);
                                _j = (_h = ownerConnected).fetchCurrentBidForBidder;
                                _k = [zapMedia.address,
                                    0];
                                return [4 /*yield*/, bidder.getAddress()];
                            case 9: return [4 /*yield*/, _j.apply(_h, _k.concat([_l.sent()]))];
                            case 10:
                                onChainBid = _l.sent();
                                // The returned bid amount should equal the bid amount confifured in the setBid function
                                (0, chai_1.expect)(parseFloat((0, utils_1.formatUnits)(onChainBid.amount, "wei"))).to.equal(parseFloat((0, utils_1.formatUnits)(bid.amount, "wei")));
                                // The returned bid currency should equal the bid currency configured on setBid
                                (0, chai_1.expect)(onChainBid.currency.toLowerCase()).to.equal(bid.currency.toLowerCase());
                                // The returned bidder should equal the bidder configured on setBid
                                (0, chai_1.expect)(onChainBid.bidder.toLowerCase()).to.equal(bid.bidder.toLowerCase());
                                // The returned recipient should equal the recipient configured on setBid
                                (0, chai_1.expect)(onChainBid.recipient.toLowerCase()).to.equal(bid.recipient.toLowerCase());
                                // The returned sellOnShare should equal the sellOnShare configured on setBid
                                (0, chai_1.expect)(onChainBid.sellOnShare.value._hex).to.equal(bid.sellOnShare.value._hex);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should refund the original bid if the bidder bids again", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var bidderPreBal, _a, _b, marketPretBal, bidderPostBal1, _c, _d, marketPostBal1, marketPostBal2, bidderPostBal, _e, _f;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0: 
                            // The bidder approves zapMarket to receive the bid amount before setting the bid
                            return [4 /*yield*/, token.connect(bidder).approve(zapMarket.address, 1000)];
                            case 1:
                                // The bidder approves zapMarket to receive the bid amount before setting the bid
                                _g.sent();
                                _b = (_a = token).balanceOf;
                                return [4 /*yield*/, bidder.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_g.sent()])];
                            case 3:
                                bidderPreBal = _g.sent();
                                (0, chai_1.expect)(parseInt(bidderPreBal)).to.equal(1000);
                                return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 4:
                                marketPretBal = _g.sent();
                                (0, chai_1.expect)(parseInt(marketPretBal)).to.equal(0);
                                // The bidders first bid
                                return [4 /*yield*/, bidderConnected.setBid(0, bid)];
                            case 5:
                                // The bidders first bid
                                _g.sent();
                                _d = (_c = token).balanceOf;
                                return [4 /*yield*/, bidder.getAddress()];
                            case 6: return [4 /*yield*/, _d.apply(_c, [_g.sent()])];
                            case 7:
                                bidderPostBal1 = _g.sent();
                                // The bidder balance after placing should be 200 less
                                (0, chai_1.expect)(parseInt(bidderPostBal1._hex)).to.equal(800);
                                return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 8:
                                marketPostBal1 = _g.sent();
                                // The ZapMarket balance should equal the first bid amount after the bidder places a bid
                                (0, chai_1.expect)(parseInt(marketPostBal1._hex)).to.equal(200);
                                // Set the bid amount to 200
                                bid.amount = 400;
                                // The bidders second bid
                                return [4 /*yield*/, bidderConnected.setBid(0, bid)];
                            case 9:
                                // The bidders second bid
                                _g.sent();
                                return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 10:
                                marketPostBal2 = _g.sent();
                                // The ZapMarket balance should equal the second bid amount after the bidder places their second bid
                                (0, chai_1.expect)(parseInt(marketPostBal2._hex)).to.equal(400);
                                _f = (_e = token).balanceOf;
                                return [4 /*yield*/, bidder.getAddress()];
                            case 11: return [4 /*yield*/, _f.apply(_e, [_g.sent()])];
                            case 12:
                                bidderPostBal = _g.sent();
                                (0, chai_1.expect)(parseInt(bidderPostBal._hex)).to.equal(600);
                                return [2 /*return*/];
                        }
                    });
                }); });
                describe("#bidForTokenBidder", function () {
                    it("Should reject if the media contract is a zero address", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, _b, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _b = (_a = ownerConnected)
                                        .fetchCurrentBidForBidder;
                                    _c = [ethers_1.ethers.constants.AddressZero,
                                        0];
                                    return [4 /*yield*/, bidder.getAddress()];
                                case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent()]))
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (fetchCurrentBidForBidder): The (media contract) address cannot be a zero address.");
                                    })];
                                case 2:
                                    _d.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it("Should reject if the token id does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, _b, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _b = (_a = ownerConnected)
                                        .fetchCurrentBidForBidder;
                                    _c = [zapMedia.address,
                                        10];
                                    return [4 /*yield*/, bidder.getAddress()];
                                case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent()]))
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (fetchOwnerOf): The token id does not exist.");
                                    })];
                                case 2:
                                    _d.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it("Should reject if the bidder is a zero address", function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: 
                                // Add an assertion by expecting the function to throw the invariant with a bidder as the zero address
                                return [4 /*yield*/, ownerConnected
                                        .fetchCurrentBidForBidder(zapMedia.address, 0, ethers_1.ethers.constants.AddressZero)
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (fetchCurrentBidForBidder): The (bidder) address cannot be a zero address.");
                                    })];
                                case 1:
                                    // Add an assertion by expecting the function to throw the invariant with a bidder as the zero address
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                });
            });
            describe("#removeAsk", function () {
                var media;
                beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
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
                it("Should throw an error if the removeAsk tokenId does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(zapMedia.address, 100);
                                return [4 /*yield*/, media.removeAsk(1).catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (removeAsk): TokenId does not exist.");
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should throw an error if the tokenId exists but an ask was not set", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, media.removeAsk(0).catch(function (err) {
                                    (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (removeAsk): Ask was never set.");
                                })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should remove an ask", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var owner, _a, _b, getApproved, onChainAsk, onChainAskRemoved;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(zapMedia.address, 100);
                                return [4 /*yield*/, media.fetchOwnerOf(0)];
                            case 1:
                                owner = _c.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2:
                                _b.apply(_a, [_c.sent()]);
                                return [4 /*yield*/, media.fetchApproved(0)];
                            case 3:
                                getApproved = _c.sent();
                                (0, chai_1.expect)(getApproved).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [4 /*yield*/, media.setAsk(0, ask)];
                            case 4:
                                _c.sent();
                                return [4 /*yield*/, media.fetchCurrentAsk(zapMedia.address, 0)];
                            case 5:
                                onChainAsk = _c.sent();
                                (0, chai_1.expect)(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
                                (0, chai_1.expect)(onChainAsk.currency).to.equal(zapMedia.address);
                                return [4 /*yield*/, media.removeAsk(0)];
                            case 6:
                                _c.sent();
                                return [4 /*yield*/, media.fetchCurrentAsk(zapMedia.address, 0)];
                            case 7:
                                onChainAskRemoved = _c.sent();
                                (0, chai_1.expect)(parseInt(onChainAskRemoved.amount.toString())).to.equal(0);
                                (0, chai_1.expect)(onChainAskRemoved.currency).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#revokeApproval", function () {
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
            describe("#burn", function () {
                it("Should burn a token", function () { return __awaiter(void 0, void 0, void 0, function () {
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
            describe("#approve", function () {
                it("Should approve another address for a token", function () { return __awaiter(void 0, void 0, void 0, function () {
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
            describe("#setApprovalForAll", function () {
                it("Should set approval for another address for all tokens owned by owner", function () { return __awaiter(void 0, void 0, void 0, function () {
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
            describe("#transferFrom", function () {
                it("Should transfer token to another address", function () { return __awaiter(void 0, void 0, void 0, function () {
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
            describe("#safeTransferFrom", function () {
                it("Should revert if the tokenId does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                    .catch(function (err) {
                                    (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (safeTransferFrom): TokenId does not exist.");
                                })];
                            case 3:
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should revert if the (from) is a zero address", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (safeTransferFrom): The (from) address cannot be a zero address.");
                                    })];
                            case 3:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should revert if the (to) is a zero address", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                            case 2: return [4 /*yield*/, _b.apply(_a, [_c.sent(), ethers_1.ethers.constants.AddressZero,
                                    0])
                                    .catch(function (err) {
                                    (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (safeTransferFrom): The (to) address cannot be a zero address.");
                                })];
                            case 3:
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should safe transfer a token to an address", function () { return __awaiter(void 0, void 0, void 0, function () {
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
            describe("#isValidBid", function () {
                it("Should return true if the bid amount can be evenly split by current bidShares", function () { return __awaiter(void 0, void 0, void 0, function () {
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
            describe("#permit", function () {
                it("should allow a wallet to set themselves to approved with a valid signature", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var zap_media, mainWallet, otherWallet, deadline, domain, nonce, eipSig, approved;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                zap_media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, zap_media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                mainWallet = new ethers_1.ethers.Wallet("0x89e2d8a81beffed50f4d29f642127f18b5c8c1212c54b18ef66a784d0a172819");
                                otherWallet = new ethers_1.ethers.Wallet("0x043192f7a8fb472d04ef7bb0ba1fbb3667198253cc8046e9e56626b804966cb3");
                                deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                                domain = zap_media.eip712Domain();
                                return [4 /*yield*/, zap_media.fetchPermitNonce(mainWallet.address, 0)];
                            case 2: return [4 /*yield*/, (_a.sent()).toNumber()];
                            case 3:
                                nonce = _a.sent();
                                return [4 /*yield*/, (0, test_utils_1.signPermitMessage)(mainWallet, otherWallet.address, 0, nonce, deadline, domain)];
                            case 4:
                                eipSig = _a.sent();
                                return [4 /*yield*/, zap_media.permit(otherWallet.address, 0, eipSig)];
                            case 5:
                                _a.sent();
                                return [4 /*yield*/, zap_media.fetchApproved(0)];
                            case 6:
                                approved = _a.sent();
                                (0, chai_1.expect)(approved.toLowerCase()).to.equal(otherWallet.address.toLowerCase());
                                // test to see if approved for another token. should fail.
                                return [4 /*yield*/, zap_media.fetchApproved(1).catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (fetchApproved): TokenId does not exist.");
                                    })];
                            case 7:
                                // test to see if approved for another token. should fail.
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#fetchMedia", function () {
                it("Should get media instance by index in the media contract", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                it("Should throw an error index out of range", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media.fetchMediaByIndex(1).catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (tokenByIndex): Index out of range.");
                                    })];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#fetchSignature", function () {
                it("Should fetch the signature of the newly minted nonce", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media, sigNonce, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _c.sent();
                                _b = (_a = media).fetchMintWithSigNonce;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_c.sent()])];
                            case 3:
                                sigNonce = _c.sent();
                                (0, chai_1.expect)(parseInt(sigNonce._hex)).to.equal(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should Revert if address does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var media;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                media = new zapMedia_1.default(1337, signer);
                                return [4 /*yield*/, media.mint(mediaData, bidShares)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, media
                                        .fetchMintWithSigNonce("0x9b713D5416884d12a5BbF13Ee08B6038E74CDe")
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err).to.equal("Invariant failed: 0x9b713D5416884d12a5BbF13Ee08B6038E74CDe is not a valid address.");
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