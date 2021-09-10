pragma solidity =0.5.16;

import './ZapGetters.sol';


/**
 * @title Zap Master
 * @dev This is the Master contract with all zap getter functions and delegate call to Zap.
 * The logic for the functions on this contract is saved on the ZapGettersLibrary, ZapTransfer,
 * ZapGettersLibrary, and ZapStake
 */
contract ZapMaster is ZapGetters {
    event NewZapAddress(address _newZap);


    ZapTokenBSC public token;
    address public owner;

    /// @dev Throws if called by any contract other than latest designated caller
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can transfer balance.");
        _;
    }

    /**
     * @dev The constructor sets the original `zapStorageOwner` of the contract to the sender
     * account, the zap contract to the Zap master address and owner to the Zap master owner address
     * @param _zapContract is the address for the zap contract
     */
    constructor(address _zapContract, address tokenAddress)
        public
        ZapGetters(tokenAddress)
    {
        zap.init();
        zap.addressVars[keccak256('_owner')] = msg.sender;
        zap.addressVars[keccak256('_deity')] = msg.sender;
        zap.addressVars[keccak256('zapContract')] = _zapContract;
        zap.addressVars[keccak256('zapTokenContract')] = tokenAddress;


        token = ZapTokenBSC(tokenAddress);
        owner = msg.sender;

        emit NewZapAddress(_zapContract);
    }

    /**
     * @dev Gets the 5 miners who mined the value for the specified requestId/_timestamp
     * @dev Only needs to be in library
     * @param _newDeity the new Deity in the contract
     */

    function changeDeity(address _newDeity) external {
        zap.changeDeity(_newDeity);
    }

    /**
     * @dev  allows for the deity to make fast upgrades.  Deity should be 0 address if decentralized
     * @param _zapContract the address of the new Zap Contract
     */
    function changeZapContract(address _zapContract) external {
        zap.changeZapContract(_zapContract);
    }

    /**
     * @dev  allows for the deity to make fast upgrades.  Deity should be 0 address if decentralized
     * @param _vaultContract the address of the new Vault Contract
     */
    function changeVaultContract(address _vaultContract) external {
        zap.changeVaultContract(_vaultContract);
    }


    // function to send balance to a New Zap Master contract
    function sendBalToNewZM(address _newZapMaster) external onlyOwner {
        // require to be the owner of ZM to send to new ZM
        
        // total balance of current ZapMaster
        uint256 zapBalance = token.balanceOf(address(this));
        // approve entire balance
        token.approve(address(this), zapBalance);
        token.transferFrom(address(this), _newZapMaster, zapBalance);
    }


    /**
     * @dev This is the fallback function that allows contracts to call the zap contract at the address stored
     */
    function() external payable {
        address addr = zap.addressVars[keccak256('zapContract')];
        bytes memory _calldata = msg.data;
        assembly {
            let result := delegatecall(
                not(0),
                addr,
                add(_calldata, 0x20),
                mload(_calldata),
                0,
                0
            )
            let size := returndatasize
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
}
