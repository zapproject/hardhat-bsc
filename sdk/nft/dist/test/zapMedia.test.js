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
var mocha_1 = require("mocha");
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
    var bidder;
    var mediaFactory;
    var signerOneConnected;
    var ownerConnected;
    var customMediaSigner0;
    var customMediaSigner1;
    var customMediaAddress;
    var bidderMainConnected;
    var bidderCustomConnected;
    var eipSig;
    var signers = (0, test_utils_1.getSigners)(provider);
    var tokenURI = "https://bafkreievpmtbofalpowrcbr5oaok33e6xivii62r6fxh6fontaglngme2m.ipfs.dweb.link/";
    var metadataURI = "https://bafkreihhu7xo7knc3vn42jj26gz3jkvh3uu3rwurkb4djsoo5ayqs2s25a.ipfs.dweb.link/";
    (0, mocha_1.beforeEach)(function () { return __awaiter(void 0, void 0, void 0, function () {
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
                    return [4 /*yield*/, provider.getSigner(2).getAddress()];
                case 7:
                    _b = [
                        _c.sent()
                    ];
                    return [4 /*yield*/, provider.getSigner(3).getAddress()];
                case 8:
                    _b = _b.concat([
                        _c.sent()
                    ]);
                    return [4 /*yield*/, provider.getSigner(4).getAddress()];
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
                    bidderMainConnected = new zapMedia_1.default(1337, signerOne);
                    bidderCustomConnected = new zapMedia_1.default(1337, bidder, customMediaAddress);
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
                    return [4 /*yield*/, customMediaSigner1.mint(mediaDataOne, bidShares)];
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
            describe("#fetchCurrentBidShares", function () {
                it("Should throw an error if the media address is a zero address on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected
                                    .fetchCurrentBidShares(ethers_1.ethers.constants.AddressZero, 0)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchCurrentBidShares): The (mediaAddress) cannot be a zero address.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the MediaAddress is a zero address on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1
                                    .fetchCurrentBidShares(ethers_1.ethers.constants.AddressZero, 0)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchCurrentBidShares): The (mediaAddress) cannot be a zero address.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should return null values if the token id does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var bidShares;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchCurrentBidShares(zapMedia.address, 400)];
                            case 1:
                                bidShares = _a.sent();
                                (0, chai_1.expect)(parseInt(bidShares.creator.value._hex)).to.equal(0);
                                (0, chai_1.expect)(parseInt(bidShares.owner.value._hex)).to.equal(0);
                                (0, chai_1.expect)(bidShares.collaborators).to.have.lengthOf(0);
                                (0, chai_1.expect)(bidShares.collabShares).to.have.lengthOf(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should return null values if the token id does not exist on the customMedia", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var bidShares;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1.fetchCurrentBidShares(customMediaAddress, 300)];
                            case 1:
                                bidShares = _a.sent();
                                (0, chai_1.expect)(parseInt(bidShares.creator.value._hex)).to.equal(0);
                                (0, chai_1.expect)(parseInt(bidShares.owner.value._hex)).to.equal(0);
                                (0, chai_1.expect)(bidShares.collaborators).to.have.lengthOf(0);
                                (0, chai_1.expect)(bidShares.collabShares).to.have.lengthOf(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("should return the bidShares of a token Id on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var onChainBidShares;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchCurrentBidShares(zapMedia.address, 0)];
                            case 1:
                                onChainBidShares = _a.sent();
                                (0, chai_1.expect)(parseInt(onChainBidShares.creator.value._hex)).to.equal(parseInt(bidShares.creator.value._hex));
                                (0, chai_1.expect)(parseInt(onChainBidShares.owner.value._hex)).to.equal(parseInt(bidShares.owner.value._hex));
                                (0, chai_1.expect)(onChainBidShares.collaborators).to.deep.equal(bidShares.collaborators);
                                (0, chai_1.expect)(onChainBidShares.collabShares).to.deep.equal(bidShares.collabShares);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should return the bidShares of a token Id on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var onChainBidShares;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchCurrentBidShares(zapMedia.address, 1)];
                            case 1:
                                onChainBidShares = _a.sent();
                                (0, chai_1.expect)(parseInt(onChainBidShares.creator.value._hex)).to.equal(parseInt(bidShares.creator.value._hex));
                                (0, chai_1.expect)(parseInt(onChainBidShares.owner.value._hex)).to.equal(parseInt(bidShares.owner.value._hex));
                                (0, chai_1.expect)(onChainBidShares.collaborators).to.deep.equal(bidShares.collaborators);
                                (0, chai_1.expect)(onChainBidShares.collabShares).to.deep.equal(bidShares.collabShares);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("should return the bidShares of a token Id on the custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var onChainBidShares;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1.fetchCurrentBidShares(customMediaAddress, 0)];
                            case 1:
                                onChainBidShares = _a.sent();
                                (0, chai_1.expect)(parseInt(onChainBidShares.creator.value._hex)).to.equal(parseInt(bidShares.creator.value._hex));
                                (0, chai_1.expect)(parseInt(onChainBidShares.owner.value._hex)).to.equal(parseInt(bidShares.owner.value._hex));
                                (0, chai_1.expect)(onChainBidShares.collaborators).to.deep.equal(bidShares.collaborators);
                                (0, chai_1.expect)(onChainBidShares.collabShares).to.deep.equal(bidShares.collabShares);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        });
        describe("Write Functions", function () {
            describe("#updateContentURI", function () {
                it("Should reject if the token id does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected
                                    .updateContentURI(4, "https://newTokenURI.com")
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (updateContentURI): TokenId does not exist.")];
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
                                    .updateContentURI(4, "https://newTokenURI.com")
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (updateContentURI): TokenId does not exist.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the tokenURI does not begin with `https://` on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected
                                    .updateContentURI(0, "http://newTokenURI.com")
                                    .should.be.rejectedWith("Invariant failed: http://newTokenURI.com must begin with `https://`")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the tokenURI does not begin with `https://` on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1
                                    .updateContentURI(0, "http://newTokenURI.com")
                                    .should.be.rejectedWith("Invariant failed: http://newTokenURI.com must begin with `https://`")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the caller is not the owner or approved on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, signerOneConnected
                                    .updateContentURI(0, "https://newTokenURI.com")
                                    .should.be.rejectedWith("ZapMedia (updateContentURI): Caller is not approved nor the owner.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the caller is not the owner or approved on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner0
                                    .updateContentURI(0, "https://newTokenURI.com")
                                    .should.be.rejectedWith("ZapMedia (updateContentURI): Caller is not approved nor the owner.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should update the content uri if approved on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApproveAddr, _a, _b, postApproveAddr, _c, _d, tokenURI;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 1:
                                preApproveAddr = _e.sent();
                                (0, chai_1.expect)(preApproveAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = ownerConnected).approve;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 3:
                                _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 4:
                                postApproveAddr = _e.sent();
                                _d = (_c = (0, chai_1.expect)(postApproveAddr).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 5:
                                _d.apply(_c, [_e.sent()]);
                                return [4 /*yield*/, signerOneConnected.updateContentURI(0, "https://newTokenURI.com")];
                            case 6:
                                _e.sent();
                                return [4 /*yield*/, signerOneConnected.fetchContentURI(0)];
                            case 7:
                                tokenURI = _e.sent();
                                (0, chai_1.expect)(tokenURI).to.equal("https://newTokenURI.com");
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should update the content uri if approved on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApproveAddr, _a, _b, postApproveAddr, _c, _d, fetchNewURI;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, customMediaSigner0.fetchApproved(0)];
                            case 1:
                                preApproveAddr = _e.sent();
                                (0, chai_1.expect)(preApproveAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = customMediaSigner1).approve;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 3:
                                _e.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchApproved(0)];
                            case 4:
                                postApproveAddr = _e.sent();
                                _d = (_c = (0, chai_1.expect)(postApproveAddr).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 5:
                                _d.apply(_c, [_e.sent()]);
                                return [4 /*yield*/, customMediaSigner0.updateContentURI(0, "https://newTokenURI.com")];
                            case 6:
                                _e.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchContentURI(0)];
                            case 7:
                                fetchNewURI = _e.sent();
                                (0, chai_1.expect)(fetchNewURI).to.equal("https://newTokenURI.com");
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should update the content uri on the main media by owner", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var fetchTokenURI, fetchNewURI;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchContentURI(0)];
                            case 1:
                                fetchTokenURI = _a.sent();
                                (0, chai_1.expect)(fetchTokenURI).to.equal(mediaDataOne.tokenURI);
                                return [4 /*yield*/, ownerConnected.updateContentURI(0, "https://newTokenURI.com")];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, ownerConnected.fetchContentURI(0)];
                            case 3:
                                fetchNewURI = _a.sent();
                                (0, chai_1.expect)(fetchNewURI).to.equal("https://newTokenURI.com");
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should update the content uri on a custom media by owner", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var fetchNewURI;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1.updateContentURI(0, "https://newTokenURI.com")];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, customMediaSigner1.fetchContentURI(0)];
                            case 2:
                                fetchNewURI = _a.sent();
                                (0, chai_1.expect)(fetchNewURI).to.equal("https://newTokenURI.com");
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#updateMetadataURI", function () {
                it("Should reject if the metadataURI does not begin with `https://` on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected
                                    .updateMetadataURI(0, "http://newMetadataURI.com")
                                    .should.be.rejectedWith("Invariant failed: http://newMetadataURI.com must begin with `https://`")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the metadataURI does not begin with `https://` on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1
                                    .updateMetadataURI(0, "http://newMetadataURI.com")
                                    .should.be.rejectedWith("Invariant failed: http://newMetadataURI.com must begin with `https://`")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the token id does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected
                                    .updateMetadataURI(1001, "https://newMetadataURI.com")
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (updateMetadataURI): TokenId does not exist.")];
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
                                    .updateMetadataURI(1001, "https://newMetadataURI.com")
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (updateMetadataURI): TokenId does not exist.")];
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
                                    .updateMetadataURI(0, "https://newMetadataURI.com")
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (updateMetadataURI): Caller is not approved nor the owner.")];
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
                                    .updateMetadataURI(0, "https://newMetadataURI.com")
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (updateMetadataURI): Caller is not approved nor the owner.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should update the metadata uri by the approved on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApproveAddr, _a, _b, postApproveAddr, _c, _d, newMetadataURI;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 1:
                                preApproveAddr = _e.sent();
                                (0, chai_1.expect)(preApproveAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = ownerConnected).approve;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 3:
                                _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 4:
                                postApproveAddr = _e.sent();
                                _d = (_c = (0, chai_1.expect)(postApproveAddr).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 5:
                                _d.apply(_c, [_e.sent()]);
                                return [4 /*yield*/, signerOneConnected.updateMetadataURI(0, "https://newMetadataURI.com")];
                            case 6:
                                _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchMetadataURI(0)];
                            case 7:
                                newMetadataURI = _e.sent();
                                (0, chai_1.expect)(newMetadataURI).to.equal("https://newMetadataURI.com");
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should update the metadata uri by the approved on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApproveAddr, _a, _b, postApproveAddr, _c, _d, newMetadataURI;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1.fetchApproved(0)];
                            case 1:
                                preApproveAddr = _e.sent();
                                (0, chai_1.expect)(preApproveAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = customMediaSigner1).approve;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 3:
                                _e.sent();
                                return [4 /*yield*/, customMediaSigner1.fetchApproved(0)];
                            case 4:
                                postApproveAddr = _e.sent();
                                _d = (_c = (0, chai_1.expect)(postApproveAddr).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 5:
                                _d.apply(_c, [_e.sent()]);
                                return [4 /*yield*/, customMediaSigner0.updateMetadataURI(0, "https://newMetadataURI.com")];
                            case 6:
                                _e.sent();
                                return [4 /*yield*/, customMediaSigner1.fetchMetadataURI(0)];
                            case 7:
                                newMetadataURI = _e.sent();
                                (0, chai_1.expect)(newMetadataURI).to.equal("https://newMetadataURI.com");
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should update the metadata uri by the owner on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var newMetadataURI;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected.updateMetadataURI(0, "https://newMetadataURI.com")];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, ownerConnected.fetchMetadataURI(0)];
                            case 2:
                                newMetadataURI = _a.sent();
                                (0, chai_1.expect)(newMetadataURI).to.equal("https://newMetadataURI.com");
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should update the metadata uri by the owner on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var newMetadataURI;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1.updateMetadataURI(0, "https://newMetadataURI.com")];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchMetadataURI(0)];
                            case 2:
                                newMetadataURI = _a.sent();
                                (0, chai_1.expect)(newMetadataURI).to.equal("https://newMetadataURI.com");
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#mint", function () {
                it("Should reject if the bid shares do not sum to 100 on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                return [4 /*yield*/, ownerConnected
                                        .mint(mediaDataOne, bidShares)
                                        .should.be.rejectedWith("Invariant failed: The BidShares sum to ".concat(bidShareSum, ", but they must sum to 100000000000000000000"))];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the bid shares do not sum to 100 on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                return [4 /*yield*/, customMediaSigner1
                                        .mint(mediaDataOne, bidShares)
                                        .should.be.rejectedWith("Invariant failed: The BidShares sum to ".concat(bidShareSum, ", but they must sum to 100000000000000000000"))];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should be able to mint on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preTotalSupply, owner0, creator0, onChainBidShares, onChainContentURI0, onChainMetadataURI0, _a, _b, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchTotalMedia()];
                            case 1:
                                preTotalSupply = (_e.sent()).toNumber();
                                // Expect the total amount of tokens minted on the main media to equal 2
                                (0, chai_1.expect)(preTotalSupply).to.equal(2);
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 2:
                                owner0 = _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchCreator(0)];
                            case 3:
                                creator0 = _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchCurrentBidShares(zapMedia.address, 0)];
                            case 4:
                                onChainBidShares = _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchContentURI(0)];
                            case 5:
                                onChainContentURI0 = _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchMetadataURI(0)];
                            case 6:
                                onChainMetadataURI0 = _e.sent();
                                // Expect the returned owner address to equal signers[0] address
                                _b = (_a = (0, chai_1.expect)(owner0).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 7:
                                // Expect the returned owner address to equal signers[0] address
                                _b.apply(_a, [_e.sent()]);
                                // Expect the returned creator address to equal signers[0] address
                                _d = (_c = (0, chai_1.expect)(creator0).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 8:
                                // Expect the returned creator address to equal signers[0] address
                                _d.apply(_c, [_e.sent()]);
                                // Expect the returned content URI to equal the tokenURI set on mint
                                (0, chai_1.expect)(onChainContentURI0).to.equal(mediaDataOne.tokenURI);
                                // Expect the metadata URI to equal the metadataURI set on mint
                                (0, chai_1.expect)(onChainMetadataURI0).to.equal(mediaDataOne.metadataURI);
                                // Expect the retuned bidShares creator to equal the signers[0] address
                                (0, chai_1.expect)(parseInt(onChainBidShares.creator.value)).to.equal(parseInt(bidShares.creator.value));
                                // Expect the returned bidShares owner to equal the signers[0] address
                                (0, chai_1.expect)(parseInt(onChainBidShares.owner.value)).to.equal(parseInt(onChainBidShares.owner.value));
                                // Expect the returned bidShares collaborators to equal the collaborators set on mint
                                (0, chai_1.expect)(onChainBidShares.collaborators).to.eql(bidShares.collaborators);
                                // Expect the returned bidShares collaboShares to equal the collabShares set on mint
                                (0, chai_1.expect)(onChainBidShares.collabShares).to.eql(bidShares.collabShares);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should be able to mint on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preTotalSupply, owner, creator, onChainBidShares, onChainContentURI, onChainMetadataURI, _a, _b, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, customMediaSigner0.fetchTotalMedia()];
                            case 1:
                                preTotalSupply = (_e.sent()).toNumber();
                                // Expect the total amount of tokens minted on a custom media to equal 1
                                (0, chai_1.expect)(preTotalSupply).to.equal(1);
                                return [4 /*yield*/, customMediaSigner0.fetchOwnerOf(0)];
                            case 2:
                                owner = _e.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchCreator(0)];
                            case 3:
                                creator = _e.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchCurrentBidShares(customMediaAddress, 0)];
                            case 4:
                                onChainBidShares = _e.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchContentURI(0)];
                            case 5:
                                onChainContentURI = _e.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchMetadataURI(0)];
                            case 6:
                                onChainMetadataURI = _e.sent();
                                // Expect the returned owner address to equal signers[1] address
                                _b = (_a = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 7:
                                // Expect the returned owner address to equal signers[1] address
                                _b.apply(_a, [_e.sent()]);
                                // Expect the returned creator address to equal signers[1] address
                                _d = (_c = (0, chai_1.expect)(creator).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 8:
                                // Expect the returned creator address to equal signers[1] address
                                _d.apply(_c, [_e.sent()]);
                                // Expect the returned content URI to equal the tokenURI set on mint
                                (0, chai_1.expect)(onChainContentURI).to.equal(mediaDataOne.tokenURI);
                                // Expect the metadata URI to equal the metadataURI set on mint
                                (0, chai_1.expect)(onChainMetadataURI).to.equal(mediaDataOne.metadataURI);
                                // Expect the retuned bidShares creator to equal the signers[1] address
                                (0, chai_1.expect)(parseInt(onChainBidShares.creator.value)).to.equal(parseInt(bidShares.creator.value));
                                // Expect the returned bidShares owner to equal the signers[1] address
                                (0, chai_1.expect)(parseInt(onChainBidShares.owner.value)).to.equal(parseInt(onChainBidShares.owner.value));
                                // Expect the returned bidShares collaborators to equal the collaborators set on mint
                                (0, chai_1.expect)(onChainBidShares.collaborators).to.eql(bidShares.collaborators);
                                // Expect the returned bidShares collaboShares to equal the collabShares set on mint
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
                it("Should throw an error if the signer is not approved nor the owner of the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var owner, getApproved, _a, _b, _c, _d, _e, _f;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(token.address, 100);
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
                it("Should throw an error if the signer is not approved nor the owner of a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var owner, getApproved, _a, _b, _c, _d, _e, _f;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(token.address, 100);
                                return [4 /*yield*/, customMediaSigner1.fetchOwnerOf(0)];
                            case 1:
                                owner = _g.sent();
                                return [4 /*yield*/, customMediaSigner1.fetchApproved(0)];
                            case 2:
                                getApproved = _g.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to.not).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 3:
                                _b.apply(_a, [_g.sent()]);
                                _d = (_c = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 4:
                                _d.apply(_c, [_g.sent()]);
                                _f = (_e = (0, chai_1.expect)(getApproved).to.not).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 5:
                                _f.apply(_e, [_g.sent()]);
                                (0, chai_1.expect)(getApproved).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [4 /*yield*/, customMediaSigner0.setAsk(0, ask).catch(function (err) {
                                        (0, chai_1.expect)(err.message).to.equal("Invariant failed: ZapMedia (setAsk): Media: Only approved or owner.");
                                    })];
                            case 6:
                                _g.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should set an ask by the owner on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var owner, _a, _b, onChainAsk;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(token.address, 100);
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 1:
                                owner = _c.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2:
                                _b.apply(_a, [_c.sent()]);
                                return [4 /*yield*/, ownerConnected.setAsk(0, ask)];
                            case 3:
                                _c.sent();
                                return [4 /*yield*/, ownerConnected.fetchCurrentAsk(zapMedia.address, 0)];
                            case 4:
                                onChainAsk = _c.sent();
                                (0, chai_1.expect)(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
                                (0, chai_1.expect)(onChainAsk.currency).to.equal(token.address);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should set an ask by the owner of a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var owner, _a, _b, onChainAsk;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(token.address, 100);
                                return [4 /*yield*/, customMediaSigner1.fetchOwnerOf(0)];
                            case 1:
                                owner = _c.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2:
                                _b.apply(_a, [_c.sent()]);
                                return [4 /*yield*/, customMediaSigner1.setAsk(0, ask)];
                            case 3:
                                _c.sent();
                                return [4 /*yield*/, customMediaSigner1.fetchCurrentAsk(customMediaAddress, 0)];
                            case 4:
                                onChainAsk = _c.sent();
                                (0, chai_1.expect)(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
                                (0, chai_1.expect)(onChainAsk.currency).to.equal(token.address);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should set an ask by the approved on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, owner, _c, _d, getApproved, _e, _f, onChainAsk;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(token.address, 100);
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
                                (0, chai_1.expect)(onChainAsk.currency).to.equal(token.address);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should set an ask by the approved on the custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, owner, _c, _d, getApproved, _e, _f, onChainAsk;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(token.address, 100);
                                _b = (_a = customMediaSigner1).approve;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_g.sent(), 0])];
                            case 2:
                                _g.sent();
                                return [4 /*yield*/, customMediaSigner1.fetchOwnerOf(0)];
                            case 3:
                                owner = _g.sent();
                                _d = (_c = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 4:
                                _d.apply(_c, [_g.sent()]);
                                return [4 /*yield*/, customMediaSigner1.fetchApproved(0)];
                            case 5:
                                getApproved = _g.sent();
                                _f = (_e = (0, chai_1.expect)(getApproved).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 6:
                                _f.apply(_e, [_g.sent()]);
                                return [4 /*yield*/, customMediaSigner0.setAsk(0, ask)];
                            case 7:
                                _g.sent();
                                return [4 /*yield*/, customMediaSigner1.fetchCurrentAsk(customMediaAddress, 0)];
                            case 8:
                                onChainAsk = _g.sent();
                                (0, chai_1.expect)(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
                                (0, chai_1.expect)(onChainAsk.currency).to.equal(token.address);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#setbid", function () {
                var bidder;
                var bid;
                var bidderMainConnected;
                var bidderCustomConnected;
                (0, mocha_1.beforeEach)(function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                bidderMainConnected = new zapMedia_1.default(1337, bidder);
                                // The bidder(signer[2]) is connected to a custom media class as a signer
                                bidderCustomConnected = new zapMedia_1.default(1337, bidder, customMediaAddress);
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
                it("Should reject if the token id does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            // The bidder(signers[2]) attempts to setBid on a non existent token
                            return [4 /*yield*/, bidderMainConnected
                                    .setBid(300, bid)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (setBid): TokenId does not exist.")];
                            case 1:
                                // The bidder(signers[2]) attempts to setBid on a non existent token
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the tokenID does not exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            // The bidder(signers[2]) attempts to setBid on a non existent token
                            return [4 /*yield*/, bidderCustomConnected
                                    .setBid(30, bid)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (setBid): TokenId does not exist.")];
                            case 1:
                                // The bidder(signers[2]) attempts to setBid on a non existent token
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the bid currency is a zero address on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                // The bidder attempts to set a bid with the currency as a zero address
                                return [4 /*yield*/, bidderMainConnected
                                        .setBid(0, bid)
                                        .should.be.rejectedWith("Invariant failed: ZapMedia (setBid): Currency cannot be a zero address.")];
                            case 2:
                                // The bidder attempts to set a bid with the currency as a zero address
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the bid currency is a zero address on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                // The bidder attempts to set a bid with the currency as a zero address
                                return [4 /*yield*/, bidderCustomConnected
                                        .setBid(0, bid)
                                        .should.be.rejectedWith("Invariant failed: ZapMedia (setBid): Currency cannot be a zero address.")];
                            case 2:
                                // The bidder attempts to set a bid with the currency as a zero address
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the bid recipient is a zero address on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                return [4 /*yield*/, bidderMainConnected
                                        .setBid(0, bid)
                                        .should.be.rejectedWith("Invariant failed: ZapMedia (setBid): Recipient cannot be a zero address.")];
                            case 2:
                                // The bidder attempts to set a bid with the recipient as a zero address
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the bid recipient is a zero address on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                return [4 /*yield*/, bidderCustomConnected
                                        .setBid(0, bid)
                                        .should.be.rejectedWith("Invariant failed: ZapMedia (setBid): Recipient cannot be a zero address.")];
                            case 2:
                                // The bidder attempts to set a bid with the recipient as a zero address
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the bid amount is zero on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                return [4 /*yield*/, bidderMainConnected
                                        .setBid(0, bid)
                                        .should.be.rejectedWith("Invariant failed: ZapMedia (setBid): Amount cannot be zero.")];
                            case 2:
                                // The bidder attempts to set a bid with zero tokens
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the bid amount is zero on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                return [4 /*yield*/, bidderCustomConnected
                                        .setBid(0, bid)
                                        .should.be.rejectedWith("Invariant failed: ZapMedia (setBid): Amount cannot be zero.")];
                            case 2:
                                // The bidder attempts to set a bid with zero tokens
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should set a bid on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                return [4 /*yield*/, bidderMainConnected.setBid(0, bid)];
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
                it("Should set a bid on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var bidderPreBal, _a, _b, nullOnChainBid, _c, _d, _e, bidderPostBal, _f, _g, onChainBid, _h, _j, _k;
                    return __generator(this, function (_l) {
                        switch (_l.label) {
                            case 0:
                                _b = (_a = token).balanceOf;
                                return [4 /*yield*/, bidder.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_l.sent()])];
                            case 2:
                                bidderPreBal = _l.sent();
                                _d = (_c = customMediaSigner1).fetchCurrentBidForBidder;
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
                                return [4 /*yield*/, bidderCustomConnected.setBid(0, bid)];
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
                                _j = (_h = customMediaSigner0).fetchCurrentBidForBidder;
                                _k = [customMediaAddress,
                                    0];
                                return [4 /*yield*/, bidder.getAddress()];
                            case 9: return [4 /*yield*/, _j.apply(_h, _k.concat([_l.sent()]))];
                            case 10:
                                onChainBid = _l.sent();
                                // The returned bid amount should equal the bid amount configured in the setBid function
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
                it("Should refund the original bid if the bidder bids again on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                return [4 /*yield*/, bidderMainConnected.setBid(0, bid)];
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
                                return [4 /*yield*/, bidderMainConnected.setBid(0, bid)];
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
                it("Should refund the original bid if the bidder bids again on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                return [4 /*yield*/, bidderCustomConnected.setBid(0, bid)];
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
                                return [4 /*yield*/, bidderCustomConnected.setBid(0, bid)];
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
                        var fetchAsk;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ownerConnected.fetchCurrentAsk(ethers_1.ethers.constants.AddressZero, 0)];
                                case 1:
                                    fetchAsk = _a.sent();
                                    (0, chai_1.expect)(fetchAsk.currency).to.equal(ethers_1.ethers.constants.AddressZero);
                                    (0, chai_1.expect)(parseInt(fetchAsk.amount.toString())).to.equal(0);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it("Should return null values if the token id does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var fetchAsk;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ownerConnected.fetchCurrentAsk(zapMedia.address, 10)];
                                case 1:
                                    fetchAsk = _a.sent();
                                    (0, chai_1.expect)(fetchAsk.currency).to.equal(ethers_1.ethers.constants.AddressZero);
                                    (0, chai_1.expect)(parseInt(fetchAsk.amount.toString())).to.equal(0);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it("Should return null values if the token id does not exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var fetchAsk;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, customMediaSigner1.fetchCurrentAsk(customMediaAddress, 10)];
                                case 1:
                                    fetchAsk = _a.sent();
                                    (0, chai_1.expect)(fetchAsk.currency).to.equal(ethers_1.ethers.constants.AddressZero);
                                    (0, chai_1.expect)(parseInt(fetchAsk.amount.toString())).to.equal(0);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it("Should fetch the current ask on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var fetchAsk;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    ask = (0, utils_2.constructAsk)(token.address, 100);
                                    return [4 /*yield*/, ownerConnected.setAsk(0, ask)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, ownerConnected.fetchCurrentAsk(zapMedia.address, 0)];
                                case 2:
                                    fetchAsk = _a.sent();
                                    (0, chai_1.expect)(parseInt(fetchAsk.amount.toString())).to.equal(ask.amount);
                                    (0, chai_1.expect)(fetchAsk.currency).to.equal(token.address);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it("Should fetch the current ask on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var fetchAsk;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    ask = (0, utils_2.constructAsk)(token.address, 100);
                                    return [4 /*yield*/, customMediaSigner1.setAsk(0, ask)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, ownerConnected.fetchCurrentAsk(customMediaAddress, 0)];
                                case 2:
                                    fetchAsk = _a.sent();
                                    (0, chai_1.expect)(parseInt(fetchAsk.amount.toString())).to.equal(ask.amount);
                                    (0, chai_1.expect)(fetchAsk.currency).to.equal(token.address);
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
                it("Should reject if the tokenId does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(token.address, 100);
                                return [4 /*yield*/, ownerConnected
                                        .removeAsk(400)
                                        .should.be.rejectedWith("Invariant failed: ZapMedia (removeAsk): TokenId does not exist.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the tokenId does not exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(customMediaAddress, 100);
                                return [4 /*yield*/, customMediaSigner1
                                        .removeAsk(400)
                                        .should.be.rejectedWith("Invariant failed: ZapMedia (removeAsk): TokenId does not exist.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the ask was never set on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected
                                    .removeAsk(0)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (removeAsk): Ask was never set.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the ask was never set on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner1
                                    .removeAsk(0)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (removeAsk): Ask was never set.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should remove an ask on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var owner, _a, _b, getApproved, onChainAsk, onChainAskRemoved;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(token.address, 100);
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
                                (0, chai_1.expect)(onChainAsk.currency).to.equal(token.address);
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
                it("Should remove an ask on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var owner, _a, _b, getApproved, onChainAsk, onChainAskRemoved;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                ask = (0, utils_2.constructAsk)(token.address, 100);
                                return [4 /*yield*/, customMediaSigner0.fetchOwnerOf(0)];
                            case 1:
                                owner = _c.sent();
                                _b = (_a = (0, chai_1.expect)(owner).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2:
                                _b.apply(_a, [_c.sent()]);
                                return [4 /*yield*/, customMediaSigner0.fetchApproved(0)];
                            case 3:
                                getApproved = _c.sent();
                                (0, chai_1.expect)(getApproved).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [4 /*yield*/, customMediaSigner1.setAsk(0, ask)];
                            case 4:
                                _c.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchCurrentAsk(customMediaAddress, 0)];
                            case 5:
                                onChainAsk = _c.sent();
                                (0, chai_1.expect)(parseInt(onChainAsk.amount.toString())).to.equal(ask.amount);
                                (0, chai_1.expect)(onChainAsk.currency).to.equal(token.address);
                                return [4 /*yield*/, customMediaSigner1.removeAsk(0)];
                            case 6:
                                _c.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchCurrentAsk(customMediaAddress, 0)];
                            case 7:
                                onChainAskRemoved = _c.sent();
                                (0, chai_1.expect)(parseInt(onChainAskRemoved.amount.toString())).to.equal(0);
                                (0, chai_1.expect)(onChainAskRemoved.currency).to.equal(ethers_1.ethers.constants.AddressZero);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#removeBid", function () {
                var mainBid;
                var customBid;
                var bidderCustomConnected;
                (0, mocha_1.beforeEach)(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c, _d, _e, _f;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                _a = utils_2.constructBid;
                                _b = [token.address,
                                    200];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1:
                                _b = _b.concat([_g.sent()]);
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2:
                                mainBid = _a.apply(void 0, _b.concat([_g.sent(), 10]));
                                _c = utils_2.constructBid;
                                _d = [token.address,
                                    300];
                                return [4 /*yield*/, signer.getAddress()];
                            case 3:
                                _d = _d.concat([_g.sent()]);
                                return [4 /*yield*/, signer.getAddress()];
                            case 4:
                                customBid = _c.apply(void 0, _d.concat([_g.sent(), 10]));
                                _f = (_e = token).mint;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 5: return [4 /*yield*/, _f.apply(_e, [_g.sent(), 200])];
                            case 6:
                                _g.sent();
                                return [4 /*yield*/, token
                                        .connect(signerOne)
                                        .approve(zapMarket.address, mainBid.amount)];
                            case 7:
                                _g.sent();
                                return [4 /*yield*/, token
                                        .connect(signer)
                                        .approve(zapMarket.address, customBid.amount)];
                            case 8:
                                _g.sent();
                                bidderCustomConnected = new zapMedia_1.default(1337, signer, customMediaAddress);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the token id does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preBidBal, _a, _b, preMarketBal, postBidBal, _c, _d, postMarketBal;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                _b = (_a = token).balanceOf;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_e.sent()])];
                            case 2:
                                preBidBal = _e.sent();
                                (0, chai_1.expect)(parseInt(preBidBal)).to.equal(mainBid.amount);
                                return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 3:
                                preMarketBal = _e.sent();
                                (0, chai_1.expect)(parseInt(preMarketBal)).to.equal(0);
                                return [4 /*yield*/, signerOneConnected.setBid(0, mainBid)];
                            case 4:
                                _e.sent();
                                _d = (_c = token).balanceOf;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 5: return [4 /*yield*/, _d.apply(_c, [_e.sent()])];
                            case 6:
                                postBidBal = _e.sent();
                                (0, chai_1.expect)(parseInt(postBidBal)).to.equal(0);
                                return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 7:
                                postMarketBal = _e.sent();
                                (0, chai_1.expect)(parseInt(postMarketBal)).to.equal(mainBid.amount);
                                return [4 /*yield*/, signerOneConnected
                                        .removeBid(200)
                                        .should.be.rejectedWith("Invariant failed: ZapMedia (removeBid): The token id does not exist.")];
                            case 8:
                                _e.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the token id does not exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preBidBal, _a, _b, preMarketBal, postBidBal, _c, _d, postMarketBal;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                _b = (_a = token).balanceOf;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_e.sent()])];
                            case 2:
                                preBidBal = _e.sent();
                                (0, chai_1.expect)(parseInt(preBidBal)).to.equal(520000000e18);
                                return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 3:
                                preMarketBal = _e.sent();
                                (0, chai_1.expect)(parseInt(preMarketBal)).to.equal(0);
                                return [4 /*yield*/, bidderCustomConnected.setBid(0, customBid)];
                            case 4:
                                _e.sent();
                                _d = (_c = token).balanceOf;
                                return [4 /*yield*/, signer.getAddress()];
                            case 5: return [4 /*yield*/, _d.apply(_c, [_e.sent()])];
                            case 6:
                                postBidBal = _e.sent();
                                (0, chai_1.expect)(parseInt(postBidBal)).to.equal(520000000e18 - 200);
                                return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 7:
                                postMarketBal = _e.sent();
                                (0, chai_1.expect)(parseInt(postMarketBal)).to.equal(customBid.amount);
                                return [4 /*yield*/, bidderCustomConnected
                                        .removeBid(200)
                                        .should.be.rejectedWith("Invariant failed: ZapMedia (removeBid): The token id does not exist.")];
                            case 8:
                                _e.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should remove a bid on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preBidBal, _a, _b, preMarketBal, postBidBal, _c, _d, postMarketBal, bidderRemoveBal, _e, _f, marketRemoveBal;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                _b = (_a = token).balanceOf;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_g.sent()])];
                            case 2:
                                preBidBal = _g.sent();
                                (0, chai_1.expect)(parseInt(preBidBal)).to.equal(mainBid.amount);
                                return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 3:
                                preMarketBal = _g.sent();
                                (0, chai_1.expect)(parseInt(preMarketBal)).to.equal(0);
                                return [4 /*yield*/, signerOneConnected.setBid(0, mainBid)];
                            case 4:
                                _g.sent();
                                _d = (_c = token).balanceOf;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 5: return [4 /*yield*/, _d.apply(_c, [_g.sent()])];
                            case 6:
                                postBidBal = _g.sent();
                                (0, chai_1.expect)(parseInt(postBidBal)).to.equal(0);
                                return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 7:
                                postMarketBal = _g.sent();
                                (0, chai_1.expect)(parseInt(postMarketBal)).to.equal(mainBid.amount);
                                return [4 /*yield*/, signerOneConnected.removeBid(0)];
                            case 8:
                                _g.sent();
                                _f = (_e = token).balanceOf;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 9: return [4 /*yield*/, _f.apply(_e, [_g.sent()])];
                            case 10:
                                bidderRemoveBal = _g.sent();
                                (0, chai_1.expect)(parseInt(bidderRemoveBal)).to.equal(parseInt(preBidBal));
                                return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 11:
                                marketRemoveBal = _g.sent();
                                (0, chai_1.expect)(parseInt(marketRemoveBal)).to.equal(parseInt(preMarketBal));
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should remove a bid on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preBidBal, _a, _b, preMarketBal, postBidBal, _c, _d, postMarketBal, bidderRemoveBal, _e, _f, marketRemoveBal;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                _b = (_a = token).balanceOf;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_g.sent()])];
                            case 2:
                                preBidBal = _g.sent();
                                (0, chai_1.expect)(parseInt(preBidBal)).to.equal(520000000e18);
                                return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 3:
                                preMarketBal = _g.sent();
                                (0, chai_1.expect)(parseInt(preMarketBal)).to.equal(0);
                                return [4 /*yield*/, bidderCustomConnected.setBid(0, customBid)];
                            case 4:
                                _g.sent();
                                _d = (_c = token).balanceOf;
                                return [4 /*yield*/, signer.getAddress()];
                            case 5: return [4 /*yield*/, _d.apply(_c, [_g.sent()])];
                            case 6:
                                postBidBal = _g.sent();
                                (0, chai_1.expect)(parseInt(postBidBal)).to.equal(520000000e18 - 200);
                                return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 7:
                                postMarketBal = _g.sent();
                                (0, chai_1.expect)(parseInt(postMarketBal)).to.equal(customBid.amount);
                                return [4 /*yield*/, bidderCustomConnected.removeBid(0)];
                            case 8:
                                _g.sent();
                                _f = (_e = token).balanceOf;
                                return [4 /*yield*/, signer.getAddress()];
                            case 9: return [4 /*yield*/, _f.apply(_e, [_g.sent()])];
                            case 10:
                                bidderRemoveBal = _g.sent();
                                (0, chai_1.expect)(parseInt(bidderRemoveBal)).to.equal(parseInt(preBidBal));
                                return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 11:
                                marketRemoveBal = _g.sent();
                                (0, chai_1.expect)(parseInt(marketRemoveBal)).to.equal(parseInt(preMarketBal));
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#acceptBid", function () {
                var bid;
                var customBid;
                (0, mocha_1.beforeEach)(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c, _d, _e, _f;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                _a = utils_2.constructBid;
                                _b = [token.address,
                                    200];
                                return [4 /*yield*/, signer.getAddress()];
                            case 1:
                                _b = _b.concat([_g.sent()]);
                                return [4 /*yield*/, signer.getAddress()];
                            case 2:
                                customBid = _a.apply(void 0, _b.concat([_g.sent(), 10]));
                                _c = utils_2.constructBid;
                                _d = [token.address,
                                    200];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 3:
                                _d = _d.concat([_g.sent()]);
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 4:
                                bid = _c.apply(void 0, _d.concat([_g.sent(), 10]));
                                _f = (_e = token).mint;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 5: 
                            //signer one mints tokens on their own address
                            return [4 /*yield*/, _f.apply(_e, [_g.sent(), 200])];
                            case 6:
                                //signer one mints tokens on their own address
                                _g.sent();
                                return [4 /*yield*/, token.connect(signerOne).approve(zapMarket.address, bid.amount)];
                            case 7:
                                _g.sent();
                                return [4 /*yield*/, token
                                        .connect(signer)
                                        .approve(zapMarket.address, customBid.amount)];
                            case 8:
                                _g.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the token id does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            //set bid for signer one
                            return [4 /*yield*/, bidderMainConnected.setBid(0, bid)];
                            case 1:
                                //set bid for signer one
                                _a.sent();
                                //attempting to accept the bid with invalid tokenID
                                return [4 /*yield*/, ownerConnected
                                        .acceptBid(10, bid)
                                        .should.rejectedWith("Invariant failed: ZapMedia (acceptBid): The token id does not exist.")];
                            case 2:
                                //attempting to accept the bid with invalid tokenID
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the token id does not exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner0.setBid(0, customBid)];
                            case 1:
                                _a.sent();
                                //attempting to accept the bid with invalid tokenID
                                return [4 /*yield*/, customMediaSigner1
                                        .acceptBid(10, customBid)
                                        .should.rejectedWith("Invariant failed: ZapMedia (acceptBid): The token id does not exist.")];
                            case 2:
                                //attempting to accept the bid with invalid tokenID
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("should accept a bid on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preMarketbal, preBidBal, postMarketbal, postBidBal, preOwnerBal, _a, _b, preCollabOne, _c, _d, preCollabTwo, _e, _f, preCollabThree, _g, _h, postOwnerBal, _j, _k, newOwner, _l, _m, postCollabOne, postCollabTwo, postCollabThree;
                    return __generator(this, function (_o) {
                        switch (_o.label) {
                            case 0: return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 1:
                                preMarketbal = _o.sent();
                                (0, chai_1.expect)(parseInt(preMarketbal)).to.equal(0);
                                return [4 /*yield*/, token.balanceOf(signerOne.getAddress())];
                            case 2:
                                preBidBal = _o.sent();
                                (0, chai_1.expect)(parseInt(preBidBal)).to.equal(200);
                                //set bid for signer one
                                return [4 /*yield*/, bidderMainConnected.setBid(0, bid)];
                            case 3:
                                //set bid for signer one
                                _o.sent();
                                return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 4:
                                postMarketbal = _o.sent();
                                (0, chai_1.expect)(parseInt(postMarketbal)).to.equal(200);
                                return [4 /*yield*/, token.balanceOf(signerOne.getAddress())];
                            case 5:
                                postBidBal = _o.sent();
                                //expecting that signer one's post balance is zero
                                (0, chai_1.expect)(parseInt(postBidBal)).to.equal(parseInt(preBidBal) - parseInt(bid.amount.toString()));
                                _b = (_a = token).balanceOf;
                                return [4 /*yield*/, signer.getAddress()];
                            case 6: return [4 /*yield*/, _b.apply(_a, [_o.sent()])];
                            case 7:
                                preOwnerBal = _o.sent();
                                (0, chai_1.expect)(parseInt(preOwnerBal)).to.equal(520000000e18);
                                _d = (_c = token).balanceOf;
                                return [4 /*yield*/, bidShares.collaborators[0]];
                            case 8: return [4 /*yield*/, _d.apply(_c, [_o.sent()])];
                            case 9:
                                preCollabOne = _o.sent();
                                (0, chai_1.expect)(parseInt(preCollabOne)).to.equal(0);
                                _f = (_e = token).balanceOf;
                                return [4 /*yield*/, bidShares.collaborators[1]];
                            case 10: return [4 /*yield*/, _f.apply(_e, [_o.sent()])];
                            case 11:
                                preCollabTwo = _o.sent();
                                (0, chai_1.expect)(parseInt(preCollabTwo)).to.equal(0);
                                _h = (_g = token).balanceOf;
                                return [4 /*yield*/, bidShares.collaborators[2]];
                            case 12: return [4 /*yield*/, _h.apply(_g, [_o.sent()])];
                            case 13:
                                preCollabThree = _o.sent();
                                (0, chai_1.expect)(parseInt(preCollabThree)).to.equal(0);
                                //owner on main media has to accept the bid
                                return [4 /*yield*/, ownerConnected.acceptBid(0, bid)];
                            case 14:
                                //owner on main media has to accept the bid
                                _o.sent();
                                _k = (_j = token).balanceOf;
                                return [4 /*yield*/, signer.getAddress()];
                            case 15: return [4 /*yield*/, _k.apply(_j, [_o.sent()])];
                            case 16:
                                postOwnerBal = _o.sent();
                                //post owner's balance increase by 35% bidshares
                                (0, chai_1.expect)(parseInt(postOwnerBal)).to.equal(parseInt(preOwnerBal) + parseInt(bid.amount.toString()) * 0.35);
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 17:
                                newOwner = _o.sent();
                                _m = (_l = (0, chai_1.expect)(newOwner).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 18:
                                _m.apply(_l, [_o.sent()]);
                                return [4 /*yield*/, token.balanceOf(bidShares.collaborators[0])];
                            case 19:
                                postCollabOne = _o.sent();
                                return [4 /*yield*/, token.balanceOf(bidShares.collaborators[1])];
                            case 20:
                                postCollabTwo = _o.sent();
                                return [4 /*yield*/, token.balanceOf(bidShares.collaborators[2])];
                            case 21:
                                postCollabThree = _o.sent();
                                //collab one receive a payout of 15% of bidshares
                                (0, chai_1.expect)(parseInt(postCollabOne)).to.equal(parseInt(bid.amount.toString()) * 0.15);
                                //collab two receive a payout of 15% of bidshares
                                (0, chai_1.expect)(parseInt(postCollabTwo)).to.equal(parseInt(bid.amount.toString()) * 0.15);
                                //collab three receive a payout of 15% of bidshares
                                (0, chai_1.expect)(parseInt(postCollabThree)).to.equal(parseInt(bid.amount.toString()) * 0.15);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("should accept a bid on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preMarketbal, preBidBal, postMarketbal, postBidBal, preOwnerBal, _a, _b, preCollabOne, _c, _d, preCollabTwo, _e, _f, preCollabThree, _g, _h, postOwnerBal, _j, _k, newOwner, _l, _m, postCollabOne, postCollabTwo, postCollabThree;
                    return __generator(this, function (_o) {
                        switch (_o.label) {
                            case 0: return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 1:
                                preMarketbal = _o.sent();
                                (0, chai_1.expect)(parseInt(preMarketbal)).to.equal(0);
                                return [4 /*yield*/, token.balanceOf(signer.getAddress())];
                            case 2:
                                preBidBal = _o.sent();
                                (0, chai_1.expect)(parseInt(preBidBal)).to.equal(520000000e18);
                                //set bid for signer
                                return [4 /*yield*/, customMediaSigner0.setBid(0, customBid)];
                            case 3:
                                //set bid for signer
                                _o.sent();
                                return [4 /*yield*/, token.balanceOf(zapMarket.address)];
                            case 4:
                                postMarketbal = _o.sent();
                                (0, chai_1.expect)(parseInt(postMarketbal)).to.equal(200);
                                return [4 /*yield*/, token.balanceOf(signer.getAddress())];
                            case 5:
                                postBidBal = _o.sent();
                                //expecting that signer's post balance is zero
                                (0, chai_1.expect)(parseInt(postBidBal)).to.equal(parseInt(preBidBal) - parseInt(bid.amount.toString()));
                                _b = (_a = token).balanceOf;
                                return [4 /*yield*/, signer.getAddress()];
                            case 6: return [4 /*yield*/, _b.apply(_a, [_o.sent()])];
                            case 7:
                                preOwnerBal = _o.sent();
                                (0, chai_1.expect)(parseInt(preOwnerBal)).to.equal(520000000e18);
                                _d = (_c = token).balanceOf;
                                return [4 /*yield*/, bidShares.collaborators[0]];
                            case 8: return [4 /*yield*/, _d.apply(_c, [_o.sent()])];
                            case 9:
                                preCollabOne = _o.sent();
                                (0, chai_1.expect)(parseInt(preCollabOne)).to.equal(0);
                                _f = (_e = token).balanceOf;
                                return [4 /*yield*/, bidShares.collaborators[1]];
                            case 10: return [4 /*yield*/, _f.apply(_e, [_o.sent()])];
                            case 11:
                                preCollabTwo = _o.sent();
                                (0, chai_1.expect)(parseInt(preCollabTwo)).to.equal(0);
                                _h = (_g = token).balanceOf;
                                return [4 /*yield*/, bidShares.collaborators[2]];
                            case 12: return [4 /*yield*/, _h.apply(_g, [_o.sent()])];
                            case 13:
                                preCollabThree = _o.sent();
                                (0, chai_1.expect)(parseInt(preCollabThree)).to.equal(0);
                                //owner on custom media has to accept the bid
                                return [4 /*yield*/, customMediaSigner1.acceptBid(0, customBid)];
                            case 14:
                                //owner on custom media has to accept the bid
                                _o.sent();
                                _k = (_j = token).balanceOf;
                                return [4 /*yield*/, signer.getAddress()];
                            case 15: return [4 /*yield*/, _k.apply(_j, [_o.sent()])];
                            case 16:
                                postOwnerBal = _o.sent();
                                //post owner's balance increase by 35% bidshares
                                (0, chai_1.expect)(parseInt(postOwnerBal)).to.equal(parseInt(preOwnerBal) + parseInt(customBid.amount.toString()) * 0.35);
                                return [4 /*yield*/, customMediaSigner0.fetchOwnerOf(0)];
                            case 17:
                                newOwner = _o.sent();
                                _m = (_l = (0, chai_1.expect)(newOwner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 18:
                                _m.apply(_l, [_o.sent()]);
                                return [4 /*yield*/, token.balanceOf(bidShares.collaborators[0])];
                            case 19:
                                postCollabOne = _o.sent();
                                return [4 /*yield*/, token.balanceOf(bidShares.collaborators[1])];
                            case 20:
                                postCollabTwo = _o.sent();
                                return [4 /*yield*/, token.balanceOf(bidShares.collaborators[2])];
                            case 21:
                                postCollabThree = _o.sent();
                                //collab one receive a payout of 15% of bidshares
                                (0, chai_1.expect)(parseInt(postCollabOne)).to.equal(parseInt(customBid.amount.toString()) * 0.15);
                                //collab two receive a payout of 15% of bidshares
                                (0, chai_1.expect)(parseInt(postCollabTwo)).to.equal(parseInt(customBid.amount.toString()) * 0.15);
                                //collab three receive a payout of 15% of bidshares
                                (0, chai_1.expect)(parseInt(postCollabThree)).to.equal(parseInt(customBid.amount.toString()) * 0.15);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#revokeApproval", function () {
                it("Should reject if the token id does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected
                                    .revokeApproval(400)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (revokeApproval): The token id does not exist.")];
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
                                    .revokeApproval(400)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (revokeApproval): The token id does not exist.")];
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
                                    .revokeApproval(0)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (revokeApproval): Caller is not approved nor the owner.")];
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
                                    .revokeApproval(0)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (revokeApproval): Caller is not approved nor the owner.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should revoke approval by the approved on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApproveAddr, _a, _b, postApproveAddr, _c, _d, postRevokedAddr;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 1:
                                preApproveAddr = _e.sent();
                                (0, chai_1.expect)(preApproveAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = ownerConnected).approve;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 3:
                                _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 4:
                                postApproveAddr = _e.sent();
                                _d = (_c = (0, chai_1.expect)(postApproveAddr).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 5:
                                _d.apply(_c, [_e.sent()]);
                                return [4 /*yield*/, signerOneConnected.revokeApproval(0)];
                            case 6:
                                _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 7:
                                postRevokedAddr = _e.sent();
                                (0, chai_1.expect)(postRevokedAddr).to.equal(preApproveAddr);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should revoke approval by the approved on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApproveAddr, _a, _b, postApproveAddr, _c, _d, postRevokedAddr;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, customMediaSigner0.fetchApproved(0)];
                            case 1:
                                preApproveAddr = _e.sent();
                                (0, chai_1.expect)(preApproveAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = customMediaSigner1).approve;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 3:
                                _e.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchApproved(0)];
                            case 4:
                                postApproveAddr = _e.sent();
                                _d = (_c = (0, chai_1.expect)(postApproveAddr).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 5:
                                _d.apply(_c, [_e.sent()]);
                                return [4 /*yield*/, customMediaSigner0.revokeApproval(0)];
                            case 6:
                                _e.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchApproved(0)];
                            case 7:
                                postRevokedAddr = _e.sent();
                                (0, chai_1.expect)(postRevokedAddr).to.equal(preApproveAddr);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should revoke approval by the owner on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApproveAddr, _a, _b, postApprovedAddr, _c, _d, postRevokedAddr;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 1:
                                preApproveAddr = _e.sent();
                                (0, chai_1.expect)(preApproveAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = ownerConnected).approve;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 3:
                                _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 4:
                                postApprovedAddr = _e.sent();
                                _d = (_c = (0, chai_1.expect)(postApprovedAddr).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 5:
                                _d.apply(_c, [_e.sent()]);
                                return [4 /*yield*/, ownerConnected.revokeApproval(0)];
                            case 6:
                                _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 7:
                                postRevokedAddr = _e.sent();
                                (0, chai_1.expect)(postRevokedAddr).to.equal(preApproveAddr);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should revoke approval by the owner on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApproveAddr, _a, _b, postApprovedAddr, _c, _d, postRevokedAddr;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, customMediaSigner0.fetchApproved(0)];
                            case 1:
                                preApproveAddr = _e.sent();
                                (0, chai_1.expect)(preApproveAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = customMediaSigner1).approve;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 3:
                                _e.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchApproved(0)];
                            case 4:
                                postApprovedAddr = _e.sent();
                                _d = (_c = (0, chai_1.expect)(postApprovedAddr).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 5:
                                _d.apply(_c, [_e.sent()]);
                                return [4 /*yield*/, customMediaSigner1.revokeApproval(0)];
                            case 6:
                                _e.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchApproved(0)];
                            case 7:
                                postRevokedAddr = _e.sent();
                                (0, chai_1.expect)(postRevokedAddr).to.equal(preApproveAddr);
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
                it("Should reject if the token id does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                _b = (_a = customMediaSigner1)
                                    .approve;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1: 
                            // Will throw an error due to the token id not existing on the custom media
                            return [4 /*yield*/, _b.apply(_a, [_c.sent(), 400])
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (approve): TokenId does not exist.")];
                            case 2:
                                // Will throw an error due to the token id not existing on the custom media
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the caller is not the owner nor approved for all on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = signerOneConnected)
                                    .approve;
                                return [4 /*yield*/, signers[2].getAddress()];
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
                                _b = (_a = customMediaSigner0)
                                    .approve;
                                return [4 /*yield*/, signers[2].getAddress()];
                            case 1: 
                            // Will throw an error if the caller is not approved or the owner on a custom media
                            return [4 /*yield*/, _b.apply(_a, [_c.sent(), 0])
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (approve): Caller is not the owner nor approved for all.")];
                            case 2:
                                // Will throw an error if the caller is not approved or the owner on a custom media
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should approve another address for a token on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApprovedAddr, _a, _b, postApprovedAddr, _c, _d;
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
                                postApprovedAddr = _e.sent();
                                // Expect the address to equal the address of signerOne
                                _d = (_c = (0, chai_1.expect)(postApprovedAddr).to).equal;
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
                            case 0: return [4 /*yield*/, customMediaSigner1.fetchApproved(0)];
                            case 1:
                                preApprovedAddr = _e.sent();
                                // Expect the address to equal a zero address
                                (0, chai_1.expect)(preApprovedAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = customMediaSigner1).approve;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: 
                            // signerOne (signers[1]) approves signers[0] for token id 0 on a custom media
                            return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 3:
                                // signerOne (signers[1]) approves signers[0] for token id 0 on a custom media
                                _e.sent();
                                return [4 /*yield*/, customMediaSigner1.fetchApproved(0)];
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
                it("Should reject if the token id does not exist on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                            case 0: return [4 /*yield*/, customMediaSigner1
                                    .fetchApproved(200)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchApproved): TokenId does not exist.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should fetch the approved address on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, approvedAddr, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                _b = (_a = ownerConnected).approve;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1: 
                            // The owner (signer[0]) approves signerOne (signers[1]) for token id 0 on the main media
                            return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 2:
                                // The owner (signer[0]) approves signerOne (signers[1]) for token id 0 on the main media
                                _e.sent();
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 3:
                                approvedAddr = _e.sent();
                                // Expect the address to equal signerOne address
                                _d = (_c = (0, chai_1.expect)(approvedAddr).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 4:
                                // Expect the address to equal signerOne address
                                _d.apply(_c, [_e.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should fetch the approved address on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, approvedAddr, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                _b = (_a = customMediaSigner1).approve;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1: 
                            // signerOne (signer[1]) approves signer (signers[0]) for token id 0 on a custom media
                            return [4 /*yield*/, _b.apply(_a, [_e.sent(), 0])];
                            case 2:
                                // signerOne (signer[1]) approves signer (signers[0]) for token id 0 on a custom media
                                _e.sent();
                                return [4 /*yield*/, customMediaSigner1.fetchApproved(0)];
                            case 3:
                                approvedAddr = _e.sent();
                                // Expect the address to equal signer (signers[0]) address
                                _d = (_c = (0, chai_1.expect)(approvedAddr).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 4:
                                // Expect the address to equal signer (signers[0]) address
                                _d.apply(_c, [_e.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#setApprovalForAll", function () {
                it("Should reject if the (operator) is the caller on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = ownerConnected)
                                    .setApprovalForAll;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent(), true])
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (setApprovalForAll): The caller cannot be the operator.")];
                            case 2:
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the (operator) is the caller on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = customMediaSigner1)
                                    .setApprovalForAll;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent(), true])
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (setApprovalForAll): The caller cannot be the operator.")];
                            case 2:
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should set approval for all on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApprovalStatus, _a, _b, _c, _d, _e, postApprovalStatus, _f, _g, _h;
                    return __generator(this, function (_j) {
                        switch (_j.label) {
                            case 0:
                                _b = (_a = ownerConnected).fetchIsApprovedForAll;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1:
                                _c = [_j.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_j.sent()]))];
                            case 3:
                                preApprovalStatus = _j.sent();
                                (0, chai_1.expect)(preApprovalStatus).to.equal(false);
                                _e = (_d = ownerConnected).setApprovalForAll;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 4: return [4 /*yield*/, _e.apply(_d, [_j.sent(), true])];
                            case 5:
                                _j.sent();
                                _g = (_f = ownerConnected).fetchIsApprovedForAll;
                                return [4 /*yield*/, signer.getAddress()];
                            case 6:
                                _h = [_j.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 7: return [4 /*yield*/, _g.apply(_f, _h.concat([_j.sent()]))];
                            case 8:
                                postApprovalStatus = _j.sent();
                                (0, chai_1.expect)(postApprovalStatus).to.equal(true);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should set approval for all on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApprovalStatus, _a, _b, _c, _d, _e, postApprovalStatus, _f, _g, _h;
                    return __generator(this, function (_j) {
                        switch (_j.label) {
                            case 0:
                                _b = (_a = customMediaSigner1).fetchIsApprovedForAll;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1:
                                _c = [_j.sent()];
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_j.sent()]))];
                            case 3:
                                preApprovalStatus = _j.sent();
                                (0, chai_1.expect)(preApprovalStatus).to.equal(false);
                                _e = (_d = customMediaSigner1).setApprovalForAll;
                                return [4 /*yield*/, signer.getAddress()];
                            case 4: return [4 /*yield*/, _e.apply(_d, [_j.sent(), true])];
                            case 5:
                                _j.sent();
                                _g = (_f = customMediaSigner1).fetchIsApprovedForAll;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 6:
                                _h = [_j.sent()];
                                return [4 /*yield*/, signer.getAddress()];
                            case 7: return [4 /*yield*/, _g.apply(_f, _h.concat([_j.sent()]))];
                            case 8:
                                postApprovalStatus = _j.sent();
                                (0, chai_1.expect)(postApprovalStatus).to.equal(true);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#transferFrom", function () {
                it("Should reject if the (from) is a zero address on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _b = (_a = ownerConnected)
                                    .transferFrom;
                                _c = [ethers_1.ethers.constants.AddressZero];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent(), 0]))
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (transferFrom): The (from) address cannot be a zero address.")];
                            case 2:
                                _d.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the (from) is a zero address on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _b = (_a = customMediaSigner1)
                                    .transferFrom;
                                _c = [ethers_1.ethers.constants.AddressZero];
                                return [4 /*yield*/, signer.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent(), 0]))
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (transferFrom): The (from) address cannot be a zero address.")];
                            case 2:
                                _d.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the (to) is a zero address on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = ownerConnected)
                                    .transferFrom;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent(), ethers_1.ethers.constants.AddressZero,
                                    0])
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (transferFrom): The (to) address cannot be a zero address.")];
                            case 2:
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the (to) is a zero address on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = customMediaSigner1)
                                    .transferFrom;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent(), ethers_1.ethers.constants.AddressZero,
                                    0])
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (transferFrom): The (to) address cannot be a zero address.")];
                            case 2:
                                _c.sent();
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
                                    .transferFrom;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1:
                                _c = [_d.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent(), 300]))
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (transferFrom): TokenId does not exist")];
                            case 3:
                                _d.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the token id does not exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _b = (_a = customMediaSigner1)
                                    .transferFrom;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1:
                                _c = [_d.sent()];
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent(), 1]))
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (transferFrom): TokenId does not exist")];
                            case 3:
                                _d.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the caller is not the owner or approved on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _b = (_a = signerOneConnected)
                                    .transferFrom;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1:
                                _c = [_d.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent(), 0]))
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (transferFrom): Caller is not approved nor the owner.")];
                            case 3:
                                _d.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the caller is not the owner or approved on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _b = (_a = customMediaSigner0)
                                    .transferFrom;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1:
                                _c = [_d.sent()];
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent(), 0]))
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (transferFrom): Caller is not approved nor the owner.")];
                            case 3:
                                _d.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should transfer a token by the approved on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApproveAddr, _a, _b, postApproveAddr, _c, _d, _e, _f, _g, newTokenOwner, _h, _j;
                    return __generator(this, function (_k) {
                        switch (_k.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 1:
                                preApproveAddr = _k.sent();
                                (0, chai_1.expect)(preApproveAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = ownerConnected).approve;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_k.sent(), 0])];
                            case 3:
                                _k.sent();
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 4:
                                postApproveAddr = _k.sent();
                                _d = (_c = (0, chai_1.expect)(postApproveAddr).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 5:
                                _d.apply(_c, [_k.sent()]);
                                _f = (_e = signerOneConnected).transferFrom;
                                return [4 /*yield*/, signer.getAddress()];
                            case 6:
                                _g = [_k.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 7: return [4 /*yield*/, _f.apply(_e, _g.concat([_k.sent(), 0]))];
                            case 8:
                                _k.sent();
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 9:
                                newTokenOwner = _k.sent();
                                _j = (_h = (0, chai_1.expect)(newTokenOwner).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 10:
                                _j.apply(_h, [_k.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should transfer a token by the approved on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApproveAddr, _a, _b, postApproveAddr, _c, _d, _e, _f, _g, newTokenOwner, _h, _j;
                    return __generator(this, function (_k) {
                        switch (_k.label) {
                            case 0: return [4 /*yield*/, customMediaSigner0.fetchApproved(0)];
                            case 1:
                                preApproveAddr = _k.sent();
                                (0, chai_1.expect)(preApproveAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = customMediaSigner1).approve;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_k.sent(), 0])];
                            case 3:
                                _k.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchApproved(0)];
                            case 4:
                                postApproveAddr = _k.sent();
                                _d = (_c = (0, chai_1.expect)(postApproveAddr).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 5:
                                _d.apply(_c, [_k.sent()]);
                                _f = (_e = customMediaSigner0).transferFrom;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 6:
                                _g = [_k.sent()];
                                return [4 /*yield*/, signer.getAddress()];
                            case 7: return [4 /*yield*/, _f.apply(_e, _g.concat([_k.sent(), 0]))];
                            case 8:
                                _k.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchOwnerOf(0)];
                            case 9:
                                newTokenOwner = _k.sent();
                                _j = (_h = (0, chai_1.expect)(newTokenOwner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 10:
                                _j.apply(_h, [_k.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should transfer a token by the owner on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c, newTokenOwner, _d, _e;
                    return __generator(this, function (_f) {
                        switch (_f.label) {
                            case 0:
                                _b = (_a = ownerConnected).transferFrom;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1:
                                _c = [_f.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_f.sent(), 0]))];
                            case 3:
                                _f.sent();
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 4:
                                newTokenOwner = _f.sent();
                                _e = (_d = (0, chai_1.expect)(newTokenOwner).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 5:
                                _e.apply(_d, [_f.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should transfer a token by the owner on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c, newTokenOwner, _d, _e;
                    return __generator(this, function (_f) {
                        switch (_f.label) {
                            case 0:
                                _b = (_a = customMediaSigner1).transferFrom;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1:
                                _c = [_f.sent()];
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_f.sent(), 0]))];
                            case 3:
                                _f.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchOwnerOf(0)];
                            case 4:
                                newTokenOwner = _f.sent();
                                _e = (_d = (0, chai_1.expect)(newTokenOwner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 5:
                                _e.apply(_d, [_f.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#safeTransferFrom", function () {
                it("Should reject if the (from) is a zero address on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _b = (_a = ownerConnected)
                                    .safeTransferFrom;
                                _c = [ethers_1.ethers.constants.AddressZero];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent(), 0]))
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (safeTransferFrom): The (from) address cannot be a zero address.")];
                            case 2:
                                _d.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the (from) is a zero address on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _b = (_a = customMediaSigner1)
                                    .safeTransferFrom;
                                _c = [ethers_1.ethers.constants.AddressZero];
                                return [4 /*yield*/, signer.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent(), 0]))
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (safeTransferFrom): The (from) address cannot be a zero address.")];
                            case 2:
                                _d.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the (to) is a zero address on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = ownerConnected)
                                    .safeTransferFrom;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent(), ethers_1.ethers.constants.AddressZero,
                                    0])
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (safeTransferFrom): The (to) address cannot be a zero address.")];
                            case 2:
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the (to) is a zero address on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = customMediaSigner1)
                                    .safeTransferFrom;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent(), ethers_1.ethers.constants.AddressZero,
                                    0])
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (safeTransferFrom): The (to) address cannot be a zero address.")];
                            case 2:
                                _c.sent();
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
                                    .safeTransferFrom;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1:
                                _c = [_d.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent(), 300]))
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (safeTransferFrom): TokenId does not exist")];
                            case 3:
                                _d.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the token id does not exist on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _b = (_a = customMediaSigner1)
                                    .safeTransferFrom;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1:
                                _c = [_d.sent()];
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent(), 1]))
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (safeTransferFrom): TokenId does not exist")];
                            case 3:
                                _d.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the caller is not the owner or approved on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _b = (_a = signerOneConnected)
                                    .safeTransferFrom;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1:
                                _c = [_d.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent(), 0]))
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (safeTransferFrom): Caller is not approved nor the owner.")];
                            case 3:
                                _d.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the caller is not the owner or approved on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _b = (_a = customMediaSigner0)
                                    .safeTransferFrom;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1:
                                _c = [_d.sent()];
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent(), 0]))
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (safeTransferFrom): Caller is not approved nor the owner.")];
                            case 3:
                                _d.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should transfer a token by the approved on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApproveAddr, _a, _b, postApproveAddr, _c, _d, _e, _f, _g, newTokenOwner, _h, _j;
                    return __generator(this, function (_k) {
                        switch (_k.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 1:
                                preApproveAddr = _k.sent();
                                (0, chai_1.expect)(preApproveAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = ownerConnected).approve;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_k.sent(), 0])];
                            case 3:
                                _k.sent();
                                return [4 /*yield*/, ownerConnected.fetchApproved(0)];
                            case 4:
                                postApproveAddr = _k.sent();
                                _d = (_c = (0, chai_1.expect)(postApproveAddr).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 5:
                                _d.apply(_c, [_k.sent()]);
                                _f = (_e = signerOneConnected).safeTransferFrom;
                                return [4 /*yield*/, signer.getAddress()];
                            case 6:
                                _g = [_k.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 7: return [4 /*yield*/, _f.apply(_e, _g.concat([_k.sent(), 0]))];
                            case 8:
                                _k.sent();
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 9:
                                newTokenOwner = _k.sent();
                                _j = (_h = (0, chai_1.expect)(newTokenOwner).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 10:
                                _j.apply(_h, [_k.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should transfer a token by the approved on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var preApproveAddr, _a, _b, postApproveAddr, _c, _d, _e, _f, _g, newTokenOwner, _h, _j;
                    return __generator(this, function (_k) {
                        switch (_k.label) {
                            case 0: return [4 /*yield*/, customMediaSigner0.fetchApproved(0)];
                            case 1:
                                preApproveAddr = _k.sent();
                                (0, chai_1.expect)(preApproveAddr).to.equal(ethers_1.ethers.constants.AddressZero);
                                _b = (_a = customMediaSigner1).approve;
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, [_k.sent(), 0])];
                            case 3:
                                _k.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchApproved(0)];
                            case 4:
                                postApproveAddr = _k.sent();
                                _d = (_c = (0, chai_1.expect)(postApproveAddr).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 5:
                                _d.apply(_c, [_k.sent()]);
                                _f = (_e = customMediaSigner0).safeTransferFrom;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 6:
                                _g = [_k.sent()];
                                return [4 /*yield*/, signer.getAddress()];
                            case 7: return [4 /*yield*/, _f.apply(_e, _g.concat([_k.sent(), 0]))];
                            case 8:
                                _k.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchOwnerOf(0)];
                            case 9:
                                newTokenOwner = _k.sent();
                                _j = (_h = (0, chai_1.expect)(newTokenOwner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 10:
                                _j.apply(_h, [_k.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should transfer a token by the owner on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c, newTokenOwner, _d, _e;
                    return __generator(this, function (_f) {
                        switch (_f.label) {
                            case 0:
                                _b = (_a = ownerConnected).safeTransferFrom;
                                return [4 /*yield*/, signer.getAddress()];
                            case 1:
                                _c = [_f.sent()];
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_f.sent(), 0]))];
                            case 3:
                                _f.sent();
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(0)];
                            case 4:
                                newTokenOwner = _f.sent();
                                _e = (_d = (0, chai_1.expect)(newTokenOwner).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 5:
                                _e.apply(_d, [_f.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should transfer a token by the owner on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c, newTokenOwner, _d, _e;
                    return __generator(this, function (_f) {
                        switch (_f.label) {
                            case 0:
                                _b = (_a = customMediaSigner1).safeTransferFrom;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 1:
                                _c = [_f.sent()];
                                return [4 /*yield*/, signer.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_f.sent(), 0]))];
                            case 3:
                                _f.sent();
                                return [4 /*yield*/, customMediaSigner0.fetchOwnerOf(0)];
                            case 4:
                                newTokenOwner = _f.sent();
                                _e = (_d = (0, chai_1.expect)(newTokenOwner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 5:
                                _e.apply(_d, [_f.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe("#permit", function () {
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
            describe("#fetchMediaByIndex", function () {
                it("Should reject if the index is out of range on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ownerConnected
                                    .fetchMediaByIndex(2)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchMediaByIndex): Index out of range.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should reject if the index is out of range on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, customMediaSigner0
                                    .fetchMediaByIndex(1)
                                    .should.be.rejectedWith("Invariant failed: ZapMedia (fetchMediaByIndex): Index out of range.")];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should fetch the token by index on the main media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var firstToken, firstTokenOwner, _a, _b, secondToken, secondTokenOwner, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, ownerConnected.fetchMediaByIndex(0)];
                            case 1:
                                firstToken = _e.sent();
                                (0, chai_1.expect)(parseInt(firstToken._hex)).to.equal(0);
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(parseInt(firstToken._hex))];
                            case 2:
                                firstTokenOwner = _e.sent();
                                _b = (_a = (0, chai_1.expect)(firstTokenOwner).to).equal;
                                return [4 /*yield*/, signer.getAddress()];
                            case 3:
                                _b.apply(_a, [_e.sent()]);
                                return [4 /*yield*/, ownerConnected.fetchMediaByIndex(1)];
                            case 4:
                                secondToken = _e.sent();
                                (0, chai_1.expect)(parseInt(secondToken._hex)).to.equal(1);
                                return [4 /*yield*/, ownerConnected.fetchOwnerOf(parseInt(secondToken._hex))];
                            case 5:
                                secondTokenOwner = _e.sent();
                                _d = (_c = (0, chai_1.expect)(secondTokenOwner).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 6:
                                _d.apply(_c, [_e.sent()]);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it("Should fetch the token by index on a custom media", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var firstToken, firstTokenOwner, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, customMediaSigner0.fetchMediaByIndex(0)];
                            case 1:
                                firstToken = _c.sent();
                                (0, chai_1.expect)(parseInt(firstToken._hex)).to.equal(0);
                                return [4 /*yield*/, customMediaSigner0.fetchOwnerOf(parseInt(firstToken._hex))];
                            case 2:
                                firstTokenOwner = _c.sent();
                                _b = (_a = (0, chai_1.expect)(firstTokenOwner).to).equal;
                                return [4 /*yield*/, signerOne.getAddress()];
                            case 3:
                                _b.apply(_a, [_c.sent()]);
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