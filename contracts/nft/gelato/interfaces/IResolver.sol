// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

interface IResolver {
    function checker() external view returns (bool canExec, bytes memory execPayload);
}
