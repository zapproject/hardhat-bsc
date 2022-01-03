"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractAddresses = void 0;
var addresses_1 = require("./addresses");
var tiny_invariant_1 = __importDefault(require("tiny-invariant"));
var mediaFactoryAddress;
var zapMarketAddress;
var zapMediaAddress;
/**
   * Returns the MediaFactory, ZapMarket, and ZapMedia contract addresses depending on the networkId.
   * @param {string} networkId- The numeric value that routes to a blockchain network.
   */
var contractAddresses = function (networkId) {
    if (networkId === 31337) {
        mediaFactoryAddress = addresses_1.mediaFactoryAddresses['31337'];
        zapMarketAddress = addresses_1.zapMarketAddresses['31337'];
        zapMediaAddress = addresses_1.zapMediaAddresses['31337'];
        return {
            mediaFactoryAddress: mediaFactoryAddress,
            zapMarketAddress: zapMarketAddress,
            zapMediaAddress: zapMediaAddress
        };
    }
    else if (networkId === 4) {
        mediaFactoryAddress = addresses_1.mediaFactoryAddresses['4'];
        zapMarketAddress = addresses_1.zapMarketAddresses['4'];
        zapMediaAddress = addresses_1.zapMediaAddresses['4'];
        return {
            mediaFactoryAddress: mediaFactoryAddress,
            zapMarketAddress: zapMarketAddress,
            zapMediaAddress: zapMediaAddress
        };
    }
    else if (networkId === 97) {
        mediaFactoryAddress = addresses_1.mediaFactoryAddresses['97'];
        zapMarketAddress = addresses_1.zapMarketAddresses['97'];
        zapMediaAddress = addresses_1.zapMediaAddresses['97'];
        return {
            mediaFactoryAddress: mediaFactoryAddress,
            zapMarketAddress: zapMarketAddress,
            zapMediaAddress: zapMediaAddress
        };
    }
    else if (networkId === 1) {
        mediaFactoryAddress = addresses_1.mediaFactoryAddresses['1'];
        zapMarketAddress = addresses_1.zapMarketAddresses['1'];
        zapMediaAddress = addresses_1.zapMediaAddresses['1'];
        return {
            mediaFactoryAddress: mediaFactoryAddress,
            zapMarketAddress: zapMarketAddress,
            zapMediaAddress: zapMediaAddress
        };
    }
    else if (networkId === 56) {
        mediaFactoryAddress = addresses_1.mediaFactoryAddresses['56'];
        zapMarketAddress = addresses_1.zapMarketAddresses['56'];
        zapMediaAddress = addresses_1.zapMediaAddresses['56'];
        return {
            mediaFactoryAddress: mediaFactoryAddress,
            zapMarketAddress: zapMarketAddress,
            zapMediaAddress: zapMediaAddress
        };
    }
    else {
        (0, tiny_invariant_1.default)(false, 'ZapMedia Constructor: Network Id is not supported.');
    }
};
exports.contractAddresses = contractAddresses;
//# sourceMappingURL=utils.js.map