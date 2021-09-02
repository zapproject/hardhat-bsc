pragma solidity =0.5.16;


import "./Token.sol";
import "./TokenFactoryInterface.sol";
 contract TokenFactory is TokenFactoryInterface {
    address[] public generatedTokens;
    constructor() public {

    }

    function create(string memory _name, string memory _symbol) public returns (FactoryTokenInterface) {
        FactoryToken token = new FactoryToken(_name, _symbol);
        generatedTokens.push(address(token));
        token.transferOwnership(msg.sender);
        return token;
    }
    function getAllTokens() public view returns(address[] memory){
        return generatedTokens;
    }
}
