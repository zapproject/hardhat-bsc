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
var ethers_1 = require("ethers");
var utils_1 = require("./utils");
var abi_1 = require("./contract/abi");
var tiny_invariant_1 = __importDefault(require("tiny-invariant"));
var ZapMedia = /** @class */ (function () {
    function ZapMedia(networkId, signer) {
        this.networkId = networkId;
        this.signer = signer;
        this.market = new ethers_1.ethers.Contract((0, utils_1.contractAddresses)(networkId).zapMarketAddress, abi_1.zapMarketAbi, signer);
        this.media = new ethers_1.ethers.Contract((0, utils_1.contractAddresses)(networkId).zapMediaAddress, abi_1.zapMediaAbi, signer);
        if (ethers_1.Signer.isSigner(signer)) {
            this.readOnly = false;
        }
        else {
            this.readOnly = true;
        }
    }
    ZapMedia.prototype.getSigNonces = function (addess) {
        throw new Error("Method not implemented.");
    };
    /*********************
     * Zap View Methods
     *********************
     */
    /**
     * Fetches the amount of tokens an address owns on a media contract
     * @param owner The address to fetch the token balance for
     * @param mediaIndex The index to access media contracts as an optional argument
     */
    ZapMedia.prototype.fetchBalanceOf = function (owner, customMediaAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (owner == ethers_1.ethers.constants.AddressZero) {
                    (0, tiny_invariant_1.default)(false, "ZapMedia (fetchBalanceOf): The (owner) address cannot be a zero address.");
                }
                if (customMediaAddress !== undefined) {
                    return [2 /*return*/, this.media.attach(customMediaAddress).balanceOf(owner)];
                }
                else {
                    return [2 /*return*/, this.media.balanceOf(owner)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Fetches the owner of the specified media on an instance of the Zap Media Contract
     * @param mediaId Numerical identifier for a minted token
     * @param customMediaAddress An optional argument that designates which media contract to connect to.
     */
    ZapMedia.prototype.fetchOwnerOf = function (mediaId, customMediaAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        if (!(customMediaAddress !== undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.media.attach(customMediaAddress).ownerOf(mediaId)];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2: return [4 /*yield*/, this.media.ownerOf(mediaId)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        _a = _b.sent();
                        (0, tiny_invariant_1.default)(false, "ZapMedia (fetchOwnerOf): The token id does not exist.");
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetches the mediaId of the specified owner by index on an instance of the Zap Media Contract
     * @param owner Address of who the tokenId belongs to.
     * @param index The position of a tokenId that an address owns.
     * @param customMediaAddress An optional argument that designates which media contract to connect to.
     */
    ZapMedia.prototype.fetchMediaOfOwnerByIndex = function (owner, index, customMediaAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // If the owner is a zero address throw an error
                if (owner == ethers_1.ethers.constants.AddressZero) {
                    (0, tiny_invariant_1.default)(false, "ZapMedia (fetchMediaOfOwnerByIndex): The (owner) address cannot be a zero address.");
                }
                // If customMediaAddress is not undefined attach the address to the main media contract
                // create a custom media contract instance and invoke tokenOfOwnerByIndex
                if (customMediaAddress !== undefined) {
                    return [2 /*return*/, this.media
                            .attach(customMediaAddress)
                            .tokenOfOwnerByIndex(owner, index)];
                    // If the customMediaAddress is undefined invoke tokenOfOwnerByIndex on the main media
                }
                else {
                    return [2 /*return*/, this.media.tokenOfOwnerByIndex(owner, index)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Fetches the content uri for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     * @param customMediaAddress
     */
    ZapMedia.prototype.fetchContentURI = function (mediaId, customMediaAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (customMediaAddress == ethers_1.ethers.constants.AddressZero) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (fetchContentURI): The (customMediaAddress) address cannot be a zero address.");
                        }
                        if (!(customMediaAddress !== undefined)) return [3 /*break*/, 4];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.media.attach(customMediaAddress).tokenURI(mediaId)];
                    case 2: return [2 /*return*/, _c.sent()];
                    case 3:
                        _a = _c.sent();
                        (0, tiny_invariant_1.default)(false, "ZapMedia (fetchContentURI): TokenId does not exist.");
                        return [3 /*break*/, 4];
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.media.tokenURI(mediaId)];
                    case 5: return [2 /*return*/, _c.sent()];
                    case 6:
                        _b = _c.sent();
                        (0, tiny_invariant_1.default)(false, "ZapMedia (fetchContentURI): TokenId does not exist.");
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetches the metadata uri for the specified media on an instance of the ZAP Media Contract
     * @param mediaId
     */
    ZapMedia.prototype.fetchMetadataURI = function (mediaId, customMediaAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (customMediaAddress == ethers_1.ethers.constants.AddressZero) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (fetchMetadataURI): The (customMediaAddress) address cannot be a zero address.");
                        }
                        if (!(customMediaAddress !== undefined)) return [3 /*break*/, 4];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.media.attach(customMediaAddress).tokenMetadataURI(mediaId)];
                    case 2: return [2 /*return*/, _c.sent()];
                    case 3:
                        _a = _c.sent();
                        (0, tiny_invariant_1.default)(false, "ZapMedia (fetchMetadataURI): TokenId does not exist.");
                        return [3 /*break*/, 4];
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.media.tokenMetadataURI(mediaId)];
                    case 5: return [2 /*return*/, _c.sent()];
                    case 6:
                        _b = _c.sent();
                        (0, tiny_invariant_1.default)(false, "ZapMedia (fetchMetadataURI): TokenId does not exist.");
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetches the content hash for the specified media on the ZapMedia Contract
     * @param mediaId Numerical identifier for a minted token
     * @param customMediaAddress An optional argument that designates which media contract to connect to.
     */
    ZapMedia.prototype.fetchContentHash = function (mediaId, customMediaAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // If the customMediaAddress is a zero address throw an error
                        if (customMediaAddress == ethers_1.ethers.constants.AddressZero) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (fetchContentHash): The (customMediaAddress) cannot be a zero address.");
                        }
                        if (!(customMediaAddress !== undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.media
                                .attach(customMediaAddress)
                                .getTokenContentHashes(mediaId)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: 
                    // If the customMediaAddress is undefined use the main media instance to invoke the getTokenContentHashes function
                    return [2 /*return*/, this.media.getTokenContentHashes(mediaId)];
                }
            });
        });
    };
    /**
     * Fetches the metadata hash for the specified media on the ZapMedia Contract
     * @param mediaId Numerical identifier for a minted token
     * @param customMediaAddress An optional argument that designates which media contract to connect to.
     */
    ZapMedia.prototype.fetchMetadataHash = function (mediaId, customMediaAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // If the customMediaAddress is a zero address throw an error
                        if (customMediaAddress == ethers_1.ethers.constants.AddressZero) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (fetchMetadataHash): The (customMediaAddress) cannot be a zero address.");
                        }
                        if (!(customMediaAddress !== undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.media
                                .attach(customMediaAddress)
                                .getTokenMetadataHashes(mediaId)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: 
                    // If the customMediaAddress is undefined use the main media instance to invoke the getTokenMetadataHashes function
                    return [2 /*return*/, this.media.getTokenMetadataHashes(mediaId)];
                }
            });
        });
    };
    /**
     * Fetches the permit nonce on the specified media id for the owner address
     * @param address
     * @param mediaId
     */
    ZapMedia.prototype.fetchPermitNonce = function (address, mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.media.getPermitNonce(address, mediaId)];
            });
        });
    };
    /**
     * Fetches the creator for the specified media on an instance of the Zap Media Contract
     * @param mediaId Numerical identifier for a minted token
     * @param customMediaAddress An optional argument that designates which media contract to connect to.
     */
    ZapMedia.prototype.fetchCreator = function (mediaId, customMediaAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // If the customMediaAddress is a zero address throw an error
                        if (customMediaAddress == ethers_1.ethers.constants.AddressZero) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (fetchCreator): The (customMediaAddress) cannot be a zero address.");
                        }
                        if (!(customMediaAddress !== undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.media
                                .attach(customMediaAddress)
                                .getTokenCreators(mediaId)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, this.media.getTokenCreators(mediaId)];
                    case 3: 
                    // If the customMediaAddress is undefined use the main media instance to invoke the getTokenCreators function
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the current bid shares for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    ZapMedia.prototype.fetchCurrentBidShares = function (mediaAddress, mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.market.bidSharesForToken(mediaAddress, mediaId)];
            });
        });
    };
    /**
     * Fetches the current ask for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    ZapMedia.prototype.fetchCurrentAsk = function (mediaAddress, mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.market.currentAskForToken(mediaAddress, mediaId)];
            });
        });
    };
    /**
     * Fetches the current bid for the specified bidder for the specified media on an instance of the Zap Media Contract
     * @param mediaContractAddress Designates which media contract to connect to.
     * @param mediaId Numerical identifier for a minted token
     * @param bidder The public address that set the bid
     */
    ZapMedia.prototype.fetchCurrentBidForBidder = function (mediaContractAddress, mediaId, bidder) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Checks if the mediaContractAddress is a zero address
                        if (mediaContractAddress == ethers_1.ethers.constants.AddressZero) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (fetchCurrentBidForBidder): The (media contract) address cannot be a zero address.");
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.media.attach(mediaContractAddress).ownerOf(mediaId)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        (0, tiny_invariant_1.default)(false, "ZapMedia (fetchCurrentBidForBidder): The token id does not exist.");
                        return [3 /*break*/, 4];
                    case 4:
                        // Checks if the bidder address is a zero address
                        if (bidder == ethers_1.ethers.constants.AddressZero) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (fetchCurrentBidForBidder): The (bidder) address cannot be a zero address.");
                        }
                        // Invokes the bidForTokenBidder function on the ZapMarket contract and returns the bidders bid details
                        return [2 /*return*/, this.market.bidForTokenBidder(mediaContractAddress, mediaId, bidder)];
                }
            });
        });
    };
    /**
     * Fetches the total amount of non-burned media that has been minted on an instance of the Zap Media Contract
     */
    ZapMedia.prototype.fetchTotalMedia = function (customMediaAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (customMediaAddress !== undefined) {
                    return [2 /*return*/, this.media.attach(customMediaAddress).totalSupply()];
                }
                return [2 /*return*/, this.media.totalSupply()];
            });
        });
    };
    ZapMedia.prototype.fetchMediaByIndex = function (index) {
        return __awaiter(this, void 0, void 0, function () {
            var totalMedia;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchTotalMedia()];
                    case 1:
                        totalMedia = _a.sent();
                        if (index > parseInt(totalMedia._hex) - 1) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (tokenByIndex): Index out of range.");
                        }
                        return [2 /*return*/, this.media.tokenByIndex(index)];
                }
            });
        });
    };
    /**
     * Fetches the approved account for the specified media on an instance of the Zap Media Contract
     * @param mediaId Numerical identifier for a minted token
     * @param customMediaAddress An optional argument that designates which media contract to connect to.
     */
    ZapMedia.prototype.fetchApproved = function (mediaId, customMediaAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(customMediaAddress !== undefined)) return [3 /*break*/, 4];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.media.attach(customMediaAddress).getApproved(mediaId)];
                    case 2: return [2 /*return*/, _c.sent()];
                    case 3:
                        _a = _c.sent();
                        (0, tiny_invariant_1.default)(false, "ZapMedia (fetchApproved): TokenId does not exist.");
                        return [3 /*break*/, 4];
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.media.getApproved(mediaId)];
                    case 5: return [2 /*return*/, _c.sent()];
                    case 6:
                        _b = _c.sent();
                        (0, tiny_invariant_1.default)(false, "ZapMedia (fetchApproved): TokenId does not exist.");
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetches if the specified operator is approved for all media owned by the specified owner on an instance of the Zap Media Contract
     * @param owner
     * @param operator
     */
    ZapMedia.prototype.fetchIsApprovedForAll = function (owner, operator) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.media.isApprovedForAll(owner, operator)];
            });
        });
    };
    ZapMedia.prototype.updateContentURI = function (mediaId, tokenURI) {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.media.updateTokenURI(mediaId, tokenURI)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_1 = _a.sent();
                        (0, tiny_invariant_1.default)(false, "ZapMedia (updateContentURI): TokenId does not exist.");
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**fetches the media specified Signature nonce. if signature nonce does not exist, function
     * will return an error message
     * @param address
     * @returns sigNonce
     */
    ZapMedia.prototype.fetchMintWithSigNonce = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    (0, utils_1.validateAndParseAddress)(address);
                }
                catch (err) {
                    return [2 /*return*/, Promise.reject(err.message)];
                }
                return [2 /*return*/, this.media.getSigNonces(address)];
            });
        });
    };
    /***********************
     * ERC-721 Write Methods
     ***********************
     */
    /**
     * Grants approval to the specified address for the specified media on an instance of the Zap Media Contract
     * @param to The address to be approved
     * @param mediaId Numerical identifier for a minted token
     * @param customMediaAddress An optional argument that designates which media contract to connect to.
     */
    ZapMedia.prototype.approve = function (to, mediaId, customMediaAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, _a, approvalStatus_1, _b, _c, _d, _e, approvalStatus, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (!(customMediaAddress !== undefined)) return [3 /*break*/, 8];
                        _j.label = 1;
                    case 1:
                        _j.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.media.attach(customMediaAddress).ownerOf(mediaId)];
                    case 2:
                        owner = _j.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _j.sent();
                        (0, tiny_invariant_1.default)(false, "ZapMedia (approve): TokenId does not exist.");
                        return [3 /*break*/, 4];
                    case 4:
                        _c = (_b = this.media
                            .attach(customMediaAddress))
                            .isApprovedForAll;
                        _d = [owner];
                        return [4 /*yield*/, this.signer.getAddress()];
                    case 5: return [4 /*yield*/, _c.apply(_b, _d.concat([_j.sent()]))];
                    case 6:
                        approvalStatus_1 = _j.sent();
                        return [4 /*yield*/, this.signer.getAddress()];
                    case 7:
                        // If the signer is not the owner nor approved for all they cannot invoke this function
                        if ((_j.sent()) !== owner &&
                            approvalStatus_1 == false) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (approve): Caller is not the owner nor approved for all.");
                        }
                        // Appr
                        return [2 /*return*/, this.media.attach(customMediaAddress).approve(to, mediaId)];
                    case 8:
                        _j.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this.media.ownerOf(mediaId)];
                    case 9:
                        owner = _j.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        _e = _j.sent();
                        (0, tiny_invariant_1.default)(false, "ZapMedia (approve): TokenId does not exist.");
                        return [3 /*break*/, 11];
                    case 11:
                        _g = (_f = this.media).isApprovedForAll;
                        _h = [owner];
                        return [4 /*yield*/, this.signer.getAddress()];
                    case 12: return [4 /*yield*/, _g.apply(_f, _h.concat([_j.sent()]))];
                    case 13:
                        approvalStatus = _j.sent();
                        return [4 /*yield*/, this.signer.getAddress()];
                    case 14:
                        if ((_j.sent()) !== owner && approvalStatus == false) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (approve): Caller is not the owner nor approved for all.");
                        }
                        return [2 /*return*/, this.media.approve(to, mediaId)];
                }
            });
        });
    };
    /**
     * Grants approval for all media owner by msg.sender on an instance of the Zap Media Contract
     * @param operator
     * @param approved
     */
    ZapMedia.prototype.setApprovalForAll = function (operator, approved) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.media.setApprovalForAll(operator, approved)];
            });
        });
    };
    /**
     * Transfers the specified media to the specified to address on an instance of the Zap Media Contract
     * @param from
     * @param to
     * @param mediaId
     */
    ZapMedia.prototype.transferFrom = function (from, to, mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.media.transferFrom(from, to, mediaId)];
            });
        });
    };
    /**
     * Executes a SafeTransfer of the specified media to the specified address if and only if it adheres to the ERC721-Receiver Interface
     * @param from
     * @param to
     * @param mediaId
     */
    ZapMedia.prototype.safeTransferFrom = function (from, to, mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            var err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.media.ownerOf(mediaId)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_2 = _a.sent();
                        (0, tiny_invariant_1.default)(false, "ZapMedia (safeTransferFrom): TokenId does not exist.");
                        return [3 /*break*/, 3];
                    case 3:
                        if (from === ethers_1.ethers.constants.AddressZero) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (safeTransferFrom): The (from) address cannot be a zero address.");
                        }
                        if (to === ethers_1.ethers.constants.AddressZero) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (safeTransferFrom): The (to) address cannot be a zero address.");
                        }
                        return [2 /*return*/, this.media["safeTransferFrom(address,address,uint256)"](from, to, mediaId)];
                }
            });
        });
    };
    /**
     * Mints a new piece of media on an instance of the Zap Media Contract
     * @param mintData
     * @param bidShares
     */
    ZapMedia.prototype.mint = function (mediaData, bidShares, customMediaAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var gasEstimate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            (0, utils_1.validateURI)(mediaData.tokenURI);
                            (0, utils_1.validateURI)(mediaData.metadataURI);
                            (0, utils_1.validateBidShares)(bidShares.collabShares, bidShares.creator, bidShares.owner);
                        }
                        catch (err) {
                            return [2 /*return*/, Promise.reject(err.message)];
                        }
                        if (!(customMediaAddress !== undefined)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.media.attach(customMediaAddress).mint(mediaData, bidShares)];
                    case 1: return [4 /*yield*/, this.media.estimateGas.mint(mediaData, bidShares)];
                    case 2:
                        gasEstimate = _a.sent();
                        return [2 /*return*/, this.media.mint(mediaData, bidShares, { gasLimit: gasEstimate })];
                }
            });
        });
    };
    /**
     * Mints a new piece of media on an instance of the Zap Media Contract
     * @param creator
     * @param mediaData
     * @param bidShares
     * @param sig
     */
    ZapMedia.prototype.mintWithSig = function (creator, mediaData, bidShares, sig) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // this.ensureNotReadOnly()
                    (0, utils_1.validateURI)(mediaData.metadataURI);
                    (0, utils_1.validateURI)(mediaData.tokenURI);
                    (0, utils_1.validateBidShares)(bidShares.collabShares, bidShares.creator, bidShares.owner);
                }
                catch (err) {
                    return [2 /*return*/, Promise.reject(err.message)];
                }
                return [2 /*return*/, this.media.mintWithSig(creator, mediaData, bidShares, sig)];
            });
        });
    };
    /**
     * Sets an ask on the specified media on an instance of the Zap Media Contract
     * @param mediaId
     * @param ask
     */
    ZapMedia.prototype.setAsk = function (mediaId, ask) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenOwner, signerAddress, isApproved;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.media.ownerOf(mediaId)];
                    case 1:
                        tokenOwner = _a.sent();
                        return [4 /*yield*/, this.signer.getAddress()];
                    case 2:
                        signerAddress = _a.sent();
                        return [4 /*yield*/, this.media.getApproved(mediaId)];
                    case 3:
                        isApproved = _a.sent();
                        // If the signer is not the token owner and the approved address is a zerp address
                        if (tokenOwner !== signerAddress &&
                            isApproved === ethers_1.ethers.constants.AddressZero) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (setAsk): Media: Only approved or owner.");
                            // If the signer is not the token owner or if the signer is the approved address
                        }
                        else if (tokenOwner !== signerAddress || isApproved === signerAddress) {
                            return [2 /*return*/, this.media.setAsk(mediaId, ask)];
                            // If the signer is the token owner and is not the approved address
                        }
                        else {
                            return [2 /*return*/, this.media.setAsk(mediaId, ask)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sets a bid on the specified media on an instance of the Zap Media Contract
     * @param mediaId
     * @param bid
     */
    ZapMedia.prototype.setBid = function (mediaId, bid) {
        return __awaiter(this, void 0, void 0, function () {
            var err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.media.ownerOf(mediaId)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_3 = _a.sent();
                        (0, tiny_invariant_1.default)(false, "ZapMedia (setBid): TokenId does not exist.");
                        return [3 /*break*/, 3];
                    case 3:
                        if (bid.currency == ethers_1.ethers.constants.AddressZero) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (setBid): Currency cannot be a zero address.");
                        }
                        else if (bid.recipient == ethers_1.ethers.constants.AddressZero) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (setBid): Recipient cannot be a zero address.");
                        }
                        else if (bid.amount == 0) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (setBid): Amount cannot be zero.");
                        }
                        return [2 /*return*/, this.media.setBid(mediaId, bid)];
                }
            });
        });
    };
    /**
     * Removes the ask on the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    ZapMedia.prototype.removeAsk = function (mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            var ask, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.market.currentAskForToken(this.media.address, mediaId)];
                    case 1:
                        ask = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.media.ownerOf(mediaId)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_4 = _a.sent();
                        (0, tiny_invariant_1.default)(false, "ZapMedia (removeAsk): TokenId does not exist.");
                        return [3 /*break*/, 5];
                    case 5:
                        if (ask.amount == 0) {
                            (0, tiny_invariant_1.default)(false, "ZapMedia (removeAsk): Ask was never set.");
                        }
                        else {
                            return [2 /*return*/, this.media.removeAsk(mediaId)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates the metadata uri for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     * @param metadataURI
     */
    ZapMedia.prototype.updateMetadataURI = function (mediaId, metadataURI) {
        return __awaiter(this, void 0, void 0, function () {
            var gasEstimate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            (0, utils_1.validateURI)(metadataURI);
                        }
                        catch (err) {
                            return [2 /*return*/, Promise.reject(err.message)];
                        }
                        return [4 /*yield*/, this.media.estimateGas.updateTokenMetadataURI(mediaId, metadataURI)];
                    case 1:
                        gasEstimate = _a.sent();
                        return [2 /*return*/, this.media.updateTokenMetadataURI(mediaId, metadataURI, {
                                gasLimit: gasEstimate,
                            })];
                }
            });
        });
    };
    /**
     * Grants the spender approval for the specified media using meta transactions as outlined in EIP-712
     * @param sender
     * @param mediaId
     * @param sig
     */
    ZapMedia.prototype.permit = function (spender, tokenId, sig) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // try {
                //   this.ensureNotReadOnly()
                // } catch (err) {
                //   if (err instanceof Error) {
                //     return Promise.reject(err.message)
                //   }
                // }
                return [2 /*return*/, this.media.permit(spender, tokenId, sig)];
            });
        });
    };
    /**
     * Revokes the approval of an approved account for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    ZapMedia.prototype.revokeApproval = function (mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.media.revokeApproval(mediaId)];
            });
        });
    };
    /**
     * Burns the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    ZapMedia.prototype.burn = function (mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.media.burn(mediaId)];
            });
        });
    };
    /**
     * Checks to see if a Bid's amount is evenly splittable given the media's current bidShares
     *
     * @param mediaId
     * @param bid
     */
    ZapMedia.prototype.isValidBid = function (mediaId, bid) {
        return __awaiter(this, void 0, void 0, function () {
            var isAmountValid, decimal100, currentBidShares, isSellOnShareValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.market.isValidBid(mediaId, bid.amount)];
                    case 1:
                        isAmountValid = _a.sent();
                        decimal100 = utils_1.Decimal.new(100);
                        return [4 /*yield*/, this.fetchCurrentBidShares(this.media.address, mediaId)];
                    case 2:
                        currentBidShares = _a.sent();
                        isSellOnShareValid = bid.sellOnShare.value.lte(decimal100.value.sub(currentBidShares.creator.value));
                        return [2 /*return*/, isAmountValid && isSellOnShareValid];
                }
            });
        });
    };
    /****************
     * Miscellaneous
     * **************
     */
    /**
     * Returns the EIP-712 Domain for an instance of the Zap Media Contract
     */
    ZapMedia.prototype.eip712Domain = function () {
        // Due to a bug in ganache-core, set the chainId to 1 if its a local blockchain
        // https://github.com/trufflesuite/ganache-core/issues/515
        var chainId = this.networkId == 1337 ? 1 : this.networkId;
        return {
            name: "TEST COLLECTION",
            version: "1",
            chainId: chainId,
            verifyingContract: this.media.address,
        };
    };
    return ZapMedia;
}());
exports.default = ZapMedia;
//# sourceMappingURL=zapMedia.js.map