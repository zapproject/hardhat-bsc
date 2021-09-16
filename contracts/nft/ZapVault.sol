// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import {SafeMathUpgradeable} from '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
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

    mapping(address => bool) public whitelistStatus;
    address[] whitelisted;

    modifier onlyWhitelisted() {
        require(
            whitelistStatus[msg.sender] == true,
            'Vault: Address is not whitelisted'
        );
        _;
    }

    function initializeVault(address token) public initializer {
        require(!initialized, 'Vault: Instance has already been initialized');

        owner = msg.sender;

        whitelistStatus[owner] = true;

        whitelisted.push(owner);

        initialized = true;

        zapToken = IERC20Upgradeable(token);
    }

    function addWhitelist(address _whitelisted)
        public
        onlyOwner
        returns (bool)
    {
        require(
            _whitelisted != address(0),
            'Address can not be a zero address'
        );

        whitelistStatus[_whitelisted] = true;
        whitelisted.push(_whitelisted);

        return true;
    }

    function getWhitelisted() public view returns (address[] memory) {
        return whitelisted;
    }

    function vaultBalance() public view onlyWhitelisted returns (uint256) {
        return zapToken.balanceOf(address(this));
    }

    function withdraw(uint256 value) public onlyWhitelisted {
        require(
            zapToken.balanceOf(address(this)) >= value,
            'Your balance is insufficient.'
        );

        zapToken.safeTransfer(msg.sender, value);
    }
}
