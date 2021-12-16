'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.mediaFactoryAbi = void 0;
exports.mediaFactoryAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'extToken',
        type: 'address',
      },
    ],
    name: 'ExternalTokenDeployed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'mediaContract',
        type: 'address',
      },
    ],
    name: 'MediaDeployed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'marketContractAddr',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'permissive',
        type: 'bool',
      },
      {
        internalType: 'string',
        name: '_collectionMetadata',
        type: 'string',
      },
    ],
    name: 'deployMedia',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_zapMarket',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'zapMediaInterface',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newInterface',
        type: 'address',
      },
    ],
    name: 'upgradeMedia',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
//# sourceMappingURL=abi.js.map
