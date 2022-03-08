// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

// ZapStake is the coolest bar in town. You come in with some G-Zap, and leave with more! The longer you stay, the more G-Zap you get.
//
// This contract handles swapping to and from xZap, Z-Swap's staking token.
contract SushiBar is ERC20("SushiBar", "xSUSHI"){
    using SafeMath for uint256;
    IERC20 public sushi;

    // Define the G-Zap token contract
    constructor(IERC20 _sushi) public {
        sushi = _sushi;
    }

    // Enter the bar. Pay some G-Zap. Earn some shares.
    // Locks G-Zap and mints xZap
    function enter(uint256 _amount) public {
        // Gets the amount of G-Zap locked in the contract
        uint256 totalSushi = sushi.balanceOf(address(this));
        // Gets the amount of xZap in existence
        uint256 totalShares = totalSupply();
        // If no xZap exists, mint it 1:1 to the amount put in
        if (totalShares == 0 || totalSushi == 0) {
            _mint(msg.sender, _amount);
        } 
        // Calculate and mint the amount of xZap the Zap is worth. The ratio will change overtime, as xZap is burned/minted and Sushi deposited + gained from fees / withdrawn.
        else {
            uint256 what = _amount.mul(totalShares).div(totalSushi);
            _mint(msg.sender, what);
        }
        // Lock the G-Zap in the contract
        sushi.transferFrom(msg.sender, address(this), _amount);
    }

    // Leave the bar. Claim back your G-Zap.
    // Unlocks the staked + gained G-Zap and burns xZap
    function leave(uint256 _share) public {
        // Gets the amount of xZap in existence
        uint256 totalShares = totalSupply();
        // Calculates the amount of G-Zap the xZap is worth
        uint256 what = _share.mul(sushi.balanceOf(address(this))).div(totalShares);
        _burn(msg.sender, _share);
        sushi.transfer(msg.sender, what);
    }
}
