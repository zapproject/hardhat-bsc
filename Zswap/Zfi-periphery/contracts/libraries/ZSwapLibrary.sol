// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity =0.7.4;
pragma experimental ABIEncoderV2;

library ZSwapLibrary {
    /**
    * @dev Calculate the create2 address of a pair, given parameters
    *
    * @param factory address of the creating factory
    * @param tokenBase address of the base token
    * @param tokenQuote address of the quote token
    * @param slopeNumerator value 1-1000 which represents the curve slope numerator (denominator 1000)
    * @param n value 1-3 which represents the curve exponent (y = mx^n)
    * @param fee value 0-10 which represents pair owner fee (1 = 0.1%)
    *
    * @return pair address of the resulting pair
    */
    function pairFor(address factory, address tokenBase, address tokenQuote, uint32 slopeNumerator, uint32 n, uint32 fee)
        internal pure returns (address pair)
    {
        pair = address(uint(keccak256(abi.encodePacked(
                hex'ff',
                factory,
                keccak256(abi.encodePacked(tokenBase, tokenQuote, slopeNumerator, n, fee)),
                hex'c91c25d60f81a860a0db94dea30188b1d93d923682b5d5a38a6f23c330c2f66c' // init code hash
            ))));
    }
}
