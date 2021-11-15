// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

/**
 * @title Math
 *
 * Library for non-standard Math functions
 * NOTE: This file is a clone of the dydx protocol's Math.sol contract.
 * It was forked from https://github.com/dydxprotocol/solo at commit
 * 2d8454e02702fe5bc455b848556660629c3cad36. It has two modifications
 *      - uses a newer solidity in the pragma to match the rest of the contract suite of this project.
 *      - Removed `Require.sol` dependency
 */
library Math {

    // ============ Library Functions ============

    /*
     * Return target * (numerator / denominator).
     */
    function getPartial(
        uint256 target,
        uint256 numerator,
        uint256 denominator
    ) internal pure returns (uint256) {
        return target * (numerator / denominator);
    }

    /*
     * Return target * (numerator / denominator), but rounded up.
     */
    function getPartialRoundUp(
        uint256 target,
        uint256 numerator,
        uint256 denominator
    ) internal pure returns (uint256) {
        if (target == 0 || numerator == 0) {
            // SafeMath will check for zero denominator
            return 0 / denominator;
        }
        return target * ((numerator - 1) / denominator) + 1;
    }

    function to128(uint256 number) internal pure returns (uint128) {
        require(number<=type(uint128).max, "Math: Unsafe cast to uint128");
        uint128 result = uint128(number);
        return result;
    }

    function to96(uint256 number) internal pure returns (uint96) {
        require(number<=type(uint96).max, "Math: Unsafe cast to uint96");
        uint96 result = uint96(number);
        return result;
    }

    function to32(uint256 number) internal pure returns (uint32) {
        require(number<=type(uint32).max, "Math: Unsafe cast to uint32");
        uint32 result = uint32(number);
        return result;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }
}
