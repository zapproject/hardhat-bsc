// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "../ZapMaster.sol";

contract ZapMasterTest is ZapMaster {
    constructor(uint256 stakeAmount, address zapSol, address zapToken)
        ZapMaster(zapSol, zapToken)
    {
        zap.uintVars[keccak256("stakeAmount")] = stakeAmount;
    }
}
