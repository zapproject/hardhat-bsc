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
// Chai test method
var chai_1 = require("chai");
// Ethers Types
var ethers_1 = require("ethers");
// ZapMarket ABI
var abi_1 = require("../abi");
// MediaFactory class
var mediaFactory_1 = __importDefault(require("../mediaFactory"));
// ZapMarket localhost address
var addresses_1 = require("../addresses");
// Hardhat localhost connection
var provider = new ethers_1.ethers.providers.JsonRpcProvider('http://localhost:8545');
/**
   * Creates the ZapMarket instance.
   * @param {object} signer - Hardhat localhost abstraction of an Ethereum account.
   */
function deployMarket(signer) {
    // Creates the instance of ZapMarket
    var zapMarket = new ethers_1.ethers.Contract(addresses_1.zapMarketAddresses['31337'], abi_1.zapMarketAbi, signer);
    // Returns the ZapMarket instance
    return zapMarket;
}
describe("MediaFactory", function () {
    // Hardhat signers[0]: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
    var signer1;
    var mediaFactory;
    var zapMarket;
    var media;
    var mediaAddress;
    before(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Hardhat localhost account: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
                    signer1 = provider.getSigner(1);
                    /*Instantiates the MediaFactory class by passing in
                     the chainId for the Hardhat localhost node on port 8545
                     and the Hardhat localhost account
                    */
                    mediaFactory = new mediaFactory_1.default(31337, signer1);
                    // ZapMarket contract instance
                    zapMarket = deployMarket(signer1);
                    return [4 /*yield*/, mediaFactory.deployMedia("Test Collection", "TC", false, "ipfs://testing")];
                case 1:
                    // Deploys a media collection through the mediaFactory
                    media = _a.sent();
                    // Address of the deployed media collection
                    mediaAddress = media.args.mediaContract;
                    return [2 /*return*/];
            }
        });
    }); });
    it("Should be able to deploy a Media collection", function () { return __awaiter(void 0, void 0, void 0, function () {
        var eventName;
        return __generator(this, function (_a) {
            eventName = media.event;
            // The emitted name should equal MediaDeployed
            (0, chai_1.expect)(eventName).to.equal('MediaDeployed');
            return [2 /*return*/];
        });
    }); });
    it("Should emit a MediaContractCreated event on configuration", function () { return __awaiter(void 0, void 0, void 0, function () {
        var filter, eventLogs, event;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    filter = zapMarket.filters.MediaContractCreated(null, null, null);
                    return [4 /*yield*/, zapMarket.queryFilter(filter)
                        // Gets the MediaContractCreated event associated with this deployment
                    ];
                case 1:
                    eventLogs = _d.sent();
                    event = eventLogs[eventLogs.length - 1];
                    // The emitted event should equal MediaContractCreated
                    (0, chai_1.expect)(event.event).to.equal("MediaContractCreated");
                    // The emitted MediaContractCreated address should equal the emitted MediaDeployed address
                    (0, chai_1.expect)((_a = event.args) === null || _a === void 0 ? void 0 : _a.mediaContract).to.equal(mediaAddress);
                    // The emitted collection name should equal the collection name set on deployment
                    (0, chai_1.expect)((_b = event.args) === null || _b === void 0 ? void 0 : _b.name).to.equal(ethers_1.ethers.utils.formatBytes32String('Test Collection'));
                    // The emitted collection symbol should equal the collection symbol set on deployment
                    (0, chai_1.expect)((_c = event.args) === null || _c === void 0 ? void 0 : _c.symbol).to.equal(ethers_1.ethers.utils.formatBytes32String('TC'));
                    return [2 /*return*/];
            }
        });
    }); });
    it("Should be registered to MediaFactory", function () { return __awaiter(void 0, void 0, void 0, function () {
        var isRegistered;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, zapMarket.isRegistered(mediaAddress)];
                case 1:
                    isRegistered = _a.sent();
                    // Registration status should equal true
                    (0, chai_1.expect)(isRegistered).to.equal(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it("Should be configured to ZapMarket", function () { return __awaiter(void 0, void 0, void 0, function () {
        var isConfigured;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, zapMarket.isConfigured(mediaAddress)];
                case 1:
                    isConfigured = _a.sent();
                    // Configuration status should equal true
                    (0, chai_1.expect)(isConfigured).to.equal(true);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=mediaFactory.test.js.map