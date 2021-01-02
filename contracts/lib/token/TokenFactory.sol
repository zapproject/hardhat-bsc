pragma solidity ^0.5.1;

import "./Token.sol";
import "./TokenFactoryInterface.sol";

contract TokenFactory is TokenFactoryInterface {
    constructor() public{

    }

    function create(string memory _name, string memory _symbol) public returns (FactoryTokenInterface) {
        FactoryToken token = new FactoryToken(_name, _symbol);
        token.transferOwnership(msg.sender);
        return token;
    }
}
