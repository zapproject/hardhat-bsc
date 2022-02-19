import { EthereumProvider, JsonRpcRequest, JsonRpcResponse, RequestArguments } from 'hardhat/types';
import { Contract } from '@ethersproject/contracts';
import { Interface } from '@ethersproject/abi';
import { SafeSignature, SafeTransaction } from './execution';
import { Signer } from '@ethersproject/abstract-signer';
export declare class SafeProviderAdapter implements EthereumProvider {
    submittedTxs: Map<string, any>;
    createLibAddress: string;
    createLibInterface: Interface;
    safeInterface: Interface;
    safeContract: Contract;
    safe: string;
    serviceUrl: string;
    signer: Signer;
    wrapped: any;
    constructor(wrapped: any, signer: Signer, safe: string, serviceUrl?: string);
    estimateSafeTx(safe: string, safeTx: SafeTransaction): Promise<any>;
    getSafeTxDetails(safeTxHash: string): Promise<any>;
    proposeTx(safeTxHash: string, safeTx: SafeTransaction, signature: SafeSignature): Promise<string>;
    sendAsync(payload: JsonRpcRequest, callback: (error: any, response: JsonRpcResponse) => void): void;
    request(args: RequestArguments): Promise<unknown>;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    off(event: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners(event: string | symbol): Function[];
    rawListeners(event: string | symbol): Function[];
    emit(event: string | symbol, ...args: any[]): boolean;
    listenerCount(event: string | symbol): number;
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    eventNames(): (string | symbol)[];
    send(method: string, params: any): Promise<any>;
}
//# sourceMappingURL=adapter.d.ts.map