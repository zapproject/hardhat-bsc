// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

// Originally Zap Bar which was Sushi bar
// xZap is the token you get for staking


contract ZapDisperse is ERC20("ZapDisperse", "xZap"){
    using SafeMath for uint256;
    IERC20 public zap;

    // Define the zap token contract
    constructor(IERC20 _zap) public {
        zap = _zap;
    }

    // Enter the bar. Pay some ZAP. Earn some shares.
    // Locks Zap and mints Zap
    function enter(uint256 _amount) public {
        // Gets the amount of Zap locked in the contract
        uint256 totalZap = zap.balanceOf(address(this));
        // Gets the amount of xZap in existence
        uint256 totalShares = totalSupply();
        // If no xZap exists, mint it 1:1 to the amount put in
        if (totalShares == 0 || totalZap == 0) {
            _mint(msg.sender, _amount);
        } 
        // Calculate and mint the amount of xZap the Zap is worth. The ratio will change overtime, as xZapis burned/minted and Zap deposited + gained from fees / withdrawn.
        else {
            uint256 what = _amount.mul(totalShares).div(totalZap);
            _mint(msg.sender, what);
        }
        // Lock the Zap in the contract
        zap.transferFrom(msg.sender, address(this), _amount);
    }

    // Leave the bar. Claim back your ZAPs.
    // Unlocks the staked + gained ZAP and burns xZap
    function leave(uint256 _share) public {
        // Gets the amount of xZap in existence
        uint256 totalShares = totalSupply();
        // Calculates the amount of Zap the xZap is worth
        uint256 what = _share.mul(zap.balanceOf(address(this))).div(totalShares);
        _burn(msg.sender, _share);
        zap.transfer(msg.sender, what);
    }
}
