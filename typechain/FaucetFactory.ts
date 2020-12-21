/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { Faucet } from "./Faucet";

export class FaucetFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(_token: string, overrides?: Overrides): Promise<Faucet> {
    return super.deploy(_token, overrides || {}) as Promise<Faucet>;
  }
  getDeployTransaction(
    _token: string,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(_token, overrides || {});
  }
  attach(address: string): Faucet {
    return super.attach(address) as Faucet;
  }
  connect(signer: Signer): FaucetFactory {
    return super.connect(signer) as FaucetFactory;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Faucet {
    return new Contract(address, _abi, signerOrProvider) as Faucet;
  }
}

const _abi = [
  {
    constant: false,
    inputs: [],
    name: "withdrawTok",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "rate",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "withdrawEther",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "buyZap",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "_token",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_buyer",
        type: "address",
      },
      {
        indexed: true,
        name: "_amount",
        type: "uint256",
      },
      {
        indexed: true,
        name: "_rate",
        type: "uint256",
      },
    ],
    name: "BUYZAP",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "n1",
        type: "uint256",
      },
      {
        indexed: false,
        name: "n2",
        type: "uint256",
      },
    ],
    name: "Log",
    type: "event",
  },
];

const _bytecode =
  "0x60806040526103e860025534801561001657600080fd5b506040516020806108088339810180604052810190808051906020019092919050505033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505061073e806100ca6000396000f30060806040526004361061006d576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630f33a2a9146100725780632c4e722e146100895780637362377b146100b457806385a33e75146100cb5780638da5cb5b146100d5575b600080fd5b34801561007e57600080fd5b5061008761012c565b005b34801561009557600080fd5b5061009e6103a2565b6040518082815260200191505060405180910390f35b3480156100c057600080fd5b506100c96103a8565b005b6100d3610486565b005b3480156100e157600080fd5b506100ea6106ec565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561018857600080fd5b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001915050602060405180830381600087803b1580156102a457600080fd5b505af11580156102b8573d6000803e3d6000fd5b505050506040513d60208110156102ce57600080fd5b81019080805190602001909291905050506040518363ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050602060405180830381600087803b15801561036457600080fd5b505af1158015610378573d6000803e3d6000fd5b505050506040513d602081101561038e57600080fd5b810190808051906020019092919050505050565b60025481565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561040457600080fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc3073ffffffffffffffffffffffffffffffffffffffff16319081150290604051600060405180830381858888f19350505050158015610483573d6000803e3d6000fd5b50565b6000803411151561049657600080fd5b600254340290506000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001915050602060405180830381600087803b15801561055957600080fd5b505af115801561056d573d6000803e3d6000fd5b505050506040513d602081101561058357600080fd5b810190808051906020019092919050505081111515156105a257600080fd5b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb33836040518363ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050602060405180830381600087803b15801561066657600080fd5b505af115801561067a573d6000803e3d6000fd5b505050506040513d602081101561069057600080fd5b810190808051906020019092919050505050600254813373ffffffffffffffffffffffffffffffffffffffff167f46a678f82b3e0eafe7564f8c981cd0f62c33d33d29ecac048008ca14ecd0997a60405160405180910390a450565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16815600a165627a7a72305820815063031f3059c4acddcb39b0c506408d703dbcd81c631c5db4ecd4947a35300029";
