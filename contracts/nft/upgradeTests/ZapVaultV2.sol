// SPDX-License-Identifier: GPL-3.0

//  THIS CONTRACT IS ONLY BEING USED ON TESTNET TO TEST IF THE CONTRACT IS UPGRADEABLE!

pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import {SafeMathUpgradeable} from '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import {IERC20Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import {SafeERC20Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';
import {Initializable} from '@openzeppelin/contracts/proxy/utils/Initializable.sol';
import {Decimal} from '../Decimal.sol';
import {Ownable} from '../access/Ownable.sol';

contract ZapVaultV2 is Initializable, Ownable {
    using SafeMathUpgradeable for uint256;
    using SafeERC20Upgradeable for IERC20Upgradeable;

    bool private initialized;
    IERC20Upgradeable zapToken;

    function initializeVault(address token) public initializer {
        require(!initialized, 'Vault: Instance has already been initialized');

        owner = msg.sender;

        initialized = true;

        zapToken = IERC20Upgradeable(token);
    }

    function vaultBalance() public view returns (uint256) {
        return zapToken.balanceOf(address(this));
    }

    function withdraw(uint256 value) public onlyOwner {
        require(
            zapToken.balanceOf(address(this)) >= value,
            'Vault: Withdraw amount is insufficient.'
        );

        zapToken.safeTransfer(msg.sender, value);
    }

    function testUpgrade() public view returns (uint256) {
        return zapToken.balanceOf(address(this));
    }
}
