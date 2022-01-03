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
var zapMedia_1 = __importDefault(require("../zapMedia"));
var provider = new ethers_1.ethers.providers.JsonRpcProvider('http://localhost:8545');
var mediaData = function () {
    var tokenURI = 'www.example.com';
    var metadataURI = 'www.example.com';
    var metadataHex = ethers_1.ethers.utils.formatBytes32String(metadataURI);
    var metadataHashRaw = ethers_1.ethers.utils.keccak256(metadataHex);
    var metadataHashBytes = ethers_1.ethers.utils.arrayify(metadataHashRaw);
    var contentHex = ethers_1.ethers.utils.formatBytes32String(tokenURI);
    var contentHashRaw = ethers_1.ethers.utils.keccak256(contentHex);
    var contentHashBytes = ethers_1.ethers.utils.arrayify(contentHashRaw);
    var contentHash = contentHashBytes;
    var metadataHash = metadataHashBytes;
    return {
        tokenURI: tokenURI,
        metadataURI: metadataURI,
        contentHash: contentHash,
        metadataHash: metadataHash,
    };
};
var bidShares = function () {
    var bidShares = {
        collaborators: [],
        collabShares: [],
        creator: {
            value: ethers_1.BigNumber.from('10000000000000000000'),
        },
        owner: {
            value: ethers_1.BigNumber.from('85000000000000000000'),
        },
    };
    return bidShares;
};
describe('ZapMedia', function () {
    // Hardhat signers[0]: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
    var signer1;
    // let signer0: any;
    var zapMedia;
    describe('#constructor', function () {
        it('Should throw an error if the networkId is invalid', function () { return __awaiter(void 0, void 0, void 0, function () {
            var signer;
            return __generator(this, function (_a) {
                signer = ethers_1.Wallet.createRandom();
                (0, chai_1.expect)(function () {
                    new zapMedia_1.default(300, signer);
                }).to.throw('ZapMedia Constructor: Network Id is not supported.');
                return [2 /*return*/];
            });
        }); });
    });
    describe('contract Functions', function () {
        describe('Write Functions', function () {
            describe('#updateContentURI', function () {
                it('Should throw an error if the tokenId does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var signer, zapMedia;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                signer = ethers_1.Wallet.createRandom().connect(provider);
                                zapMedia = new zapMedia_1.default(31337, signer);
                                return [4 /*yield*/, zapMedia.updateContentURI(0, 'tes').should.be.rejectedWith(Error)];
                            case 1: return [2 /*return*/, _a.sent()]; // other variants of Chai's `throw` assertion work too.
                        }
                    });
                }); });
            });
        });
    });
});
//# sourceMappingURL=zapMedia.test.js.map