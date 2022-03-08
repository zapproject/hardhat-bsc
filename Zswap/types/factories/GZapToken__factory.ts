/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { GZapToken } from "../GZapToken";

export class GZapToken__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<GZapToken> {
    return super.deploy(overrides || {}) as Promise<GZapToken>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): GZapToken {
    return super.attach(address) as GZapToken;
  }
  connect(signer: Signer): GZapToken__factory {
    return super.connect(signer) as GZapToken__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): GZapToken {
    return new Contract(address, _abi, signerOrProvider) as GZapToken;
  }
}

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "delegator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "fromDelegate",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "toDelegate",
        type: "address",
      },
    ],
    name: "DelegateChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "delegate",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "previousBalance",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newBalance",
        type: "uint256",
      },
    ],
    name: "DelegateVotesChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "DELEGATION_TYPEHASH",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DOMAIN_TYPEHASH",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    name: "checkpoints",
    outputs: [
      {
        internalType: "uint32",
        name: "fromBlock",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "votes",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "delegatee",
        type: "address",
      },
    ],
    name: "delegate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "delegatee",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expiry",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "delegateBySig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "delegator",
        type: "address",
      },
    ],
    name: "delegates",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "getCurrentVotes",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
    ],
    name: "getPriorVotes",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "nonces",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "numCheckpoints",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604080518082018252600981526823ad30b82a37b5b2b760b91b6020808301918252835180850190945260048452630475a41560e41b9084015281519192916200005f91600391620000f1565b50805162000075906004906020840190620000f1565b50506005805460ff1916601217905550600062000091620000ed565b60058054610100600160a81b0319166101006001600160a01b03841690810291909117909155604051919250906000907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a3506200018d565b3390565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200013457805160ff191683800117855562000164565b8280016001018555821562000164579182015b828111156200016457825182559160200191906001019062000147565b506200017292915062000176565b5090565b5b8082111562000172576000815560010162000177565b611b1b806200019d6000396000f3fe608060405234801561001057600080fd5b50600436106101735760003560e01c8063715018a6116100de578063a9059cbb11610097578063dd62ed3e11610071578063dd62ed3e14610501578063e7a324dc1461052f578063f1127ed814610537578063f2fde38b1461058957610173565b8063a9059cbb14610468578063b4b5ea5714610494578063c3cda520146104ba57610173565b8063715018a6146103d2578063782d6fe1146103da5780637ecebe00146104065780638da5cb5b1461042c57806395d89b4114610434578063a457c2d71461043c57610173565b8063395093511161013057806339509351146102ab57806340c10f19146102d7578063587cde1e146103055780635c19a95c146103475780636fcfff451461036d57806370a08231146103ac57610173565b806306fdde0314610178578063095ea7b3146101f557806318160ddd1461023557806320606b701461024f57806323b872dd14610257578063313ce5671461028d575b600080fd5b6101806105af565b6040805160208082528351818301528351919283929083019185019080838360005b838110156101ba5781810151838201526020016101a2565b50505050905090810190601f1680156101e75780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102216004803603604081101561020b57600080fd5b506001600160a01b038135169060200135610645565b604080519115158252519081900360200190f35b61023d610663565b60408051918252519081900360200190f35b61023d610669565b6102216004803603606081101561026d57600080fd5b506001600160a01b0381358116916020810135909116906040013561068d565b610295610714565b6040805160ff9092168252519081900360200190f35b610221600480360360408110156102c157600080fd5b506001600160a01b03813516906020013561071d565b610303600480360360408110156102ed57600080fd5b506001600160a01b03813516906020013561076b565b005b61032b6004803603602081101561031b57600080fd5b50356001600160a01b0316610812565b604080516001600160a01b039092168252519081900360200190f35b6103036004803603602081101561035d57600080fd5b50356001600160a01b0316610830565b6103936004803603602081101561038357600080fd5b50356001600160a01b031661083d565b6040805163ffffffff9092168252519081900360200190f35b61023d600480360360208110156103c257600080fd5b50356001600160a01b0316610855565b610303610870565b61023d600480360360408110156103f057600080fd5b506001600160a01b038135169060200135610934565b61023d6004803603602081101561041c57600080fd5b50356001600160a01b0316610b3c565b61032b610b4e565b610180610b62565b6102216004803603604081101561045257600080fd5b506001600160a01b038135169060200135610bc3565b6102216004803603604081101561047e57600080fd5b506001600160a01b038135169060200135610c2b565b61023d600480360360208110156104aa57600080fd5b50356001600160a01b0316610c3f565b610303600480360360c08110156104d057600080fd5b506001600160a01b038135169060208101359060408101359060ff6060820135169060808101359060a00135610ca3565b61023d6004803603604081101561051757600080fd5b506001600160a01b0381358116916020013516610f16565b61023d610f41565b6105696004803603604081101561054d57600080fd5b5080356001600160a01b0316906020013563ffffffff16610f65565b6040805163ffffffff909316835260208301919091528051918290030190f35b6103036004803603602081101561059f57600080fd5b50356001600160a01b0316610f92565b60038054604080516020601f600260001961010060018816150201909516949094049384018190048102820181019092528281526060939092909183018282801561063b5780601f106106105761010080835404028352916020019161063b565b820191906000526020600020905b81548152906001019060200180831161061e57829003601f168201915b5050505050905090565b60006106596106526110b2565b84846110b6565b5060015b92915050565b60025490565b7f8cad95687ba82c2ce50e74f7b754645e5117c3a5bec8151c0726d5857980a86681565b600061069a8484846111a2565b61070a846106a66110b2565b61070585604051806060016040528060288152602001611a06602891396001600160a01b038a166000908152600160205260408120906106e46110b2565b6001600160a01b0316815260208101919091526040016000205491906112fd565b6110b6565b5060019392505050565b60055460ff1690565b600061065961072a6110b2565b84610705856001600061073b6110b2565b6001600160a01b03908116825260208083019390935260409182016000908120918c168152925290205490611394565b6107736110b2565b6001600160a01b0316610784610b4e565b6001600160a01b0316146107df576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b6107e982826113ee565b6001600160a01b0380831660009081526006602052604081205461080e9216836114de565b5050565b6001600160a01b039081166000908152600660205260409020541690565b61083a3382611620565b50565b60086020526000908152604090205463ffffffff1681565b6001600160a01b031660009081526020819052604090205490565b6108786110b2565b6001600160a01b0316610889610b4e565b6001600160a01b0316146108e4576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b60055460405160009161010090046001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a360058054610100600160a81b0319169055565b60004382106109745760405162461bcd60e51b81526004018080602001828103825260288152602001806119de6028913960400191505060405180910390fd5b6001600160a01b03831660009081526008602052604090205463ffffffff16806109a257600091505061065d565b6001600160a01b038416600090815260076020908152604080832063ffffffff600019860181168552925290912054168310610a11576001600160a01b03841660009081526007602090815260408083206000199490940163ffffffff1683529290522060010154905061065d565b6001600160a01b038416600090815260076020908152604080832083805290915290205463ffffffff16831015610a4c57600091505061065d565b600060001982015b8163ffffffff168163ffffffff161115610b0557600282820363ffffffff16048103610a7e6118d9565b506001600160a01b038716600090815260076020908152604080832063ffffffff808616855290835292819020815180830190925280549093168082526001909301549181019190915290871415610ae05760200151945061065d9350505050565b805163ffffffff16871115610af757819350610afe565b6001820392505b5050610a54565b506001600160a01b038516600090815260076020908152604080832063ffffffff9094168352929052206001015491505092915050565b60096020526000908152604090205481565b60055461010090046001600160a01b031690565b60048054604080516020601f600260001961010060018816150201909516949094049384018190048102820181019092528281526060939092909183018282801561063b5780601f106106105761010080835404028352916020019161063b565b6000610659610bd06110b2565b8461070585604051806060016040528060258152602001611ac16025913960016000610bfa6110b2565b6001600160a01b03908116825260208083019390935260409182016000908120918d168152925290205491906112fd565b6000610659610c386110b2565b84846111a2565b6001600160a01b03811660009081526008602052604081205463ffffffff1680610c6a576000610c9c565b6001600160a01b038316600090815260076020908152604080832063ffffffff60001986011684529091529020600101545b9392505050565b60007f8cad95687ba82c2ce50e74f7b754645e5117c3a5bec8151c0726d5857980a866610cce6105af565b80519060200120610cdd6116b5565b60408051602080820195909552808201939093526060830191909152306080808401919091528151808403909101815260a0830182528051908401207fe48329057bfd03d55e49b547132e39cffd9c1820ad7b9d4c5307691425d15adf60c08401526001600160a01b038b1660e084015261010083018a90526101208084018a9052825180850390910181526101408401835280519085012061190160f01b6101608501526101628401829052610182808501829052835180860390910181526101a285018085528151918701919091206000918290526101c2860180865281905260ff8b166101e287015261020286018a90526102228601899052935192965090949293909260019261024280840193601f198301929081900390910190855afa158015610e10573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b038116610e625760405162461bcd60e51b8152600401808060200182810382526027815260200180611a516027913960400191505060405180910390fd5b6001600160a01b03811660009081526009602052604090208054600181019091558914610ec05760405162461bcd60e51b8152600401808060200182810382526023815260200180611a2e6023913960400191505060405180910390fd5b87421115610eff5760405162461bcd60e51b81526004018080602001828103825260278152602001806119146027913960400191505060405180910390fd5b610f09818b611620565b505050505b505050505050565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b7fe48329057bfd03d55e49b547132e39cffd9c1820ad7b9d4c5307691425d15adf81565b60076020908152600092835260408084209091529082529020805460019091015463ffffffff9091169082565b610f9a6110b2565b6001600160a01b0316610fab610b4e565b6001600160a01b031614611006576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b6001600160a01b03811661104b5760405162461bcd60e51b815260040180806020018281038252602681526020018061193b6026913960400191505060405180910390fd5b6005546040516001600160a01b0380841692610100900416907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a3600580546001600160a01b0390921661010002610100600160a81b0319909216919091179055565b3390565b6001600160a01b0383166110fb5760405162461bcd60e51b8152600401808060200182810382526024815260200180611a9d6024913960400191505060405180910390fd5b6001600160a01b0382166111405760405162461bcd60e51b81526004018080602001828103825260228152602001806119616022913960400191505060405180910390fd5b6001600160a01b03808416600081815260016020908152604080832094871680845294825291829020859055815185815291517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259281900390910190a3505050565b6001600160a01b0383166111e75760405162461bcd60e51b8152600401808060200182810382526025815260200180611a786025913960400191505060405180910390fd5b6001600160a01b03821661122c5760405162461bcd60e51b81526004018080602001828103825260238152602001806118f16023913960400191505060405180910390fd5b61123783838361161b565b61127481604051806060016040528060268152602001611983602691396001600160a01b03861660009081526020819052604090205491906112fd565b6001600160a01b0380851660009081526020819052604080822093909355908416815220546112a39082611394565b6001600160a01b038084166000818152602081815260409182902094909455805185815290519193928716927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92918290030190a3505050565b6000818484111561138c5760405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b83811015611351578181015183820152602001611339565b50505050905090810190601f16801561137e5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b505050900390565b600082820183811015610c9c576040805162461bcd60e51b815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b6001600160a01b038216611449576040805162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015290519081900360640190fd5b6114556000838361161b565b6002546114629082611394565b6002556001600160a01b0382166000908152602081905260409020546114889082611394565b6001600160a01b0383166000818152602081815260408083209490945583518581529351929391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35050565b816001600160a01b0316836001600160a01b0316141580156115005750600081115b1561161b576001600160a01b03831615611592576001600160a01b03831660009081526008602052604081205463ffffffff169081611540576000611572565b6001600160a01b038516600090815260076020908152604080832063ffffffff60001987011684529091529020600101545b9050600061158082856116b9565b905061158e86848484611716565b5050505b6001600160a01b0382161561161b576001600160a01b03821660009081526008602052604081205463ffffffff1690816115cd5760006115ff565b6001600160a01b038416600090815260076020908152604080832063ffffffff60001987011684529091529020600101545b9050600061160d8285611394565b9050610f0e85848484611716565b505050565b6001600160a01b038083166000908152600660205260408120549091169061164784610855565b6001600160a01b0385811660008181526006602052604080822080546001600160a01b031916898616908117909155905194955093928616927f3134e8a2e6d97e929a7e54011ea5485d7d196dd5f0ba4d4ef95803e8e3fc257f9190a46116af8284836114de565b50505050565b4690565b600082821115611710576040805162461bcd60e51b815260206004820152601e60248201527f536166654d6174683a207375627472616374696f6e206f766572666c6f770000604482015290519081900360640190fd5b50900390565b600061173a436040518060600160405280603581526020016119a96035913961187b565b905060008463ffffffff1611801561178357506001600160a01b038516600090815260076020908152604080832063ffffffff6000198901811685529252909120548282169116145b156117c0576001600160a01b038516600090815260076020908152604080832063ffffffff60001989011684529091529020600101829055611831565b60408051808201825263ffffffff808416825260208083018681526001600160a01b038a166000818152600784528681208b8616825284528681209551865490861663ffffffff19918216178755925160019687015590815260089092529390208054928801909116919092161790555b604080518481526020810184905281516001600160a01b038816927fdec2bacdd2f05b59de34da9b523dff8be42e5e38e818c82fdb0bae774387a724928290030190a25050505050565b60008164010000000084106118d15760405162461bcd60e51b8152602060048201818152835160248401528351909283926044909101919085019080838360008315611351578181015183820152602001611339565b509192915050565b60408051808201909152600080825260208201529056fe45524332303a207472616e7366657220746f20746865207a65726f206164647265737353555348493a3a64656c656761746542795369673a207369676e617475726520657870697265644f776e61626c653a206e6577206f776e657220697320746865207a65726f206164647265737345524332303a20617070726f766520746f20746865207a65726f206164647265737345524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e636553555348493a3a5f7772697465436865636b706f696e743a20626c6f636b206e756d6265722065786365656473203332206269747353555348493a3a6765745072696f72566f7465733a206e6f74207965742064657465726d696e656445524332303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e636553555348493a3a64656c656761746542795369673a20696e76616c6964206e6f6e636553555348493a3a64656c656761746542795369673a20696e76616c6964207369676e617475726545524332303a207472616e736665722066726f6d20746865207a65726f206164647265737345524332303a20617070726f76652066726f6d20746865207a65726f206164647265737345524332303a2064656372656173656420616c6c6f77616e63652062656c6f77207a65726fa2646970667358221220c113c7e151644b7a9fbf19d250922973a9fc2d869a937e77fdf52f5ca1cec0cd64736f6c634300060c0033";
