// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import {SafeMathUpgradeable} from '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
// import {IERC721Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol';
import {IERC20Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import {SafeERC20Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';
import {Initializable} from '@openzeppelin/contracts/proxy/utils/Initializable.sol';
import {Decimal} from './Decimal.sol';
import {Ownable} from './access/Ownable.sol';

import 'hardhat/console.sol';

contract ZapVault is Initializable, Ownable {
    using SafeMathUpgradeable for uint256;
    using SafeERC20Upgradeable for IERC20Upgradeable;
    bool private initialized;
    IERC20Upgradeable zapToken;
    mapping(address => mapping(address => bool)) keys;

    function initializeVault(address token) public initializer {
        require(!initialized, 'Vault: Instance has already been initialized');

        initialized = true;
        zapToken = IERC20Upgradeable(token);
    }

    function vaultBalance() public view returns (uint256) {
        return zapToken.balanceOf(address(this));
    }

    function withdraw(uint256 value) public {
        require(
            msg.sender != address(0),
            'The zero address does not own a vault.'
        );

        require(
            address(this).balance >= value,
            'Your balance is insufficient.'
        );

        zapToken.safeTransfer(msg.sender, value);
    }
}
