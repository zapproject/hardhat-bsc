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
    function ZapMedia(networkId, signer, mediaIndex) {
        this.networkId = networkId;
        this.signer = signer;
        this.mediaIndex = mediaIndex;
        this.market = new ethers_1.ethers.Contract((0, utils_1.contractAddresses)(networkId).zapMarketAddress, abi_1.zapMarketAbi, signer);
        if (mediaIndex === undefined) {
            this.media = new ethers_1.ethers.Contract((0, utils_1.contractAddresses)(networkId).zapMediaAddress, abi_1.zapMediaAbi, signer);
        }
        else {
        }
    }
    /*********************
     * Zap View Methods
     *********************
     */
    ZapMedia.prototype.fetchBalanceOf = function (owner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.media.balanceOf(owner)];
            });
        });
    };
    /**
     * Fetches the owner of the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    ZapMedia.prototype.fetchOwnerOf = function (mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.media.ownerOf(mediaId)];
            });
        });
    };
    /**
     * Fetches the mediaId of the specified owner by index on an instance of the Zap Media Contract
     * @param owner
     * @param index
     */
    ZapMedia.prototype.fetchMediaOfOwnerByIndex = function (owner, index) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (owner === ethers_1.ethers.constants.AddressZero) {
                    (0, tiny_invariant_1.default)(false, 'ZapMedia (fetchMediaOfOwnerByIndex): The (owner) address cannot be a zero address.');
                }
                return [2 /*return*/, this.media.tokenOfOwnerByIndex(owner, index)];
            });
        });
    };
    /**
     * Fetches the content uri for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    ZapMedia.prototype.fetchContentURI = function (mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.media.tokenURI(mediaId)];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        (0, tiny_invariant_1.default)(false, 'ZapMedia (fetchContentURI): TokenId does not exist.');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetches the metadata uri for the specified media on an instance of the ZAP Media Contract
     * @param mediaId
     */
    ZapMedia.prototype.fetchMetadataURI = function (mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.media.tokenMetadataURI(mediaId)];
            });
        });
    };
    /**
     * Fetches the content hash for the specified media on the ZapMedia Contract
     * @param mediaId
     */
    ZapMedia.prototype.fetchContentHash = function (mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.media.getTokenContentHashes(mediaId)];
            });
        });
    };
    /**
     * Fetches the metadata hash for the specified media on the ZapMedia Contract
     * @param mediaId
     */
    ZapMedia.prototype.fetchMetadataHash = function (mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.media.getTokenMetadataHashes(mediaId)];
            });
        });
    };
    /**
     * Fetches the creator for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    ZapMedia.prototype.fetchCreator = function (mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.media.ownerOf(mediaId)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        (0, tiny_invariant_1.default)(false, 'ZapMedia (fetchCreator): TokenId does not exist.');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, this.media.getTokenCreators(mediaId)];
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
     * Fetches the total amount of non-burned media that has been minted on an instance of the Zap Media Contract
     */
    ZapMedia.prototype.fetchTotalMedia = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
                            (0, tiny_invariant_1.default)(false, 'ZapMedia (tokenByIndex): Index out of range.');
                        }
                        return [2 /*return*/, this.media.tokenByIndex(index)];
                }
            });
        });
    };
    /**
     * Fetches the approved account for the specified media on an instance of the Zap Media Contract
     * @param mediaId
     */
    ZapMedia.prototype.fetchApproved = function (mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.media.getApproved(mediaId)];
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
            var err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.media.updateTokenURI(mediaId, tokenURI)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_2 = _a.sent();
                        (0, tiny_invariant_1.default)(false, 'ZapMedia (updateContentURI): TokenId does not exist.');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /***********************
     * ERC-721 Write Methods
     ***********************
     */
    /**
     * Grants approval to the specified address for the specified media on an instance of the Zap Media Contract
     * @param to
     * @param mediaId
     */
    ZapMedia.prototype.approve = function (to, mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.media.approve(to, mediaId)];
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
                        (0, tiny_invariant_1.default)(false, 'ZapMedia (safeTransferFrom): TokenId does not exist.');
                        return [3 /*break*/, 3];
                    case 3:
                        if (from === ethers_1.ethers.constants.AddressZero) {
                            (0, tiny_invariant_1.default)(false, 'ZapMedia (safeTransferFrom): The (from) address cannot be a zero address.');
                        }
                        if (to === ethers_1.ethers.constants.AddressZero) {
                            (0, tiny_invariant_1.default)(false, 'ZapMedia (safeTransferFrom): The (to) address cannot be a zero address.');
                        }
                        return [2 /*return*/, this.media['safeTransferFrom(address,address,uint256)'](from, to, mediaId)];
                }
            });
        });
    };
    /**
     * Mints a new piece of media on an instance of the Zap Media Contract
     * @param mintData
     * @param bidShares
     */
    ZapMedia.prototype.mint = function (mediaData, bidShares) {
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
                        return [4 /*yield*/, this.media.estimateGas.mint(mediaData, bidShares)];
                    case 1:
                        gasEstimate = _a.sent();
                        return [2 /*return*/, this.media.mint(mediaData, bidShares, { gasLimit: gasEstimate })];
                }
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
                        if (tokenOwner !== signerAddress && isApproved === ethers_1.ethers.constants.AddressZero) {
                            (0, tiny_invariant_1.default)(false, 'ZapMedia (setAsk): Media: Only approved or owner.');
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
                        (0, tiny_invariant_1.default)(false, 'ZapMedia (removeAsk): TokenId does not exist.');
                        return [3 /*break*/, 5];
                    case 5:
                        if (ask.amount == 0) {
                            (0, tiny_invariant_1.default)(false, 'ZapMedia (removeAsk): Ask was never set.');
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
                        return [2 /*return*/, this.media.updateTokenMetadataURI(mediaId, metadataURI, { gasLimit: gasEstimate })];
                }
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
    return ZapMedia;
}());
exports.default = ZapMedia;
//# sourceMappingURL=zapMedia.js.map