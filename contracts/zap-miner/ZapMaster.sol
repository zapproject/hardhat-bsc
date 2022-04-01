// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import './ZapGetters.sol';
import './libraries/Address.sol';
import './libraries/ZapStake.sol';

/**
 * @title Zap Master
 * @dev This is the Master contract with all zap getter functions and delegate call to Zap.
 * The logic for the functions on this contract is saved on the ZapGettersLibrary,
 * ZapGettersLibrary, and ZapStake
 */
contract ZapMaster is ZapGetters {
    event NewZapAddress(address _newZap);
    event Received(address, uint);

    using Address for address;
    using ZapStake for ZapStorage.ZapStorageStruct;
    using ZapGettersLibrary for ZapStorage.ZapStorageStruct;

    address public owner;
    address public deity;
    bool private vaultLock;

    /// @dev Throws if called by any contract other than latest designated caller
    modifier onlyOwner() {
        require(msg.sender == owner, 'Only owner can perform this operation.');
        _;
    }

    modifier onlyDeity(){
        require(msg.sender == deity, 'Only the deity can perform this operation');
        _;
    }

    modifier vaultMutex(){
        require(!vaultLock);
        vaultLock = true;
        _;
    }

    /**
     * @dev The constructor sets the original `zapStorageOwner` of the contract to the sender
     * account, the zap contract to the Zap master address and owner to the Zap master owner address.
     * If there are no predecessors or no storage transfer is wanted, pass in the zero address.
     * @param _zapContract is the address for the zap contract
     * @param tokenAddress is the address for the ZAP token contract
     */
    constructor(address _zapContract, address tokenAddress)
        ZapGetters(tokenAddress)
    {
        zap.init();
        zap.addressVars[keccak256('_owner')] = msg.sender;
        zap.addressVars[keccak256('_deity')] = msg.sender;
        zap.addressVars[keccak256('zapContract')] = _zapContract;

        owner = deity = msg.sender;

        emit NewZapAddress(_zapContract);
    }

    /**
     * @dev retires the deity after contract deployment period has ended
     */
    function retireDeity() internal onlyDeity {
        zap.addressVars[keccak256('_deity')] = deity = address(0);
    }

    /**
     * @dev  allows for the deity to make fast upgrades.  Deity should be 0 address if decentralized
     * @param _vaultContract the address of the new Vault Contract
     */
    function changeVaultContract(address _vaultContract) external onlyDeity vaultMutex {
        zap.changeVaultContract(_vaultContract);
        retireDeity();
    }

    /**
     * @dev This is the fallback function that allows contracts to call the zap contract at the address stored
     */
    fallback() external payable {
        address addr = zap.addressVars[keccak256('zapContract')];
        bytes memory _calldata = msg.data;
        assembly {
            let result := delegatecall(
                gas(),
                addr,
                add(_calldata, 0x20),
                mload(_calldata),
                0,
                0
            )
            let size := returndatasize()
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)
            // revert instead of invalid() bc if the underlying call failed with invalid() it already wasted gas.
            // if the call returned error data, forward it
            switch result
            case 0 {
                revert(ptr, size)
            }
            default {
                return(ptr, size)
            }
        }
    }

    /**
     * Receive function for incoming ethers
     */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
