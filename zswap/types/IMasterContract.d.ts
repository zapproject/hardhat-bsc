/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  PayableOverrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface IMasterContractInterface extends ethers.utils.Interface {
  functions: {
    "init(bytes)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "init", values: [BytesLike]): string;

  decodeFunctionResult(functionFragment: "init", data: BytesLike): Result;

  events: {};
}

export class IMasterContract extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: IMasterContractInterface;

  functions: {
    init(
      data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<ContractTransaction>;

    "init(bytes)"(
      data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<ContractTransaction>;
  };

  init(
    data: BytesLike,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction>;

  "init(bytes)"(
    data: BytesLike,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction>;

  callStatic: {
    init(data: BytesLike, overrides?: CallOverrides): Promise<void>;

    "init(bytes)"(data: BytesLike, overrides?: CallOverrides): Promise<void>;
  };

  filters: {};

  estimateGas: {
    init(data: BytesLike, overrides?: PayableOverrides): Promise<BigNumber>;

    "init(bytes)"(
      data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    init(
      data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<PopulatedTransaction>;

    "init(bytes)"(
      data: BytesLike,
      overrides?: PayableOverrides
    ): Promise<PopulatedTransaction>;
  };
}
