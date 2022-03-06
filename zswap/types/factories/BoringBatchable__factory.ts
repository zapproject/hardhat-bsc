/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { BoringBatchable } from "../BoringBatchable";

export class BoringBatchable__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<BoringBatchable> {
    return super.deploy(overrides || {}) as Promise<BoringBatchable>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): BoringBatchable {
    return super.attach(address) as BoringBatchable;
  }
  connect(signer: Signer): BoringBatchable__factory {
    return super.connect(signer) as BoringBatchable__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BoringBatchable {
    return new Contract(address, _abi, signerOrProvider) as BoringBatchable;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "calls",
        type: "bytes[]",
      },
      {
        internalType: "bool",
        name: "revertOnFail",
        type: "bool",
      },
    ],
    name: "batch",
    outputs: [
      {
        internalType: "bool[]",
        name: "successes",
        type: "bool[]",
      },
      {
        internalType: "bytes[]",
        name: "results",
        type: "bytes[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
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
    name: "permitToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061069b806100206000396000f3fe6080604052600436106100295760003560e01c80637c516e941461002e578063d2423b5114610050575b600080fd5b34801561003a57600080fd5b5061004e610049366004610375565b61007a565b005b61006361005e3660046102f1565b6100ee565b604051610071929190610514565b60405180910390f35b60405163d505accf60e01b81526001600160a01b0389169063d505accf906100b2908a908a908a908a908a908a908a906004016104d3565b600060405180830381600087803b1580156100cc57600080fd5b505af11580156100e0573d6000803e3d6000fd5b505050505050505050505050565b6060808367ffffffffffffffff8111801561010857600080fd5b50604051908082528060200260200182016040528015610132578160200160208202803683370190505b5091508367ffffffffffffffff8111801561014c57600080fd5b5060405190808252806020026020018201604052801561018057816020015b606081526020019060019003908161016b5790505b50905060005b8481101561028057600060603088888581811061019f57fe5b90506020028101906101b191906105c8565b6040516101bf9291906104c3565b600060405180830381855af49150503d80600081146101fa576040519150601f19603f3d011682016040523d82523d6000602084013e6101ff565b606091505b5091509150818061020e575085155b61021782610289565b9061023e5760405162461bcd60e51b815260040161023591906105ae565b60405180910390fd5b508185848151811061024c57fe5b6020026020010190151590811515815250508084848151811061026b57fe5b60209081029190910101525050600101610186565b50935093915050565b60606044825110156102cf575060408051808201909152601d81527f5472616e73616374696f6e2072657665727465642073696c656e746c7900000060208201526102ec565b600482019150818060200190518101906102e991906103fc565b90505b919050565b600080600060408486031215610305578283fd5b833567ffffffffffffffff8082111561031c578485fd5b818601915086601f83011261032f578485fd5b81358181111561033d578586fd5b8760208083028501011115610350578586fd5b60209283019550935050840135801515811461036a578182fd5b809150509250925092565b600080600080600080600080610100898b031215610391578384fd5b883561039c8161064d565b975060208901356103ac8161064d565b965060408901356103bc8161064d565b9550606089013594506080890135935060a089013560ff811681146103df578384fd5b979a969950949793969295929450505060c08201359160e0013590565b60006020828403121561040d578081fd5b815167ffffffffffffffff80821115610424578283fd5b818401915084601f830112610437578283fd5b815181811115610445578384fd5b604051601f8201601f191681016020018381118282101715610465578586fd5b60405281815283820160200187101561047c578485fd5b61048d82602083016020870161061d565b9695505050505050565b600081518084526104af81602086016020860161061d565b601f01601f19169290920160200192915050565b6000828483379101908152919050565b6001600160a01b0397881681529590961660208601526040850193909352606084019190915260ff16608083015260a082015260c081019190915260e00190565b604080825283519082018190526000906020906060840190828701845b8281101561054f578151151584529284019290840190600101610531565b505050838103828501528085516105668184610614565b91508192508381028201848801865b8381101561059f57858303855261058d838351610497565b94870194925090860190600101610575565b50909998505050505050505050565b6000602082526105c16020830184610497565b9392505050565b6000808335601e198436030181126105de578283fd5b83018035915067ffffffffffffffff8211156105f8578283fd5b60200191503681900382131561060d57600080fd5b9250929050565b90815260200190565b60005b83811015610638578181015183820152602001610620565b83811115610647576000848401525b50505050565b6001600160a01b038116811461066257600080fd5b5056fea26469706673582212206f425875b907d3d6f804001af38d452fb8c42ae1025f66fd9c1d07f05fc8a67364736f6c634300060c0033";
