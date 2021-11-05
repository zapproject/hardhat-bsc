pragma solidity =0.5.16;

import './libraries/SafeMathM.sol';
import './ZapMaster.sol';

contract Vault {
    using SafeMathM for uint256;

    address public zapToken;
    ZapMaster public zapMaster;
    address private newVault;
    ZapMaster private zapMaster;

    address[] public accounts;
    mapping(address => uint256) private indexes;
    mapping(address => uint256) private balances;

    uint256 constant private MAX_UINT = 2**256 - 1;

    modifier onlyZapMaster(){
        require(address(zapMaster) != address(0));
        require(msg.sender == address(zapMaster), "Vault: Only the ZapMaster contract can make this call");
        _;
    }

    modifier onlyVaultOrZapMaster(){
        require(address(zapMaster) != address(0));
        require(msg.sender == address(zapMaster) || (msg.sender == newVault && newVault != address(0)) || msg.sender == address(this),
                "Vault: Only the ZapMaster contract or an authorized Vault Contract can make this call");
        _;
    }

    constructor (address token, address master) public {
        zapToken = token;
        zapMaster = ZapMaster(address(uint160(master)));
        
        token.call(abi.encodeWithSignature("approve(address,uint256)", master, MAX_UINT));
    }

    function increaseApproval() public returns (bool) {
        (bool s, bytes memory balance) = zapToken.call(abi.encodeWithSignature("allowance(address,address)", address(this), zapMaster));
        uint256 amount = MAX_UINT.sub(toUint256(balance, 0));
        (bool success, bytes memory data) = zapToken.call(abi.encodeWithSignature("increaseApproval(address,uint256)", zapMaster, amount));
        return success;
    }

    function toUint256(bytes memory _bytes, uint256 _start) internal pure returns (uint256) {
        require(_bytes.length >= _start + 32, "toUint256_outOfBounds");
        uint256 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x20), _start))
        }

        return tempUint;
    }

    function deposit(address userAddress, uint256 value) public onlyVaultOrZapMaster {
        require(userAddress != address(0), "The zero address does not own a vault.");
        if (balances[userAddress] == 0){
            accounts.push(userAddress);
            indexes[userAddress] = accounts.length;
        }
        balances[userAddress] = balances[userAddress].add(value);
    }

    function withdraw(address userAddress, uint256 value) public onlyVaultOrZapMaster {
        require(userAddress != address(0), "The zero address does not own a vault.");
        require(userBalance(userAddress) >= value, "Your balance is insufficient.");
        if (balances[userAddress].sub(value) == 0) {
            delete accounts[indexes[userAddress]];
            delete indexes[userAddress];
            balances[userAddress] = balances[userAddress].sub(value);
            delete balances[userAddress];
        } else {
            balances[userAddress] = balances[userAddress].sub(value);
        }
    }

    function userBalance(address userAddress) public view returns (uint256 balance) {
        return balances[userAddress];
    }

    function setNewVault(address _newVault) public onlyZapMaster returns (bool success) {
        require(_newVault != address(0), "Can't set the zero address as the new Vault");
        newVault = _newVault;
        return true;
    }

    function migrateVault() public onlyZapMaster returns (bool success) {
        require(newVault != address(0), "Can't set the zero address as the new Vault");
        uint256 balance = 0;
        address account = address(0);
        for (uint256 i = 0; i < accounts.length; i++) {
            account = accounts[i];
            if (balances[account] > 0){
                balance = balances[account];
                withdraw(account, balances[accounts[i]]);
                Vault(newVault).deposit(account, balance);
            }
        }
    }
}