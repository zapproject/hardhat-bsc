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
contract ZapVault is  Initializable, Ownable {
	using SafeMathUpgradeable for uint256;
	using SafeERC20Upgradeable for IERC20Upgradeable;
	bool private initialized;
	IERC20Upgradeable zapToken;
	// address public zapToken;
	mapping(address => uint256) balances;
    mapping(address => mapping(address => bool)) keys;
	function initializeVault(address token)public initializer {
		require(!initialized, 'Vault: Instance has already been initialized');
        initialized = true;
        // zapToken=token;
        zapToken = IERC20Upgradeable(token);
	}
	function deposit(address userAddress, uint256 value) public {
        require(userAddress != address(0), "The zero address does not own a vault.");
        require(hasAccess(msg.sender, userAddress), "You are not authorized to access this vault.");
        balances[userAddress] = balances[userAddress].add(value);
        zapToken.safeTransferFrom(userAddress, address(this), value);
    }

    function withdraw(address userAddress, uint256 value) public {
        require(userAddress != address(0), "The zero address does not own a vault.");
        require(hasAccess(msg.sender, userAddress), "You are not authorized to access this vault.");
        require(userBalance(userAddress) >= value, "Your balance is insufficient.");
        balances[userAddress] = balances[userAddress].sub(value);
        zapToken.safeTransfer(userAddress,value);
    }

    function userBalance(address userAddress) public view returns (uint256 balance) {
        return balances[userAddress];

    }
    function lockSmith(address miniVault, address authorizedUser) public {
        require(msg.sender == miniVault, "You do not own this vault.");
        require(msg.sender != address(0) || miniVault != msg.sender, "The zero address can not own a vault.");

        // gives the mini-vault owner keys if they don't already have
        if (!keys[miniVault][msg.sender]){
            keys[miniVault][miniVault] = true;
        }

        keys[miniVault][authorizedUser] = true;
    }

    function hasAccess(address user, address miniVault) public view returns (bool) {
        require(msg.sender != address(0) || miniVault != msg.sender, "The zero address does not own a vault.");
        return keys[miniVault][user];
    }
}