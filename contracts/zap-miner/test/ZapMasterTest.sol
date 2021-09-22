pragma solidity =0.5.16;

import "../ZapMaster.sol";

contract ZapMasterTest is ZapMaster {
    constructor(uint256 stakeAmount, address zapSol, address zapToken)
        public
        ZapMaster(zapSol, zapToken)
    {
        zap.uintVars[keccak256("stakeAmount")] = stakeAmount;
    }
}
