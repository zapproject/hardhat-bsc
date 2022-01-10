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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployZapMedia = exports.deployMediaFactory = exports.deployZapMediaImpl = exports.deployZapMarket = exports.deployZapVault = exports.deployZapToken = void 0;
var ethers_1 = require("ethers");
var abis = __importStar(require("./contract/abi"));
var bytecodes = __importStar(require("./contract/bytecode"));
var provider = new ethers_1.ethers.providers.JsonRpcProvider('http://localhost:8545');
var signer = provider.getSigner(0);
var zapTokenAddress;
var zapVaultAddress;
var zapMarketAddress;
var zapMediaImplAddress;
var mediaFactoryAddress;
var deployZapToken = function () { return __awaiter(void 0, void 0, void 0, function () {
    var tokenFactory, zapToken;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                tokenFactory = new ethers_1.ethers.ContractFactory(abis.zapTokenBscAbi, bytecodes.zapTokenBscBytecode, signer);
                return [4 /*yield*/, tokenFactory.deploy()];
            case 1:
                zapToken = _a.sent();
                return [4 /*yield*/, zapToken.deployed()];
            case 2:
                _a.sent();
                zapTokenAddress = zapToken.address;
                return [2 /*return*/, zapToken];
        }
    });
}); };
exports.deployZapToken = deployZapToken;
var deployZapVault = function () { return __awaiter(void 0, void 0, void 0, function () {
    var vaultFactory, zapVault;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                vaultFactory = new ethers_1.ethers.ContractFactory(abis.zapVaultAbi, bytecodes.zapVaultBytecode, signer);
                return [4 /*yield*/, vaultFactory.deploy()];
            case 1:
                zapVault = _a.sent();
                return [4 /*yield*/, zapVault.deployed()];
            case 2:
                _a.sent();
                zapVault.initializeVault(zapTokenAddress);
                zapVaultAddress = zapVault.address;
                return [2 /*return*/, zapVault];
        }
    });
}); };
exports.deployZapVault = deployZapVault;
var deployZapMarket = function () { return __awaiter(void 0, void 0, void 0, function () {
    var platformFee, marketFactory, zapMarket;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                platformFee = {
                    fee: {
                        value: ethers_1.BigNumber.from('5000000000000000000'),
                    },
                };
                marketFactory = new ethers_1.ethers.ContractFactory(abis.zapMarketAbi, bytecodes.zapMarketBytecode, signer);
                return [4 /*yield*/, marketFactory.deploy()];
            case 1:
                zapMarket = _a.sent();
                return [4 /*yield*/, zapMarket.deployed()];
            case 2:
                _a.sent();
                zapMarketAddress = zapMarket.address;
                return [4 /*yield*/, zapMarket.initializeMarket(zapVaultAddress)];
            case 3:
                _a.sent();
                return [4 /*yield*/, zapMarket.setFee(platformFee)];
            case 4:
                _a.sent();
                return [2 /*return*/, zapMarket];
        }
    });
}); };
exports.deployZapMarket = deployZapMarket;
var deployZapMediaImpl = function () { return __awaiter(void 0, void 0, void 0, function () {
    var mediaFactory, zapMedia;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mediaFactory = new ethers_1.ethers.ContractFactory(abis.zapMediaAbi, bytecodes.zapMediaBytecode, signer);
                return [4 /*yield*/, mediaFactory.deploy()];
            case 1:
                zapMedia = _a.sent();
                return [4 /*yield*/, zapMedia.deployed()];
            case 2:
                _a.sent();
                zapMediaImplAddress = zapMedia.address;
                return [2 /*return*/, zapMedia];
        }
    });
}); };
exports.deployZapMediaImpl = deployZapMediaImpl;
var deployMediaFactory = function () { return __awaiter(void 0, void 0, void 0, function () {
    var mediaFactoryFactory, mediaFactory;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mediaFactoryFactory = new ethers_1.ethers.ContractFactory(abis.mediaFactoryAbi, bytecodes.mediaFactoryBytecode, signer);
                return [4 /*yield*/, mediaFactoryFactory.deploy()];
            case 1:
                mediaFactory = _a.sent();
                return [4 /*yield*/, mediaFactory.deployed()];
            case 2:
                _a.sent();
                mediaFactoryAddress = mediaFactory.address;
                return [4 /*yield*/, mediaFactory.initialize(zapMarketAddress, zapMediaImplAddress)];
            case 3:
                _a.sent();
                return [2 /*return*/, mediaFactory];
        }
    });
}); };
exports.deployMediaFactory = deployMediaFactory;
var deployZapMedia = function () { return __awaiter(void 0, void 0, void 0, function () {
    var zapMarket, mediaFactory, deployMedia, receipt, eventLogs, zapMediaAddress, zapMedia;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                zapMarket = new ethers_1.ethers.Contract(zapMarketAddress, abis.zapMarketAbi, signer);
                mediaFactory = new ethers_1.ethers.Contract(mediaFactoryAddress, abis.mediaFactoryAbi, signer);
                // Sets the MediaFactory to ZapMarket
                return [4 /*yield*/, zapMarket.setMediaFactory(mediaFactoryAddress)];
            case 1:
                // Sets the MediaFactory to ZapMarket
                _a.sent();
                return [4 /*yield*/, mediaFactory.deployMedia('TEST COLLECTION', 'TC', zapMarket.address, true, 'https://testing.com')];
            case 2:
                deployMedia = _a.sent();
                return [4 /*yield*/, deployMedia.wait()];
            case 3:
                receipt = _a.sent();
                eventLogs = receipt.events[receipt.events.length - 1];
                zapMediaAddress = eventLogs.args.mediaContract;
                zapMedia = new ethers_1.ethers.Contract(zapMediaAddress, abis.zapMediaAbi, signer);
                return [4 /*yield*/, zapMedia.deployed()];
            case 4:
                _a.sent();
                return [4 /*yield*/, zapMedia.claimTransferOwnership()];
            case 5:
                _a.sent();
                return [2 /*return*/, zapMedia];
        }
    });
}); };
exports.deployZapMedia = deployZapMedia;
//# sourceMappingURL=deploy.js.map