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
    event Result3(uint256 id, int[] response3);

    mapping(uint=>string) public queryResults;
    mapping(uint=>bytes32[]) public queryBytes32Results;
    mapping(uint=>int[]) public queryIntResults;

    mapping(uint=>uint) public queryBytes32IDs;
    mapping(uint=>uint) public queryIntIDs;
    mapping(uint=>uint) public queryIDs;

    uint public totalQueries;
    uint public totalIntQueries;
    uint public totalBytes32Queries;

    ERC20 token;
    DispatchInterface dispatch;
    BondageInterface bondage;
    RegistryInterface registry;
    
    constructor(address tokenAddress, address dispatchAddress, address bondageAddress, address registryAddress) public {
        token = ERC20(tokenAddress);
        dispatch = DispatchInterface(dispatchAddress);
        bondage = BondageInterface(bondageAddress);
        registry = RegistryInterface(registryAddress);
        //Oracle =oracle;
    }
    modifier onlyOracle(){
        require(msg.sender==address(dispatch),"caller must the dispatch address ");
        _;
    }
    /*
    Implements overloaded callback functions for Client1
    */
    function callback(uint256 id, string calldata response1) external  onlyOracle() {
        //string memory _response1 = response1;
        queryResults[id]=response1;
        queryIDs[totalQueries]=id;
        totalQueries++;
        emit Result1(id, response1);
        // do something with result
    }
    function Callback(uint256 id, string calldata response1) external  onlyOracle() {
        string memory _response1 = response1;
        emit Result1(id, _response1);
        // do something with result
    }
    function callback(uint256 id, bytes32[]  calldata response) external  onlyOracle() {
        emit Result1(id, response[0]);
        queryBytes32Results[id]=response;
        queryBytes32IDs[totalQueries]=id;
        totalBytes32Queries++;
        // do something with result
    }
    function callback(uint256 id, int[]  calldata response) external  onlyOracle() {
        emit Result3(id, response);
        queryIntResults[id]=response;
        queryIntIDs[totalQueries]=id;
        totalIntQueries++;
        // do something with result
    }
    // Client2 callback
    function callback(uint256 id, string calldata response1, string calldata response2) external  onlyOracle() {
       
        string memory concat=string(abi.encodePacked(response1,response2));
        queryResults[id]=concat;
        queryIDs[totalQueries]=id;
        totalQueries++;
         emit Result2(id, response1, response2);
    }

    function testQuery(address oracleAddr, string calldata query, bytes32 specifier, bytes32[] calldata params) external returns (uint256) {
        uint256 id = dispatch.query(oracleAddr, query, specifier, params);
        emit MadeQuery(oracleAddr, query, id);
        return id;
    }
    function getQueryResultById(uint id) public view returns(string memory ){
        return queryResults[id];
    }
     function getQueryIntResultById(uint id) public view returns(int[] memory ){
        return queryIntResults[id];
    }
    function getQueryResultByOrder(uint pos) public view returns(string memory){
        uint id=queryIDs[pos];
        return queryResults[id];
    }
     function getQueryIntResultByOrder(uint pos) public view returns(int[] memory ){
        uint id=queryIntIDs[pos];
        return queryIntResults[id];
    }
      function getQueryBytes32ResultById(uint id) public view returns(bytes32[] memory){
        return queryBytes32Results[id];
    }
    function getQueryBytes32ResultByOrder(uint pos) public view returns(bytes32[] memory){
        uint id=queryBytes32IDs[pos];
        return queryBytes32Results[id];
    }
    function getQueryIntResultByData(uint blockNumber,uint timestamp,string memory query,address subscriber,address provider) public view returns(int[] memory){
        uint id=uint256(keccak256(abi.encodePacked(block.number, now, query, subscriber, provider)));
        return queryIntResults[id];
    }
     function getQueryResultByData(uint blockNumber,uint timestamp,string memory query,address subscriber,address provider) public view returns(string memory){
        uint id=uint256(keccak256(abi.encodePacked(block.number, now, query, subscriber, provider)));
        return queryResults[id];
    }
     function getQueryBytesResultByData(uint blockNumber,uint timestamp,string memory query,address subscriber,address provider) public view returns(bytes32[] memory){
        uint id=uint256(keccak256(abi.encodePacked(block.number, now,query,  subscriber, provider)));
        return queryBytes32Results[id];
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
