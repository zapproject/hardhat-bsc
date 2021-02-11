pragma solidity ^0.5.1;

import "./FactoryTokenInterface.sol";

contract TokenFactoryInterface {
    function create(string memory _name, string memory _symbol) public returns (FactoryTokenInterface);
}
