pragma solidity =0.5.16;

import './libraries/SafeMathM.sol';
import './ZapMaster.sol';
import 'hardhat/console.sol';

contract Vault {
    using SafeMathM for uint256;

    address public zapToken;
    ZapMaster zapMaster;
    mapping(address => uint256) balances;
    mapping(address => mapping(address => bool)) keys;

    uint256 constant MAX_INT = 2**256 - 1;

    constructor (address token, address master) public {
        zapToken = token;
        zapMaster = ZapMaster(address(uint160(master)));
        
        token.call(abi.encodeWithSignature("approve(address,uint256)", master, MAX_INT));
    }

    function increaseApproval() public returns (bool) {
        (bool s, bytes memory balance) = zapToken.call(abi.encodeWithSignature("allowance(address,address)", address(this), zapMaster));
        uint256 amount = MAX_INT.sub(toUint256(balance, 0));
        (bool success, bytes memory data) = zapToken.call(abi.encodeWithSignature("increaseApproval(address,uint256)", zapMaster, amount));
        return success;
    }

    function lockSmith(address miniVault, address authorizedUser) public {

        // temporarily connect this out
        // require(msg.sender == miniVault, "You do not own this vault.");
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

    function toUint256(bytes memory _bytes, uint256 _start) internal pure returns (uint256) {
        require(_bytes.length >= _start + 32, "toUint256_outOfBounds");
        uint256 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x20), _start))
        }

        return tempUint;
    }

    function deposit(address userAddress, uint256 value) public {
        require(userAddress != address(0), "The zero address does not own a vault.");
        require(hasAccess(msg.sender, userAddress), "You are not authorized to access this vault.");
        balances[userAddress] = balances[userAddress].add(value);
    }

    function withdraw(address userAddress, uint256 value) public {
        require(userAddress != address(0), "The zero address does not own a vault.");
        require(hasAccess(msg.sender, userAddress), "You are not authorized to access this vault.");
        require(userBalance(userAddress) >= value, "Your balance is insufficient.");
        balances[userAddress] = balances[userAddress].sub(value);
    }

    function userBalance(address userAddress) public view returns (uint256 balance) {
        return balances[userAddress];
    }
}