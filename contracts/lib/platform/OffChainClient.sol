pragma solidity ^0.5.1;

import "./Client.sol";
import "../../platform/dispatch/DispatchInterface.sol";
import "../../platform/bondage/BondageInterface.sol";
import "../../platform/registry/RegistryInterface.sol";
import "./OnChainProvider.sol";
import "../ERC20.sol";
import "hardhat/console.sol";
contract OffChainClient is Client1, Client2{

    event MadeQuery(address oracle, string query, uint256 id);
    event Result1(uint256 id, string response1);
    event Result1(uint256 id, bytes32 response1);
    event Result2(uint256 id, string response1, string response2);

    ERC20 token;
    DispatchInterface dispatch;
    BondageInterface bondage;
    RegistryInterface registry;
    address Oracle;
    constructor(address tokenAddress, address dispatchAddress, address bondageAddress, address registryAddress,address oracle) public {
        token = ERC20(tokenAddress);
        dispatch = DispatchInterface(dispatchAddress);
        bondage = BondageInterface(bondageAddress);
        registry = RegistryInterface(registryAddress);
        Oracle =oracle;
    }
    modifier onlyOracle(){
        require(msg.sender==Oracle);
        _;
    }
    /*
    Implements overloaded callback functions for Client1
    */
    function callback(uint256 id, string calldata response1) external  onlyOracle() {
        string memory _response1 = response1;
        emit Result1(id, _response1);
        // do something with result
    }
    function Callback(uint256 id, string calldata response1) external  onlyOracle() {
        string memory _response1 = response1;
        emit Result1(id, _response1);
        // do something with result
    }
    function callback(uint256 id, bytes32[]  calldata response) external  onlyOracle() {
        emit Result1(id, response[0]);
        // do something with result
    }

    // Client2 callback
    function callback(uint256 id, string calldata response1, string calldata response2) external  onlyOracle() {
        emit Result2(id, response1, response2);
        // do something with result
    }

    function testQuery(address oracleAddr, string calldata query, bytes32 specifier, bytes32[] calldata params) external returns (uint256) {
        uint256 id = dispatch.query(oracleAddr, query, specifier, params);
        emit MadeQuery(oracleAddr, query, id);
        return id;
    }

    function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);

        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }

    // attempts to cancel an existing query
    function cancelQuery(uint256 id) external {
        dispatch.cancelQuery(id);
    }

}
