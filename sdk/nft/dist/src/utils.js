"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAndParseAddress = exports.validateURI = exports.constructBidShares = exports.constructMediaData = exports.Decimal = exports.constructBid = exports.constructAsk = exports.validateBidShares = exports.contractAddresses = void 0;
var addresses_1 = require("./contract/addresses");
var tiny_invariant_1 = __importDefault(require("tiny-invariant"));
var tiny_warning_1 = __importDefault(require("tiny-warning"));
var ethers_1 = require("ethers");
var mediaFactoryAddress;
var zapMarketAddress;
var zapMediaAddress;
var zapAuctionAddress;
/**
 * Returns the MediaFactory, ZapMarket, and ZapMedia contract addresses depending on the networkId.
 * @param {string} networkId- The numeric value that routes to a blockchain network.
 */
var contractAddresses = function (networkId) {
    if (networkId === 1337) {
        mediaFactoryAddress = addresses_1.mediaFactoryAddresses["1337"];
        zapMarketAddress = addresses_1.zapMarketAddresses["1337"];
        zapMediaAddress = addresses_1.zapMediaAddresses["1337"];
        zapAuctionAddress = addresses_1.zapAuctionAddresses["1337"];
        return {
            mediaFactoryAddress: mediaFactoryAddress,
            zapMarketAddress: zapMarketAddress,
            zapMediaAddress: zapMediaAddress,
            zapAuctionAddress: zapAuctionAddress,
        };
    }
    else if (networkId === 4) {
        mediaFactoryAddress = addresses_1.mediaFactoryAddresses["4"];
        zapMarketAddress = addresses_1.zapMarketAddresses["4"];
        zapMediaAddress = addresses_1.zapMediaAddresses["4"];
        zapAuctionAddress = addresses_1.zapAuctionAddresses["4"];
        return {
            mediaFactoryAddress: mediaFactoryAddress,
            zapMarketAddress: zapMarketAddress,
            zapMediaAddress: zapMediaAddress,
            zapAuctionAddress: zapAuctionAddress,
        };
    }
    else if (networkId === 97) {
        mediaFactoryAddress = addresses_1.mediaFactoryAddresses["97"];
        zapMarketAddress = addresses_1.zapMarketAddresses["97"];
        zapMediaAddress = addresses_1.zapMediaAddresses["97"];
        zapAuctionAddress = addresses_1.zapAuctionAddresses["97"];
        return {
            mediaFactoryAddress: mediaFactoryAddress,
            zapMarketAddress: zapMarketAddress,
            zapMediaAddress: zapMediaAddress,
            zapAuctionAddress: zapAuctionAddress,
        };
    }
    else if (networkId === 1) {
        mediaFactoryAddress = addresses_1.mediaFactoryAddresses["1"];
        zapMarketAddress = addresses_1.zapMarketAddresses["1"];
        zapMediaAddress = addresses_1.zapMediaAddresses["1"];
        zapAuctionAddress = addresses_1.zapAuctionAddresses["1"];
        return {
            mediaFactoryAddress: mediaFactoryAddress,
            zapMarketAddress: zapMarketAddress,
            zapMediaAddress: zapMediaAddress,
            zapAuctionAddress: zapAuctionAddress,
        };
    }
    else if (networkId === 56) {
        mediaFactoryAddress = addresses_1.mediaFactoryAddresses["56"];
        zapMarketAddress = addresses_1.zapMarketAddresses["56"];
        zapMediaAddress = addresses_1.zapMediaAddresses["56"];
        zapAuctionAddress = addresses_1.zapAuctionAddresses["56"];
        return {
            mediaFactoryAddress: mediaFactoryAddress,
            zapMarketAddress: zapMarketAddress,
            zapMediaAddress: zapMediaAddress,
            zapAuctionAddress: zapAuctionAddress,
        };
    }
    else {
        (0, tiny_invariant_1.default)(false, "Constructor: Network Id is not supported.");
    }
};
exports.contractAddresses = contractAddresses;
var validateBidShares = function (collabShares, creator, owner) {
    // Counter for collabShares sum
    var collabShareSum = ethers_1.BigNumber.from(0);
    // Converts 100 to a Decimal hexString value
    // The hexString value represents 100e18
    // BidShares must sum to 100 and this value is used to check against it
    var decimal100 = Decimal.new(100);
    // Converts 5 to a Decimal hexString value
    // The hexString value represents 5e18
    // The market fee is 5 percent of the bidShares
    var decimalMarketFee = Decimal.new(5);
    for (var i = 0; i < collabShares.length; i++) {
        collabShareSum = collabShareSum.add(BigInt(parseInt(collabShares[i].toString())));
    }
    var sum = collabShareSum
        .add(creator.value)
        .add(owner.value)
        .add(decimalMarketFee.value);
    if (sum.toString() != decimal100.value.toString()) {
        (0, tiny_invariant_1.default)(false, "The BidShares sum to ".concat(sum.toString(), ", but they must sum to ").concat(decimal100.value.toString()));
    }
};
exports.validateBidShares = validateBidShares;
/**
 * Constructs an Ask.
 *
 * @param currency
 * @param amount
 */
function constructAsk(currency, amount) {
    return {
        currency: currency,
        amount: amount,
    };
}
exports.constructAsk = constructAsk;
/**
 * Constructs a Bid.
 *
 * @param currency
 * @param amount
 * @param bidder
 * @param recipient
 * @param sellOnShare
 */
function constructBid(currency, amount, bidder, recipient, sellOnShare) {
    var parsedCurrency;
    var parsedBidder;
    var parsedRecipient;
    try {
        parsedCurrency = validateAndParseAddress(currency);
    }
    catch (err) {
        throw new Error("Currency address is invalid: ".concat(err.message));
    }
    try {
        parsedBidder = validateAndParseAddress(bidder);
    }
    catch (err) {
        throw new Error("Bidder address is invalid: ".concat(err.message));
    }
    try {
        parsedRecipient = validateAndParseAddress(recipient);
    }
    catch (err) {
        throw new Error("Recipient address is invalid: ".concat(err.message));
    }
    var decimalSellOnShare = Decimal.new(parseFloat(sellOnShare.toFixed(4)));
    return {
        currency: parsedCurrency,
        amount: amount,
        bidder: parsedBidder,
        recipient: parsedRecipient,
        sellOnShare: decimalSellOnShare,
    };
}
exports.constructBid = constructBid;
/**
 * Decimal is a class to make it easy to go from Javascript / Typescript `number` | `string`
 * to ethers `BigDecimal` with the ability to customize precision
 */
var Decimal = /** @class */ (function () {
    function Decimal() {
    }
    /**
     * Returns a `DecimalValue` type from the specified value and precision
     * @param value
     * @param precision
     */
    Decimal.new = function (value, precision) {
        if (precision === void 0) { precision = 18; }
        (0, tiny_invariant_1.default)(precision % 1 == 0 && precision <= 18 && precision > -1, "".concat(precision.toString(), " must be a non-negative integer less than or equal to 18"));
        // if type of string, ensure it represents a floating point number or integer
        if (typeof value == "string") {
            (0, tiny_invariant_1.default)(value.match(/^[-+]?[0-9]*\.?[0-9]+$/), "value must represent a floating point number or integer");
        }
        else {
            value = value.toString();
        }
        var decimalPlaces = Decimal.countDecimals(value);
        // require that the specified precision is at least as large as the number of decimal places of value
        (0, tiny_invariant_1.default)(precision >= decimalPlaces, "Precision: ".concat(precision, " must be greater than or equal the number of decimal places: ").concat(decimalPlaces, " in value: ").concat(value));
        var difference = precision - decimalPlaces;
        var zeros = ethers_1.BigNumber.from(10).pow(difference);
        var abs = ethers_1.BigNumber.from("".concat(value.replace(".", "")));
        return { value: abs.mul(zeros) };
    };
    /**
     * Returns the number of decimals for value
     * @param value
     */
    Decimal.countDecimals = function (value) {
        if (value.includes("."))
            return value.split(".")[1].length || 0;
        return 0;
    };
    return Decimal;
}());
exports.Decimal = Decimal;
/**
 * Constructs a MediaData type.
 *
 * @param tokenURI
 * @param metadataURI
 * @param contentHash
 * @param metadataHash
 */
function constructMediaData(tokenURI, metadataURI, contentHash, metadataHash) {
    // validate the hash to ensure it fits in bytes32
    //   validateBytes32(contentHash);
    //   validateBytes32(metadataHash);
    //   validateURI(tokenURI);
    //   validateURI(metadataURI);
    return {
        tokenURI: tokenURI,
        metadataURI: metadataURI,
        contentHash: contentHash,
        metadataHash: metadataHash,
    };
}
exports.constructMediaData = constructMediaData;
/**
 * Constructs a BidShares type.
 * Throws an error if the BidShares do not sum to 100 with 18 trailing decimals.
 *
 * @param creator
 * @param owner
 * @param prevOwner
 */
function constructBidShares(collaborators, collabShares, creator, owner) {
    // Store the collabShares Decimal values
    var decimalCollabShares = [];
    for (var i = 0; i < collabShares.length; i++) {
        // Converts the collabShare integers to a Decimal hexString value
        // The hexString value represents a collabShare integer to the 18th
        decimalCollabShares.push(Decimal.new(parseFloat(collabShares[i].toFixed(4))).value);
    }
    // Converts the creator integer to a Decimal hexString value
    // The hexString value represents the creator integer to the 18th
    var decimalCreator = Decimal.new(parseFloat(creator.toFixed(4)));
    // Converts the owner integer to a Decimal hexString value
    // The hexString value represents the owner integer to the 18th
    var decimalOwner = Decimal.new(parseFloat(owner.toFixed(4)));
    (0, exports.validateBidShares)(decimalCollabShares, decimalCreator, decimalOwner);
    return {
        collaborators: collaborators,
        collabShares: decimalCollabShares,
        creator: decimalCreator,
        owner: decimalOwner,
    };
}
exports.constructBidShares = constructBidShares;
/**
 * Validates the URI is prefixed with `https://`
 *
 * @param uri
 */
function validateURI(uri) {
    if (!uri.match(/^https:\/\/(.*)/)) {
        (0, tiny_invariant_1.default)(false, "".concat(uri, " must begin with `https://`"));
    }
}
exports.validateURI = validateURI;
/**
 * Validates and returns the checksummed address
 *
 * @param address
 */
function validateAndParseAddress(address) {
    try {
        var checksummedAddress = ethers_1.ethers.utils.getAddress(address);
        (0, tiny_warning_1.default)(address === checksummedAddress, "".concat(address, " is not checksummed."));
        return checksummedAddress;
    }
    catch (error) {
        (0, tiny_invariant_1.default)(false, "".concat(address, " is not a valid address."));
    }
}
exports.validateAndParseAddress = validateAndParseAddress;
//# sourceMappingURL=utils.js.map