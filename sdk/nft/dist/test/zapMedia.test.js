"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var chai_1 = __importStar(require("chai"));
var chai_as_promised_1 = __importDefault(require("chai-as-promised"));
var ethers_1 = require("ethers");
var utils_1 = require("ethers/lib/utils");
var utils_2 = require("../src/utils");
var zapMedia_1 = __importDefault(require("../src/zapMedia"));
var mediaFactory_1 = __importDefault(require("../src/mediaFactory"));
var addresses_1 = require("../src/contract/addresses");
var deploy_1 = require("../src/deploy");
var test_utils_1 = require("./test_utils");
var provider = new ethers_1.ethers.providers.JsonRpcProvider("http://localhost:8545");
chai_1.default.use(chai_as_promised_1.default);
chai_1.default.should();
describe("ZapMedia", function () {
    var bidShares;
    var ask;
    var mediaDataOne;
    var mediaDataTwo;
    var token;
    var zapVault;
    var zapMarket;
    var mediaFactoryDeployed;
    var zapMedia;
    var signer;
    var signerOne;
    var mediaFactory;
    var signerOneConnected;
    var ownerConnected;
    var customMediaSigner0;
    var customMediaSigner1;
    var customMediaAddress;
    var eipSig;
    var signers = (0, test_utils_1.getSigners)(provider);
    var tokenURI = "https://bafkreievpmtbofalpowrcbr5oaok33e6xivii62r6fxh6fontaglngme2m.ipfs.dweb.link/";
    var metadataURI = "https://bafkreihhu7xo7knc3vn42jj26gz3jkvh3uu3rwurkb4djsoo5ayqs2s25a.ipfs.dweb.link/";
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var metadataHexOne, metadataHexTwo, metadataHashRawOne, metadataHashRawTwo, metadataHashBytesOne, metadataHashBytesTwo, contentHexOne, contentHexTwo, contentHashRawOne, contentHashRawTwo, contentHashBytesOne, contentHashBytesTwo, contentHashOne, contentHashTwo, metadataHashOne, metadataHashTwo, _a, _b, args;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    signer = signers[0];
                    signerOne = signers[1];
                    return [4 /*yield*/, (0, deploy_1.deployZapToken)()];
                case 1:
                    token = _c.sent();
                    return [4 /*yield*/, (0, deploy_1.deployZapVault)()];
                case 2:
                    zapVault = _c.sent();
                    return [4 /*yield*/, (0, deploy_1.deployZapMarket)()];
                case 3:
                    zapMarket = _c.sent();
                    return [4 /*yield*/, (0, deploy_1.deployZapMediaImpl)()];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, (0, deploy_1.deployMediaFactory)()];
                case 5:
                    mediaFactoryDeployed = _c.sent();
                    return [4 /*yield*/, (0, deploy_1.deployZapMedia)()];
                case 6:
                    zapMedia = _c.sent();
                    addresses_1.zapMarketAddresses["1337"] = zapMarket.address;
                    addresses_1.mediaFactoryAddresses["1337"] = mediaFactoryDeployed.address;
                    addresses_1.zapMediaAddresses["1337"] = zapMedia.address;
                    metadataHexOne = ethers_1.ethers.utils.formatBytes32String("Test1");
                    metadataHexTwo = ethers_1.ethers.utils.formatBytes32String("Test2");
                    metadataHashRawOne = ethers_1.ethers.utils.keccak256(metadataHexOne);
                    metadataHashRawTwo = ethers_1.ethers.utils.keccak256(metadataHexTwo);
                    metadataHashBytesOne = ethers_1.ethers.utils.arrayify(metadataHashRawOne);
                    metadataHashBytesTwo = ethers_1.ethers.utils.arrayify(metadataHashRawTwo);
                    contentHexOne = ethers_1.ethers.utils.formatBytes32String("Testing1");
                    contentHexTwo = ethers_1.ethers.utils.formatBytes32String("Testing2");
                    contentHashRawOne = ethers_1.ethers.utils.keccak256(contentHexOne);
                    contentHashRawTwo = ethers_1.ethers.utils.keccak256(contentHexTwo);
                    contentHashBytesOne = ethers_1.ethers.utils.arrayify(contentHashRawOne);
                    contentHashBytesTwo = ethers_1.ethers.utils.arrayify(contentHashRawTwo);
                    contentHashOne = contentHashBytesOne;
                    contentHashTwo = contentHashBytesTwo;
                    metadataHashOne = metadataHashBytesOne;
                    metadataHashTwo = metadataHashBytesTwo;
                    mediaDataOne = (0, utils_2.constructMediaData)(tokenURI, metadataURI, contentHashOne, metadataHashOne);
                    mediaDataTwo = (0, utils_2.constructMediaData)(tokenURI, metadataURI, contentHashTwo, metadataHashTwo);
                    _a = utils_2.constructBidShares;
                    return [4 /*yield*/, provider.getSigner(1).getAddress()];
                case 7:
                    _b = [
                        _c.sent()
                    ];
                    return [4 /*yield*/, provider.getSigner(2).getAddress()];
                case 8:
                    _b = _b.concat([
                        _c.sent()
                    ]);
                    return [4 /*yield*/, provider.getSigner(3).getAddress()];
                case 9:
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
                    // signerOne (signers[1]) creates an instance of the MediaFactory class
                    mediaFactory = new mediaFactory_1.default(1337, signerOne);
                    return [4 /*yield*/, mediaFactory.deployMedia("TEST COLLECTION 2", "TC2", true, "www.example.com")];
                case 10:
                    args = (_c.sent()).args;
                    customMediaAddress = args.mediaContract;
                    ownerConnected = new zapMedia_1.default(1337, signer);
                    signerOneConnected = new zapMedia_1.default(1337, signerOne);
                    customMediaSigner1 = new zapMedia_1.default(1337, signerOne, customMediaAddress);
                    customMediaSigner0 = new zapMedia_1.default(1337, signer, customMediaAddress);
                    // The owner (signers[0]) mints on their own media contract
                    return [4 /*yield*/, ownerConnected.mint(mediaDataOne, bidShares)];
                case 11:
                    // The owner (signers[0]) mints on their own media contract
                    _c.sent();
                    // The signerOne (signers[1]) mints on the owners (signers[0]) media contract
                    return [4 /*yield*/, signerOneConnected.mint(mediaDataTwo, bidShares)];
                case 12:
                    // The signerOne (signers[1]) mints on the owners (signers[0]) media contract
                    _c.sent();
                    // The signerOne (signers[1]) mints on their own media contract by passing in the
                    // their media address as optional argument
                    return [4 /*yield*/, signerOneConnected.mint(mediaDataOne, bidShares, customMediaAddress)];
                case 13:
                    // The signerOne (signers[1]) mints on their own media contract by passing in the
                    // their media address as optional argument
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe("Contract Functions", function () {
        describe("#constructor", function () {
            it("Should throw an error if the networkId is invalid", function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    (0, chai_1.expect)(function () {
                        new zapMedia_1.default(300, signer);
                    }).to.throw("Constructor: Network Id is not supported.");
                    return [2 /*return*/];
                });
            }); });
            it("Should throw an error if the custom media is a zero address", function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    (0, chai_1.expect)(function () {
                        new zapMedia_1.default(1337, signer, ethers_1.ethers.constants.AddressZero);
                    }).to.throw("ZapMedia (constructor): The (customMediaAddress) cannot be a zero address.");
                    return [2 /*return*/];
                });
            }); });
        });
        describe("View Functions", function () {
            describe("#fetchBalanceOf", function () {
                it("Should reject if the owner is a zero address on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, signerOneConnected
                                    .fetchBalanceOf(ethers_1.ethers.constants.AddressZero)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchBalanceOf): The (owner) address cannot be a zero address.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the owner is a zero address through a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1
                                    .fetchBalanceOf(ethers_1.ethers.constants.AddressZero)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchBalanceOf): The (owner) address cannot be a zero address.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should fetch the owner balance on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var balance, _a, _b, balanceOne, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                _b = (_a = ownerConnected).fetchBalanceOf;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_e.sent()])];
                            case 2:
                                balance = _e.sent();
                                _d = (_c = ownerConnected).fetchBalanceOf;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 3: return [4 /*yield*/, _d.apply(_c, [_e.sent()])];
                            case 4:
                                balanceOne = _e.sent();
                                (0, chai_1.expect)(parseInt(balance._hex)).to.equal(1);
                                (0, chai_1.expect)(parseInt(balanceOne._hex)).to.equal(1);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should fetch the owner balance through a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var balance0, _a, _b, balance1, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                _b = (_a = customMediaSigner1).fetchBalanceOf;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_e.sent()])];
                            case 2:
                                balance0 = _e.sent();
                                _d = (_c = customMediaSigner1).fetchBalanceOf;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 3: return [4 /*yield*/, _d.apply(_c, [_e.sent()])];
                            case 4:
                                balance1 = _e.sent();
                                (0, chai_1.expect)(parseInt(balance0._hex)).to.equal(0);
                                (0, chai_1.expect)(parseInt(balance1._hex)).to.equal(1);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#fetchContentURI", function () {
                it("Should reject if the token id does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected
                                    .fetchContentURI(5)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchContentURI): TokenId does not exist.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the token id does not exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1
                                    .fetchContentURI(1)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchContentURI): TokenId does not exist.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should fetch the content uri on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var firstTokenURI, secondTokenURI;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchContentURI(0)];
                            case 1:
                                firstTokenURI = _a.sent();
                                return [4 /*yield*/, ownerConnected.fetchContentURI(1)];
                            case 2:
                                secondTokenURI = _a.sent();
                                (0, chai_1.expect)(firstTokenURI).to.equal(tokenURI);
                                (0, chai_1.expect)(secondTokenURI).to.equal(tokenURI);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should fetch the content uri on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var firstContentURI;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1.fetchContentURI(0)];
                            case 1:
                                firstContentURI = _a.sent();
                                (0, chai_1.expect)(firstContentURI).to.equal(tokenURI);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#fetchMetadataURI", function () {
                it("should reject if the token id does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected
                                    .fetchMetadataURI(5)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchMetadataURI): TokenId does not exist.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the token id does not exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1
                                    .fetchMetadataURI(10)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchMetadataURI): TokenId does not exist.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should fetch the metadata uri on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var firstMetadataURI;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1.fetchMetadataURI(0)];
                            case 1:
                                firstMetadataURI = _a.sent();
                                (0, chai_1.expect)(firstMetadataURI).to.equal(metadataURI);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("should fetch the metadata URI on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var firstMetadataURI, secondMetadataURI;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchMetadataURI(0)];
                            case 1:
                                firstMetadataURI = _a.sent();
                                return [4 /*yield*/, ownerConnected.fetchMetadataURI(1)];
                            case 2:
                                secondMetadataURI = _a.sent();
                                (0, chai_1.expect)(firstMetadataURI).to.equal(metadataURI);
                                (0, chai_1.expect)(secondMetadataURI).to.equal(metadataURI);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#fetchOwnerOf", function () {
                it("Should reject if the token id does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            // Should throw an error due to the token id not existing on the main media
                            return [4 /*yield*/, ownerConnected
                                    .fetchOwnerOf(12)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchOwnerOf): The token id does not exist.")];
                            case 1:
                                // Should throw an error due to the token id not existing on the main media
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the token id does not exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            // Should throw an error due to the token id not existing on the custom media
                            return [4 /*yield*/, customMediaSigner1
                                    .fetchOwnerOf(7)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchOwnerOf): The token id does not exist.")];
                            case 1:
                                // Should throw an error due to the token id not existing on the custom media
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should fetch an owner of a token id on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var tokenOwner, _a, _b, tokenOwnerOne, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 1:
                                tokenOwner = _e.sent();
                                // Expect the returned address to equal the address of owner (signers[0])
                                _b = (_a = (0, chai_1.expect)(tokenOwner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2:
                                // Expect the returned address to equal the address of owner (signers[0])
                                _b.apply(_a, [_e.sent()]);
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(1)];
                            case 3:
                                tokenOwnerOne = _e.sent();
                                // Expect the returned address to equal the address of signerOne
                                _d = (_c = (0, chai_1.expect)(tokenOwnerOne).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 4:
                                // Expect the returned address to equal the address of signerOne
                                _d.apply(_c, [_e.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should fetch an owner of a token id on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var tokenOwner, _a, _b, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                _b = (_a = customMediaSigner1
                                    .fetchOwnerOf(0)
                                    .should.eventually).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_e.sent()])];
                            case 2:
                                tokenOwner = _e.sent();
                                _d = (_c = (0, chai_1.expect)(tokenOwner).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 3:
                                _d.apply(_c, [_e.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#fetchContentHash", function () {
                it("Should return 0x0 if tokenId doesn't exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var onChainContentHash;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchContentHash(56)];
                            case 1:
                                onChainContentHash = _a.sent();
                                // tokenId doesn't exists, so we expect a default return value of 0x0000...
                                (0, chai_1.expect)(onChainContentHash).eq(ethers_1.ethers.constants.HashZero);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should return 0x0 if tokenId doesn't exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var onChainContentHash;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1.fetchContentHash(56)];
                            case 1:
                                onChainContentHash = _a.sent();
                                // tokenId doesn't exists, so we expect a default return value of 0x0000...
                                (0, chai_1.expect)(onChainContentHash).eq(ethers_1.ethers.constants.HashZero);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should be able to fetch contentHash on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var onChainContentHashOne, onChainContentHashTwo;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchContentHash(0)];
                            case 1:
                                onChainContentHashOne = _a.sent();
                                return [4 /*yield*/, ownerConnected.fetchContentHash(1)];
                            case 2:
                                onChainContentHashTwo = _a.sent();
                                // Expect the returned content hash to equal the content hash set on mint
                                (0, chai_1.expect)(onChainContentHashOne).eq(ethers_1.ethers.utils.hexlify(mediaDataOne.contentHash));
                                // Expect the returned content hash to equal the content hash set on mint
                                (0, chai_1.expect)(onChainContentHashTwo).eq(ethers_1.ethers.utils.hexlify(mediaDataTwo.contentHash));
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should be able to fetch contentHash on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var onChainContentHash;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1.fetchContentHash(0)];
                            case 1:
                                onChainContentHash = _a.sent();
                                // Expect the returned content hash to equal the content hash set on mint
                                (0, chai_1.expect)(onChainContentHash).eq(ethers_1.ethers.utils.hexlify(mediaDataOne.contentHash));
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#fetchMetadataHash", function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    it("Should return 0x0 if tokenId doesn't exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var onChainMetadataHash;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ownerConnected.fetchMetadataHash(56)];
                                case 1:
                                    onChainMetadataHash = _a.sent();
                                    // tokenId doesn't exists, so we expect a default return value of 0x0000...
                                    (0, chai_1.expect)(onChainMetadataHash).eq(ethers_1.ethers.constants.HashZero);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it("Should return 0x0 if tokenId doesn't exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var onChainMetadataHash;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, customMediaSigner1.fetchMetadataHash(1001)];
                                case 1:
                                    onChainMetadataHash = _a.sent();
                                    // tokenId doesn't exists, so we expect a default return value of 0x0000...
                                    (0, chai_1.expect)(onChainMetadataHash).eq(ethers_1.ethers.constants.HashZero);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it("Should be able to fetch metadataHash on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var onChainMetadataHashOne, onChainMetadataHashTwo;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ownerConnected.fetchMetadataHash(0)];
                                case 1:
                                    onChainMetadataHashOne = _a.sent();
                                    return [4 /*yield*/, ownerConnected.fetchMetadataHash(1)];
                                case 2:
                                    onChainMetadataHashTwo = _a.sent();
                                    // Expect the returned metadata hash for tokenId 0 to equal the one set on mint
                                    (0, chai_1.expect)(onChainMetadataHashOne).eq(ethers_1.ethers.utils.hexlify(mediaDataOne.metadataHash));
                                    // Expect the returned metadata hash for tokenId 1 to equal the one set on mint
                                    (0, chai_1.expect)(onChainMetadataHashTwo).eq(ethers_1.ethers.utils.hexlify(mediaDataTwo.metadataHash));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it("Should be able to fetch metadataHash on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var onChainMetadataHash;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, customMediaSigner1.fetchMetadataHash(0)];
                                case 1:
                                    onChainMetadataHash = _a.sent();
                                    // tokenId doesn't exists, so we expect a default return value of 0x0000...
                                    (0, chai_1.expect)(onChainMetadataHash).eq(ethers_1.ethers.utils.hexlify(mediaDataOne.metadataHash));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe.skip("#fetchPermitNonce", function () {
                it("Should be able to fetch permitNonce", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var otherWallet, account9, deadline, domain, nonce, eipSig, firstApprovedAddr, nonce2, account8, secondApprovedAddr, nonce3, tokenThatDoesntExist, nonceForTokenThatDoesntExist;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                otherWallet = new ethers_1.ethers.Wallet(
                                // "0x043192f7a8fb472d04ef7bb0ba1fbb3667198253cc8046e9e56626b804966cb3"
                                "0x89e2d8a81beffed50f4d29f642127f18b5c8c1212c54b18ef66a784d0a172819");
                                account9 = new ethers_1.ethers.Wallet("0x915c40257f694fef7d8058fe4db4ba53f1343b592a8175ea18e7ece20d2987d7");
                                deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                                domain = ownerConnected.eip712Domain();
                                return [4 /*yield*/, ownerConnected.fetchPermitNonce(otherWallet.address, 1)];
                            case 1:
                                nonce = (_a.sent()).toNumber();
                                return [4 /*yield*/, (0, test_utils_1.signPermitMessage)(otherWallet, account9.address, 1, nonce, deadline, domain)];
                            case 2:
                                eipSig = _a.sent();
                                // permit account9 == give approval to account 9 for tokenId 0.
                                return [4 /*yield*/, signerOneConnected.permit(account9.address, 1, eipSig)];
                            case 3:
                                // permit account9 == give approval to account 9 for tokenId 0.
                                _a.sent();
                                return [4 /*yield*/, signerOneConnected.fetchApproved(1)];
                            case 4:
                                firstApprovedAddr = _a.sent();
                                (0, chai_1.expect)(firstApprovedAddr.toLowerCase()).to.equal(account9.address.toLowerCase());
                                return [4 /*yield*/, ownerConnected.fetchPermitNonce(otherWallet.address, 1)];
                            case 5: return [4 /*yield*/, (_a.sent()).toNumber()];
                            case 6:
                                nonce2 = _a.sent();
                                (0, chai_1.expect)(nonce2).to.equal(nonce + 1);
                                account8 = new ethers_1.ethers.Wallet("0x81c92fdc4c4703cb0da2af8ceae63160426425935f3bb701edd53ffa5c227417");
                                return [4 /*yield*/, (0, test_utils_1.signPermitMessage)(otherWallet, account8.address, 1, nonce2, deadline, domain)];
                            case 7:
                                eipSig = _a.sent();
                                return [4 /*yield*/, signerOneConnected.permit(account8.address, 1, eipSig)];
                            case 8:
                                _a.sent();
                                return [4 /*yield*/, signerOneConnected.fetchApproved(1)];
                            case 9:
                                secondApprovedAddr = _a.sent();
                                (0, chai_1.expect)(secondApprovedAddr.toLowerCase()).to.equal(account8.address.toLowerCase());
                                return [4 /*yield*/, ownerConnected.fetchPermitNonce(otherWallet.address, 1)];
                            case 10: return [4 /*yield*/, (_a.sent()).toNumber()];
                            case 11:
                                nonce3 = _a.sent();
                                (0, chai_1.expect)(nonce3).to.equal(nonce2 + 1);
                                tokenThatDoesntExist = 38;
                                return [4 /*yield*/, ownerConnected.fetchPermitNonce(otherWallet.address, tokenThatDoesntExist)];
                            case 12: return [4 /*yield*/, (_a.sent()).toNumber()];
                            case 13:
                                nonceForTokenThatDoesntExist = _a.sent();
                                (0, chai_1.expect)(nonceForTokenThatDoesntExist).to.equal(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#fetchMediaOfOwnerByIndex", function () {
                it("Should throw an error if the (owner) is a zero address on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            // fetchMediaOfOwnerByIndex will fail due to a zero address passed in as the owner
                            return [4 /*yield*/, ownerConnected
                                    .fetchMediaOfOwnerByIndex(ethers_1.ethers.constants.AddressZero, 0)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchMediaOfOwnerByIndex): The (owner) address cannot be a zero address.")];
                            case 1:
                                // fetchMediaOfOwnerByIndex will fail due to a zero address passed in as the owner
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should throw an error if the (owner) is a zero address on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            // fetchMediaOfOwnerByIndex will fail due to a zero address passed in as the owner
                            return [4 /*yield*/, customMediaSigner1
                                    .fetchMediaOfOwnerByIndex(ethers_1.ethers.constants.AddressZero, 0)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchMediaOfOwnerByIndex): The (owner) address cannot be a zero address.")];
                            case 1:
                                // fetchMediaOfOwnerByIndex will fail due to a zero address passed in as the owner
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should return the token of the owner by index on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var fetchToken, _a, _b, fetchTokenOne, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                _b = (_a = ownerConnected).fetchMediaOfOwnerByIndex;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 2:
                                fetchToken = _e.sent();
                                _d = (_c = ownerConnected).fetchMediaOfOwnerByIndex;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 3: return [4 /*yield*/, _d.apply(_c, [_e.sent(), 0])];
                            case 4:
                                fetchTokenOne = _e.sent();
                                // Expect owner (signers[0]) to own tokenId 0 on the main media contract
                                (0, chai_1.expect)(parseInt(fetchToken._hex)).to.equal(0);
                                // Expect signerOne (signers[1]) to own tokenId 1 on the main media contract
                                (0, chai_1.expect)(parseInt(fetchTokenOne._hex)).to.equal(1);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should return the token of an owner by index from a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var fetchToken, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = customMediaSigner1).fetchMediaOfOwnerByIndex;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent(), 0])];
                            case 2:
                                fetchToken = _c.sent();
                                // Expect signerOne (signers[1]) to own tokenId 0 on their own media contract
                                (0, chai_1.expect)(parseInt(fetchToken._hex)).to.equal(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#fetchTotalMedia", function () {
                it("Should fetch the total media minted on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var totalSupply;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, signerOneConnected.fetchTotalMedia()];
                            case 1:
                                totalSupply = _a.sent();
                                // Expect the totalSupply to equal 2
                                (0, chai_1.expect)(parseInt(totalSupply._hex)).to.equal(2);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should fetch the total media minted on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var totalSupply;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1.fetchTotalMedia()];
                            case 1:
                                totalSupply = _a.sent();
                                // Expect the totalSupply to equal 1
                                (0, chai_1.expect)(parseInt(totalSupply._hex)).to.equal(1);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#fetchCreator", function () {
                it("Should return a zero address if the token id does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var ownerAddr;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchCreator(300)];
                            case 1:
                                ownerAddr = _a.sent();
                                // Expect the address to equal a zero address
                                (0, chai_1.expect)(ownerAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should return a zero address if the token id does not exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var ownerAddr;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1.fetchCreator(12)];
                            case 1:
                                ownerAddr = _a.sent();
                                // Expect the address to equal a zero address
                                (0, chai_1.expect)(ownerAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should return the token creator on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var creatorOne, creatorTwo, _a, _b, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchCreator(0)];
                            case 1:
                                creatorOne = _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchCreator(1)];
                            case 2:
                                creatorTwo = _e.sent();
                                // Expect creator of tokenId 0 to equal the owner (signers[0]) address
                                _b = (_a = (0, chai_1.expect)(creatorOne).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 3:
                                // Expect creator of tokenId 0 to equal the owner (signers[0]) address
                                _b.apply(_a, [_e.sent()]);
                                // Expect the creator of tokenId 1 to equal the signerOne (signers[1]) address
                                _d = (_c = (0, chai_1.expect)(creatorTwo).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 4:
                                // Expect the creator of tokenId 1 to equal the signerOne (signers[1]) address
                                _d.apply(_c, [_e.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should return the token creator on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var creator, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1.fetchCreator(0)];
                            case 1:
                                creator = _c.sent();
                                // Expect the creator of tokenId 0 on the custom media to equal the signerOne (signers[1]) address
                                _b = (_a = (0, chai_1.expect)(creator).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2:
                                // Expect the creator of tokenId 0 on the custom media to equal the signerOne (signers[1]) address
                                _b.apply(_a, [_c.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        });
        describe("Write Functions", function () {
            describe("#updateContentURI", function () {
                it("Should thrown an error if the tokenURI does not begin with `https://`", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                mediaDataOne.tokenURI = "http://example.com";
                                return [4 /*yield*/, ownerConnected.mint(mediaDataOne, bidShares).catch(function (err) {
                                        (0, chai_1.expect)(err).to.equal("Invariant failed: http://example.com must begin with `https://`");
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should throw an error if the updateContentURI tokenId does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected
                                    .updateContentURI(0, "www.newURI.com")
                                    .catch(function (err) {
                                    (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (updateContentURI): TokenId does not exist.");
                                })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should throw an error if the fetchContentURI tokenId does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchContentURI(0).catch(function (err) {
                                    (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (fetchContentURI): TokenId does not exist.");
                                })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should update the content uri", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var fetchTokenURI, fetchNewURI;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchContentURI(0)];
                            case 1:
                                fetchTokenURI = _a.sent();
                                // The returned tokenURI should equal the tokenURI configured in the mediaDataOne
                                (0, chai_1.expect)(fetchTokenURI).to.equal(mediaDataOne.tokenURI);
                                // Updates tokenId 0's tokenURI
                                return [4 /*yield*/, ownerConnected.updateContentURI(0, "https://newURI.com")];
                            case 2:
                                // Updates tokenId 0's tokenURI
                                _a.sent();
                                return [4 /*yield*/, ownerConnected.fetchContentURI(0)];
                            case 3:
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
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                mediaDataOne.metadataURI = "http://example.com";
                                return [4 /*yield*/, ownerConnected.mint(mediaDataOne, bidShares).catch(function (err) {
                                        (0, chai_1.expect)(err).to.equal("Invariant failed: http://example.com must begin with `https://`");
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should update the metadata uri", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var fetchMetadataURI, newMetadataURI;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchMetadataURI(0)];
                            case 1:
                                fetchMetadataURI = _a.sent();
                                (0, chai_1.expect)(fetchMetadataURI).to.equal(mediaDataOne.metadataURI);
                                return [4 /*yield*/, ownerConnected.updateMetadataURI(0, "https://newMetadataURI.com")];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, ownerConnected.fetchMetadataURI(0)];
                            case 3:
                                newMetadataURI = _a.sent();
                                (0, chai_1.expect)(newMetadataURI).to.equal("https://newMetadataURI.com");
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#mint", function () {
                it("throws an error if bid shares do not sum to 100", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var bidShareSum, i;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                bidShareSum = 0;
                                bidShares.creator.value = bidShares.creator.value.add(BigInt(1e18));
                                for (i = 0; i < bidShares.collabShares.length; i++) {
                                    bidShareSum += parseInt(bidShares.collabShares[i]);
                                }
                                bidShareSum +=
                                    parseInt(bidShares.creator.value) +
                                        parseInt(bidShares.owner.value) +
                                        5e18;
                                return [4 /*yield*/, ownerConnected.mint(mediaDataOne, bidShares).catch(function (err) {
                                        (0, chai_1.expect)(err).to.equal("Invariant failed: The BidShares sum to ".concat(bidShareSum, ", but they must sum to 100000000000000000000"));
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should be able to mint", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preTotalSupply, owner, creator, onChainBidShares, onChainContentURI, onChainMetadataURI, _a, _b, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchTotalMedia()];
                            case 1:
                                preTotalSupply = (_e.sent()).toNumber();
                                (0, chai_1.expect)(preTotalSupply).to.equal(2);
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 2:
                                owner = _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchCreator(0)];
                            case 3:
                                creator = _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchCurrentBidShares(zapMedia.address, 0)];
                            case 4:
                                onChainBidShares = _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchContentURI(0)];
                            case 5:
                                onChainContentURI = _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchMetadataURI(0)];
                            case 6:
                                onChainMetadataURI = _e.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 7:
                                _b.apply(_a, [_e.sent()]);
                                _d = (_c = (0, chai_1.expect)(creator).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 8:
                                _d.apply(_c, [_e.sent()]);
                                (0, chai_1.expect)(onChainContentURI).to.equal(mediaDataOne.tokenURI);
                                (0, chai_1.expect)(onChainMetadataURI).to.equal(mediaDataOne.metadataURI);
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
                    var bidShareSum, i, otherWallet;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                bidShareSum = 0;
                                bidShares.creator.value = bidShares.creator.value.add(BigInt(1e18));
                                for (i = 0; i < bidShares.collabShares.length; i++) {
                                    bidShareSum += parseInt(bidShares.collabShares[i]);
                                }
                                bidShareSum +=
                                    parseInt(bidShares.creator.value) +
                                        parseInt(bidShares.owner.value) +
                                        5e18;
                                otherWallet = new ethers_1.ethers.Wallet("0x7a8c4ab64eaec15cab192c8e3bae1414de871a34c470c1c05a0f3541770686d9");
                                return [4 /*yield*/, ownerConnected
                                        .mintWithSig(otherWallet.address, mediaDataOne, bidShares, eipSig)
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
                    var otherWallet, metadataHex, metadataHashRaw, metadataHashBytes, contentHex, contentHashRaw, contentHashBytes, invalidMediaData;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                otherWallet = new ethers_1.ethers.Wallet("0x7a8c4ab64eaec15cab192c8e3bae1414de871a34c470c1c05a0f3541770686d9");
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
                                return [4 /*yield*/, ownerConnected
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
                    var otherWallet, invalidMediaData;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                otherWallet = new ethers_1.ethers.Wallet("0x7a8c4ab64eaec15cab192c8e3bae1414de871a34c470c1c05a0f3541770686d9");
                                invalidMediaData = {
                                    tokenURI: "https://example.com",
                                    metadataURI: "http://metadata.com",
                                    contentHash: mediaDataOne.contentHash,
                                    metadataHash: mediaDataOne.metadataHash,
                                };
                                return [4 /*yield*/, ownerConnected
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
                // Using metadata that is already minted
                it.skip("creates a new piece of media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var mainWallet, deadline, domain, nonce, media1ContentHash, media1MetadataHash, eipSig, totalSupply, owner, creator, onChainContentHash, onChainMetadataHash, mediaContentHash, mediaMetadataHash, onChainBidShares, onChainContentURI, onChainMetadataURI;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                mainWallet = new ethers_1.ethers.Wallet("0xb91c5477014656c1da52b3d4b6c03b59019c9a3b5730e61391cec269bc2e03e3");
                                deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                                domain = ownerConnected.eip712Domain();
                                return [4 /*yield*/, ownerConnected.fetchMintWithSigNonce(mainWallet.address)];
                            case 1:
                                nonce = _a.sent();
                                media1ContentHash = ethers_1.ethers.utils.hexlify(mediaDataOne.contentHash);
                                media1MetadataHash = ethers_1.ethers.utils.hexlify(mediaDataOne.metadataHash);
                                return [4 /*yield*/, (0, test_utils_1.signMintWithSigMessage)(mainWallet, media1ContentHash, media1MetadataHash, utils_2.Decimal.new(15).value, nonce.toNumber(), deadline, domain)];
                            case 2:
                                eipSig = _a.sent();
                                return [4 /*yield*/, ownerConnected.fetchTotalMedia()];
                            case 3:
                                totalSupply = _a.sent();
                                (0, chai_1.expect)(totalSupply.toNumber()).to.eq(2);
                                return [4 /*yield*/, ownerConnected.mintWithSig(mainWallet.address, mediaDataOne, bidShares, eipSig)];
                            case 4:
                                _a.sent();
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 5:
                                owner = _a.sent();
                                return [4 /*yield*/, ownerConnected.fetchCreator(0)];
                            case 6:
                                creator = _a.sent();
                                return [4 /*yield*/, ownerConnected.fetchContentHash(0)];
                            case 7:
                                onChainContentHash = _a.sent();
                                return [4 /*yield*/, ownerConnected.fetchMetadataHash(0)];
                            case 8:
                                onChainMetadataHash = _a.sent();
                                mediaContentHash = ethers_1.ethers.utils.hexlify(mediaDataOne.contentHash);
                                mediaMetadataHash = ethers_1.ethers.utils.hexlify(mediaDataOne.metadataHash);
                                return [4 /*yield*/, ownerConnected.fetchCurrentBidShares(zapMedia.address, 0)];
                            case 9:
                                onChainBidShares = _a.sent();
                                return [4 /*yield*/, ownerConnected.fetchContentURI(0)];
                            case 10:
                                onChainContentURI = _a.sent();
                                return [4 /*yield*/, ownerConnected.fetchMetadataURI(0)];
                            case 11:
                                onChainMetadataURI = _a.sent();
                                (0, chai_1.expect)(owner.toLowerCase()).to.eq(mainWallet.address.toLowerCase());
                                (0, chai_1.expect)(creator.toLowerCase()).to.eq(mainWallet.address.toLowerCase());
                                (0, chai_1.expect)(onChainContentHash).to.eq(mediaContentHash);
                                (0, chai_1.expect)(onChainContentURI).to.eq(mediaDataOne.tokenURI);
                                (0, chai_1.expect)(onChainMetadataURI).to.eq(mediaDataOne.metadataURI);
                                (0, chai_1.expect)(onChainMetadataHash).to.eq(mediaMetadataHash);
                                (0, chai_1.expect)(parseInt(onChainBidShares.creator.value)).to.eq(parseInt(bidShares.creator.value));
                                (0, chai_1.expect)(parseInt(onChainBidShares.owner.value)).to.eq(parseInt(bidShares.owner.value));
                                (0, chai_1.expect)(onChainBidShares.collabShares).to.eql(bidShares.collabShares);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#setAsk", function () {
                it("Should throw an error if the signer is not approved nor the owner", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var owner, getApproved, _a, _b, _c, _d, _e, _f;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(zapMedia.address, 100);
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 1:
                                owner = _g.sent();
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 2:
                                getApproved = _g.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to.not).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 3:
                                _b.apply(_a, [_g.sent()]);
                                _d = (_c = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 4:
                                _d.apply(_c, [_g.sent()]);
                                _f = (_e = (0, chai_1.expect)(getApproved).to.not).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 5:
                                _f.apply(_e, [_g.sent()]);
                                (0, chai_1.expect)(getApproved).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [4 /*yield*/, signerOneConnected.setAsk(0, ask).catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (setAsk): Media: Only approved or owner.");
                                    })];
                            case 6:
                                _g.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should set an ask by the owner", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var owner, _a, _b, getApproved, onChainAsk;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(zapMedia.address, 100);
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 1:
                                owner = _c.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2:
                                _b.apply(_a, [_c.sent()]);
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 3:
                                getApproved = _c.sent();
                                (0, chai_1.expect)(getApproved).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [4 /*yield*/, ownerConnected.setAsk(0, ask)];
                            case 4:
                                _c.sent();
                                return [4 /*yield*/, ownerConnected.fetchCurrentAsk(zapMedia.address, 0)];
                            case 5:
                                onChainAsk = _c.sent();
                                (0, chai_1.expect)(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
                                (0, chai_1.expect)(onChainAsk.currency).to.equal(zapMedia.address);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should set an ask by the approved", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, owner, _c, _d, getApproved, _e, _f, onChainAsk;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(zapMedia.address, 100);
                                _b = (_a = ownerConnected).approve;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_g.sent(), 0])];
                            case 2:
                                _g.sent();
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 3:
                                owner = _g.sent();
                                _d = (_c = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 4:
                                _d.apply(_c, [_g.sent()]);
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 5:
                                getApproved = _g.sent();
                                _f = (_e = (0, chai_1.expect)(getApproved).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 6:
                                _f.apply(_e, [_g.sent()]);
                                return [4 /*yield*/, signerOneConnected.setAsk(0, ask)];
                            case 7:
                                _g.sent();
                                return [4 /*yield*/, ownerConnected.fetchCurrentAsk(zapMedia.address, 0)];
                            case 8:
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
                var bidderConnected;
                beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                bidder = signers[2];
                                _a = utils_2.constructBid;
                                _b = [token.address,
                                    200];
                                return [4 /*yield*/, bidder.getAddress()];
                            case 1:
                                _b = _b.concat([_e.sent()]);
                                return [4 /*yield*/, bidder.getAddress()];
                            case 2:
                                bid = _a.apply(void 0, _b.concat([_e.sent(), 10]));
                                // The bidder(signer[2]) is connected to the ZapMedia class as a signer
                                bidderConnected = new zapMedia_1.default(1337, bidder);
                                _d = (_c = token).mint;
                                return [4 /*yield*/, bidder.getAddress()];
                            case 3: 
                            // Transfer tokens to the bidder
                            return [4 /*yield*/, _d.apply(_c, [_e.sent(), 1000])];
                            case 4:
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
                describe("#fetchCurrentAsk", function () {
                    it("Should return null values if the media is a zero address with a valid token id", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var fetchAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ownerConnected.fetchCurrentAsk(ethers_1.ethers.constants.AddressZero, 0)];
                                case 1:
                                    fetchAddress = _a.sent();
                                    (0, chai_1.expect)(fetchAddress.currency).to.equal(ethers_1.ethers.constants.AddressZero);
                                    (0, chai_1.expect)(parseInt(fetchAddress.amount.toString())).to.equal(0);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it("Should return null values if the token id does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var fetchAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ownerConnected.fetchCurrentAsk(zapMedia.address, 10)];
                                case 1:
                                    fetchAddress = _a.sent();
                                    (0, chai_1.expect)(fetchAddress.currency).to.equal(ethers_1.ethers.constants.AddressZero);
                                    (0, chai_1.expect)(parseInt(fetchAddress.amount.toString())).to.equal(0);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                });
                describe("#fetchCurrentBidForBidder", function () {
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
                                        .should.be.rejectedWith("Invariant failed: ZapMedia (fetchCurrentBidForBidder): The (media contract) address cannot be a zero address.")];
                                case 2:
                                    _d.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it("Should reject if the token id does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                        .should.be.rejectedWith("Invariant failed: ZapMedia (fetchCurrentBidForBidder): The token id does not exist.")];
                                case 2:
                                    _d.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it("Should reject if the bidder is a zero address on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ownerConnected
                                        .fetchCurrentBidForBidder(zapMedia.address, 0, ethers_1.ethers.constants.AddressZero)
                                        .should.be.rejectedWith("Invariant failed: ZapMedia (fetchCurrentBidForBidder): The (bidder) address cannot be a zero address.")];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it("Should reject if the token id does not exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, _b, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _b = (_a = ownerConnected)
                                        .fetchCurrentBidForBidder;
                                    _c = [customMediaAddress,
                                        10];
                                    return [4 /*yield*/, bidder.getAddress()];
                                case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent()]))
                                        .should.be.rejectedWith("Invariant failed: ZapMedia (fetchCurrentBidForBidder): The token id does not exist.")];
                                case 2:
                                    _d.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it("Should reject if the bidder is a zero address on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ownerConnected
                                        .fetchCurrentBidForBidder(customMediaAddress, 0, ethers_1.ethers.constants.AddressZero)
                                        .should.be.rejectedWith("Invariant failed: ZapMedia (fetchCurrentBidForBidder): The (bidder) address cannot be a zero address.")];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                });
            });
            describe("#removeAsk", function () {
                it("Should throw an error if the removeAsk tokenId does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(zapMedia.address, 100);
                                return [4 /*yield*/, ownerConnected.removeAsk(400).catch(function (err) {
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
                            case 0: return [4 /*yield*/, ownerConnected.removeAsk(0).catch(function (err) {
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
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 1:
                                owner = _c.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2:
                                _b.apply(_a, [_c.sent()]);
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 3:
                                getApproved = _c.sent();
                                (0, chai_1.expect)(getApproved).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [4 /*yield*/, ownerConnected.setAsk(0, ask)];
                            case 4:
                                _c.sent();
                                return [4 /*yield*/, ownerConnected.fetchCurrentAsk(zapMedia.address, 0)];
                            case 5:
                                onChainAsk = _c.sent();
                                (0, chai_1.expect)(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
                                (0, chai_1.expect)(onChainAsk.currency).to.equal(zapMedia.address);
                                return [4 /*yield*/, ownerConnected.removeAsk(0)];
                            case 6:
                                _c.sent();
                                return [4 /*yield*/, ownerConnected.fetchCurrentAsk(zapMedia.address, 0)];
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
                    var _a, _b, approved, _c, _d, revokedStatus;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                _b = (_a = ownerConnected).approve;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 2:
                                _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 3:
                                approved = _e.sent();
                                _d = (_c = (0, chai_1.expect)(approved).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 4:
                                _d.apply(_c, [_e.sent()]);
                                return [4 /*yield*/, signerOneConnected.revokeApproval(0)];
                            case 5:
                                _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 6:
                                revokedStatus = _e.sent();
                                (0, chai_1.expect)(revokedStatus).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#burn", function () {
                it("Should reject if the token id does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected
                                    .burn(3)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (burn): TokenId does not exist.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the token id does not exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1
                                    .burn(3)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (burn): TokenId does not exist.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the caller is not approved nor the owner on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, signerOneConnected
                                    .burn(0)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (burn): Caller is not approved nor the owner.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the caller is not approved nor the owner on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner0
                                    .burn(0)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (burn): Caller is not approved nor the owner.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should burn a token if the caller is approved on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preTotalSupply, preApprovedAddr, _a, _b, postApprovedAddr, _c, _d, postTotalSupply;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchTotalMedia()];
                            case 1:
                                preTotalSupply = _e.sent();
                                (0, chai_1.expect)(preTotalSupply.toNumber()).to.equal(2);
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 2:
                                preApprovedAddr = _e.sent();
                                (0, chai_1.expect)(preApprovedAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = ownerConnected).approve;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 3: return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 4:
                                _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 5:
                                postApprovedAddr = _e.sent();
                                _d = (_c = (0, chai_1.expect)(postApprovedAddr).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 6:
                                _d.apply(_c, [_e.sent()]);
                                return [4 /*yield*/, signerOneConnected.burn(0)];
                            case 7:
                                _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchTotalMedia()];
                            case 8:
                                postTotalSupply = _e.sent();
                                (0, chai_1.expect)(postTotalSupply.toNumber()).to.equal(1);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should burn a token if the caller is approved on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preTotalSupply, preApprovedAddr, _a, _b, postApprovedAddr, _c, _d, postTotalSupply;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1.fetchTotalMedia()];
                            case 1:
                                preTotalSupply = _e.sent();
                                (0, chai_1.expect)(preTotalSupply.toNumber()).to.equal(1);
                                return [4 /*yield*/, customMediaSigner0.fetchApproved(0)];
                            case 2:
                                preApprovedAddr = _e.sent();
                                (0, chai_1.expect)(preApprovedAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = customMediaSigner1).approve;
                                return [4 /*yield*/, signer.getAddress()];
                            case 3: return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 4:
                                _e.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchApproved(0)];
                            case 5:
                                postApprovedAddr = _e.sent();
                                _d = (_c = (0, chai_1.expect)(postApprovedAddr).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 6:
                                _d.apply(_c, [_e.sent()]);
                                return [4 /*yield*/, customMediaSigner0.burn(0)];
                            case 7:
                                _e.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchTotalMedia()];
                            case 8:
                                postTotalSupply = _e.sent();
                                (0, chai_1.expect)(postTotalSupply.toNumber()).to.equal(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should burn the token if the caller is approved for all on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preTotalSupply, preApprovedStatus, _a, _b, _c, _d, _e, postApprovedStatus, _f, _g, _h, postTotalSupply;
                    return __generator(this, function (_j) {
                        switch (_j.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchTotalMedia()];
                            case 1:
                                preTotalSupply = _j.sent();
                                (0, chai_1.expect)(preTotalSupply.toNumber()).to.equal(2);
                                _b = (_a = ownerConnected).fetchIsApprovedForAll;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2:
                                _c = [_j.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 3: return [4 /*yield*/, _b.apply(_a, _c.concat([_j.sent()]))];
                            case 4:
                                preApprovedStatus = _j.sent();
                                (0, chai_1.expect)(preApprovedStatus).to.equal(false);
                                _e = (_d = ownerConnected).setApprovalForAll;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 5: return [4 /*yield*/, _e.apply(_d, [_j.sent(), true])];
                            case 6:
                                _j.sent();
                                _g = (_f = ownerConnected).fetchIsApprovedForAll;
                                return [4 /*yield*/, signer.getAddress()];
                            case 7:
                                _h = [_j.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 8: return [4 /*yield*/, _g.apply(_f, _h.concat([_j.sent()]))];
                            case 9:
                                postApprovedStatus = _j.sent();
                                (0, chai_1.expect)(postApprovedStatus).to.equal(true);
                                return [4 /*yield*/, signerOneConnected.burn(0)];
                            case 10:
                                _j.sent();
                                return [4 /*yield*/, ownerConnected.fetchTotalMedia()];
                            case 11:
                                postTotalSupply = _j.sent();
                                (0, chai_1.expect)(postTotalSupply.toNumber()).to.equal(1);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should burn the token if the caller is approved for all on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preTotalSupply, preApprovedStatus, _a, _b, _c, _d, _e, postApprovedStatus, _f, _g, _h, postTotalSupply;
                    return __generator(this, function (_j) {
                        switch (_j.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1.fetchTotalMedia()];
                            case 1:
                                preTotalSupply = _j.sent();
                                (0, chai_1.expect)(preTotalSupply.toNumber()).to.equal(1);
                                _b = (_a = customMediaSigner1).fetchIsApprovedForAll;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2:
                                _c = [_j.sent()];
                                return [4 /*yield*/, signer.getAddress()];
                            case 3: return [4 /*yield*/, _b.apply(_a, _c.concat([_j.sent()]))];
                            case 4:
                                preApprovedStatus = _j.sent();
                                (0, chai_1.expect)(preApprovedStatus).to.equal(false);
                                _e = (_d = customMediaSigner1).setApprovalForAll;
                                return [4 /*yield*/, signer.getAddress()];
                            case 5: return [4 /*yield*/, _e.apply(_d, [_j.sent(), true])];
                            case 6:
                                _j.sent();
                                _g = (_f = customMediaSigner1).fetchIsApprovedForAll;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 7:
                                _h = [_j.sent()];
                                return [4 /*yield*/, signer.getAddress()];
                            case 8: return [4 /*yield*/, _g.apply(_f, _h.concat([_j.sent()]))];
                            case 9:
                                postApprovedStatus = _j.sent();
                                (0, chai_1.expect)(postApprovedStatus).to.equal(true);
                                return [4 /*yield*/, customMediaSigner0.burn(0)];
                            case 10:
                                _j.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchTotalMedia()];
                            case 11:
                                postTotalSupply = _j.sent();
                                (0, chai_1.expect)(postTotalSupply.toNumber()).to.equal(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should burn a token if the caller is the owner on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var owner, _a, _b, preTotalSupply, postTotalSupply;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 1:
                                owner = _c.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2:
                                _b.apply(_a, [_c.sent()]);
                                return [4 /*yield*/, ownerConnected.fetchTotalMedia()];
                            case 3:
                                preTotalSupply = _c.sent();
                                (0, chai_1.expect)(preTotalSupply.toNumber()).to.equal(2);
                                return [4 /*yield*/, ownerConnected.burn(0)];
                            case 4:
                                _c.sent();
                                return [4 /*yield*/, ownerConnected.fetchTotalMedia()];
                            case 5:
                                postTotalSupply = _c.sent();
                                (0, chai_1.expect)(postTotalSupply.toNumber()).to.equal(1);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should burn a token if the caller is the owner on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preTotalSupply, postTotalSupply;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner0.fetchTotalMedia()];
                            case 1:
                                preTotalSupply = _a.sent();
                                (0, chai_1.expect)(preTotalSupply.toNumber()).to.equal(1);
                                return [4 /*yield*/, customMediaSigner1.burn(0)];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, customMediaSigner1.fetchTotalMedia()];
                            case 3:
                                postTotalSupply = _a.sent();
                                (0, chai_1.expect)(postTotalSupply.toNumber()).to.equal(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#approve", function () {
                it("Should reject if the token id does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = ownerConnected)
                                    .approve;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1: 
                            // Will throw an error due to the token id not existing
                            return [4 /*yield*/, _b.apply(_a, [_c.sent(), 400])
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (approve): TokenId does not exist.")];
                            case 2:
                                // Will throw an error due to the token id not existing
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the token id does not exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = signerOneConnected)
                                    .approve;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1: 
                            // Will throw an error due to the token id not existing on the custom media
                            return [4 /*yield*/, _b.apply(_a, [_c.sent(), 400, customMediaAddress])
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (approve): TokenId does not exist.")];
                            case 2:
                                // Will throw an error due to the token id not existing on the custom media
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the caller is not the owner nor approved for all", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = signerOneConnected)
                                    .approve;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1: 
                            // Will throw an error if the caller is not approved or the owner
                            return [4 /*yield*/, _b.apply(_a, [_c.sent(), 0])
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (approve): Caller is not the owner nor approved for all.")];
                            case 2:
                                // Will throw an error if the caller is not approved or the owner
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the caller is not the owner nor approved for all on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = ownerConnected)
                                    .approve;
                                return [4 /*yield*/, signers[2].getAddress()];
                            case 1: 
                            // Will throw an error if the caller is not approved or the owner on a custom media
                            return [4 /*yield*/, _b.apply(_a, [_c.sent(), 0, customMediaAddress])
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (approve): Caller is not the owner nor approved for all.")];
                            case 2:
                                // Will throw an error if the caller is not approved or the owner on a custom media
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should approve another address for a token", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApprovedAddr, _a, _b, postApprovedStatus, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 1:
                                preApprovedAddr = _e.sent();
                                // Expect the address to equal a zero address
                                (0, chai_1.expect)(preApprovedAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = ownerConnected).approve;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2: 
                            // The owner (signers[0]) approves signerOne for token id 0
                            return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 3:
                                // The owner (signers[0]) approves signerOne for token id 0
                                _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 4:
                                postApprovedStatus = _e.sent();
                                // Expect the address to equal the address of signerOne
                                _d = (_c = (0, chai_1.expect)(postApprovedStatus).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 5:
                                // Expect the address to equal the address of signerOne
                                _d.apply(_c, [_e.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should approve another address for a token on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApprovedAddr, _a, _b, postApprovedAddr, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, signerOneConnected.fetchApproved(0, customMediaAddress)];
                            case 1:
                                preApprovedAddr = _e.sent();
                                // Expect the address to equal a zero address
                                (0, chai_1.expect)(preApprovedAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = signerOneConnected).approve;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: 
                            // signerOne (signers[1]) approves signers[0] for token id 0 on a custom media
                            return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0,
                                    customMediaAddress])];
                            case 3:
                                // signerOne (signers[1]) approves signers[0] for token id 0 on a custom media
                                _e.sent();
                                return [4 /*yield*/, signerOneConnected.fetchApproved(0, customMediaAddress)];
                            case 4:
                                postApprovedAddr = _e.sent();
                                // Expect the address to equal the address of signer (signers[0])
                                _d = (_c = (0, chai_1.expect)(postApprovedAddr).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 5:
                                // Expect the address to equal the address of signer (signers[0])
                                _d.apply(_c, [_e.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should approve another address for a token by a caller who is approved for all", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApprovedStatus, _a, _b, _c, _d, _e, postApprovedStatus, _f, _g, _h, preApprovedAddr, _j, _k, postApprovedAddr, _l, _m;
                    return __generator(this, function (_o) {
                        switch (_o.label) {
                            case 0:
                                _b = (_a = ownerConnected).fetchIsApprovedForAll;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1:
                                _c = [_o.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_o.sent()]))];
                            case 3:
                                preApprovedStatus = _o.sent();
                                // Expect the approval for all status to equal false
                                (0, chai_1.expect)(preApprovedStatus).to.equal(false);
                                _e = (_d = ownerConnected).setApprovalForAll;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 4: 
                            // The owner (signers[0]) sets the approval for all for token id 0
                            return [4 /*yield*/, _e.apply(_d, [_o.sent(), true])];
                            case 5:
                                // The owner (signers[0]) sets the approval for all for token id 0
                                _o.sent();
                                _g = (_f = ownerConnected).fetchIsApprovedForAll;
                                return [4 /*yield*/, signer.getAddress()];
                            case 6:
                                _h = [_o.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 7: return [4 /*yield*/, _g.apply(_f, _h.concat([_o.sent()]))];
                            case 8:
                                postApprovedStatus = _o.sent();
                                // Expect the approval for all status to equal true
                                (0, chai_1.expect)(postApprovedStatus).to.equal(true);
                                return [4 /*yield*/, signerOneConnected.fetchApproved(0)];
                            case 9:
                                preApprovedAddr = _o.sent();
                                // Expect the approved address for token id 0 to equal a zero address
                                (0, chai_1.expect)(preApprovedAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _k = (_j = signerOneConnected).approve;
                                return [4 /*yield*/, signers[2].getAddress()];
                            case 10: 
                            // signerOne (signers[2]) is approved for all for token id 0 and is able to approve (signers[2])
                            return [4 /*yield*/, _k.apply(_j, [_o.sent(), 0])];
                            case 11:
                                // signerOne (signers[2]) is approved for all for token id 0 and is able to approve (signers[2])
                                _o.sent();
                                return [4 /*yield*/, signerOneConnected.fetchApproved(0)];
                            case 12:
                                postApprovedAddr = _o.sent();
                                // Expect the approved address for token id 0 to equal the address of signers[2]
                                _m = (_l = (0, chai_1.expect)(postApprovedAddr).to).equal;
                                return [4 /*yield*/, signers[2].getAddress()];
                            case 13:
                                // Expect the approved address for token id 0 to equal the address of signers[2]
                                _m.apply(_l, [_o.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#fetchApproved", function () {
                it("Should reject if the token id does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected
                                    .fetchApproved(200)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchApproved): TokenId does not exist.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the token id does not exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected
                                    .fetchApproved(200, customMediaAddress)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchApproved): TokenId does not exist.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should fetch the approved address", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var approvedAddr;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 1:
                                approvedAddr = _a.sent();
                                // Expect the address to equal a zero address
                                (0, chai_1.expect)(approvedAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should fetch the approved address on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var approvedAddr;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchApproved(0, customMediaAddress)];
                            case 1:
                                approvedAddr = _a.sent();
                                // Expect the address to equal a zero address
                                (0, chai_1.expect)(approvedAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#setApprovalForAll", function () {
                it("Should set approval for another address for all tokens owned by owner", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApprovalStatus, _a, _b, _c, _d, _e, postApprovalStatus, _f, _g, _h, _j, _k, revoked, _l, _m, _o;
                    return __generator(this, function (_p) {
                        switch (_p.label) {
                            case 0:
                                _b = (_a = ownerConnected).fetchIsApprovedForAll;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1:
                                _c = [_p.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_p.sent()]))];
                            case 3:
                                preApprovalStatus = _p.sent();
                                (0, chai_1.expect)(preApprovalStatus).to.be.false;
                                _e = (_d = ownerConnected).setApprovalForAll;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 4: return [4 /*yield*/, _e.apply(_d, [_p.sent(), true])];
                            case 5:
                                _p.sent();
                                _g = (_f = ownerConnected).fetchIsApprovedForAll;
                                return [4 /*yield*/, signer.getAddress()];
                            case 6:
                                _h = [_p.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 7: return [4 /*yield*/, _g.apply(_f, _h.concat([_p.sent()]))];
                            case 8:
                                postApprovalStatus = _p.sent();
                                (0, chai_1.expect)(postApprovalStatus).to.be.true;
                                _k = (_j = ownerConnected).setApprovalForAll;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 9: return [4 /*yield*/, _k.apply(_j, [_p.sent(), false])];
                            case 10:
                                _p.sent();
                                _m = (_l = ownerConnected).fetchIsApprovedForAll;
                                return [4 /*yield*/, signer.getAddress()];
                            case 11:
                                _o = [_p.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 12: return [4 /*yield*/, _m.apply(_l, _o.concat([_p.sent()]))];
                            case 13:
                                revoked = _p.sent();
                                (0, chai_1.expect)(revoked).to.be.false;
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#transferFrom", function () {
                it("Should transfer token to another address", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var recipient, owner, _a, _b, newOwner;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, signerOne.getAddress()];
                            case 1:
                                recipient = _c.sent();
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 2:
                                owner = _c.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 3:
                                _b.apply(_a, [_c.sent()]);
                                return [4 /*yield*/, ownerConnected.transferFrom(owner, recipient, 0)];
                            case 4:
                                _c.sent();
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 5:
                                newOwner = _c.sent();
                                (0, chai_1.expect)(newOwner).to.equal(recipient);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#safeTransferFrom", function () {
                it("Should revert if the tokenId does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var recipient, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, signerOne.getAddress()];
                            case 1:
                                recipient = _c.sent();
                                _b = (_a = ownerConnected)
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
                    var recipient;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, signerOne.getAddress()];
                            case 1:
                                recipient = _a.sent();
                                return [4 /*yield*/, ownerConnected
                                        .safeTransferFrom(ethers_1.ethers.constants.AddressZero, recipient, 0)
                                        .catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (safeTransferFrom): The (from) address cannot be a zero address.");
                                    })];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should revert if the (to) is a zero address", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = ownerConnected)
                                    .safeTransferFrom;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent(), ethers_1.ethers.constants.AddressZero,
                                    0])
                                    .catch(function (err) {
                                    (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (safeTransferFrom): The (to) address cannot be a zero address.");
                                })];
                            case 2:
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should safe transfer a token to an address", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var recipient, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, signerOne.getAddress()];
                            case 1:
                                recipient = _c.sent();
                                _b = (_a = ownerConnected).safeTransferFrom;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_c.sent(), recipient,
                                    0])];
                            case 3:
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe.skip("#permit", function () {
                it("should allow a wallet to set themselves to approved with a valid signature", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var mainWallet, otherWallet, deadline, domain, nonce, eipSig, approved;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                mainWallet = new ethers_1.ethers.Wallet("0x89e2d8a81beffed50f4d29f642127f18b5c8c1212c54b18ef66a784d0a172819");
                                otherWallet = new ethers_1.ethers.Wallet("0x043192f7a8fb472d04ef7bb0ba1fbb3667198253cc8046e9e56626b804966cb3");
                                deadline = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
                                domain = ownerConnected.eip712Domain();
                                return [4 /*yield*/, ownerConnected.fetchPermitNonce(mainWallet.address, 0)];
                            case 1: return [4 /*yield*/, (_a.sent()).toNumber()];
                            case 2:
                                nonce = _a.sent();
                                return [4 /*yield*/, (0, test_utils_1.signPermitMessage)(mainWallet, otherWallet.address, 0, nonce, deadline, domain)];
                            case 3:
                                eipSig = _a.sent();
                                return [4 /*yield*/, ownerConnected.permit(otherWallet.address, 0, eipSig)];
                            case 4:
                                _a.sent();
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 5:
                                approved = _a.sent();
                                (0, chai_1.expect)(approved.toLowerCase()).to.equal(otherWallet.address.toLowerCase());
                                // test to see if approved for another token. should fail.
                                return [4 /*yield*/, ownerConnected.fetchApproved(1).catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (fetchApproved): TokenId does not exist.");
                                    })];
                            case 6:
                                // test to see if approved for another token. should fail.
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#fetchMedia", function () {
                it("Should get media instance by index in the media contract", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var tokenId;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchMediaByIndex(0)];
                            case 1:
                                tokenId = _a.sent();
                                (0, chai_1.expect)(parseInt(tokenId._hex)).to.equal(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should throw an error index out of range", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchMediaByIndex(1).catch(function (err) {
                                    (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (tokenByIndex): Index out of range.");
                                })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#fetchSignature", function () {
                it("Should fetch the signature of the newly minted nonce", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var sigNonce, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = ownerConnected).fetchMintWithSigNonce;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent()])];
                            case 2:
                                sigNonce = _c.sent();
                                (0, chai_1.expect)(parseInt(sigNonce._hex)).to.equal(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should Revert if address does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected
                                    .fetchMintWithSigNonce("0x9b713D5416884d12a5BbF13Ee08B6038E74CDe")
                                    .catch(function (err) {
                                    (0, chai_1.expect)(err).to.equal("Invariant failed: 0x9b713D5416884d12a5BbF13Ee08B6038E74CDe is not a valid address.");
                                })];
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