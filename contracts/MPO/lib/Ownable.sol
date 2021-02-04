<<<<<<< HEAD
pragma solidity ^0.5.1;

contract Ownable {
    address payable public owner;
=======
pragma solidity ^0.4.24;

contract Ownable {
    address public owner;
>>>>>>> develop
    event OwnershipTransferred(address indexed previousOwner,address indexed newOwner);

    /// @dev The Ownable constructor sets the original `owner` of the contract to the sender account.
    constructor() public { owner = msg.sender; }

    /// @dev Throws if called by any contract other than latest designated caller
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /// @dev Allows the current owner to transfer control of the contract to a newOwner.
    /// @param newOwner The address to transfer ownership to.
<<<<<<< HEAD
    function transferOwnership(address payable newOwner) public onlyOwner {
=======
    function transferOwnership(address newOwner) public onlyOwner {
>>>>>>> develop
       require(newOwner != address(0));
       emit OwnershipTransferred(owner, newOwner);
       owner = newOwner;
    }
}
