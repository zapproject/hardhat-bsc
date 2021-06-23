pragma solidity =0.5.16;

import "./Client.sol";
import "../../platform/dispatch/DispatchInterface.sol";
import "../../platform/bondage/BondageInterface.sol";
import "../../platform/registry/RegistryInterface.sol";
import "./OnChainProvider.sol";
import "../ERC20.sol";
import "../ownership/Ownable.sol";
import "hardhat/console.sol";
contract priceClient is Ownable{

    event MadeQuery(address oracle, string query, uint256 id);
    event Result1(uint256 id, string response1);
    event Result32(uint256 id, bytes32 response1);
    event Result2(uint256 id, string response1, string response2);
    event Result3(uint256 id, int[] response3);

    mapping(uint=>string) public queryResults;
    mapping(uint=>bytes32[]) public queryBytes32Results;
    //mapping(uint=>int[]) public queryIntResults;
    uint[] public  priceResults;
    uint[] public  priceTimeStamps;
    uint[] public  priceQueryIDs;

    mapping(uint=>uint) public queryBytes32IDs;
    mapping(uint=>uint) public queryIntIDs;
    mapping(uint=>uint) public queryIDs;


    //** Oracle Details*/
    address public oracle;
    string public DataQuery;
    bytes32 public querySpec;
    bytes32[] public queryParams;

    uint public totalQueries;
    uint public totalIntQueries;
    uint public totalBytes32Queries;

    ERC20 token;
    DispatchInterface dispatch;
    BondageInterface bondage;
    RegistryInterface registry;
    
    
    constructor(address tokenAddress, address dispatchAddress, address bondageAddress, address registryAddress,
    address oracleAddr, string memory query, bytes32 specifier, bytes32[] memory params) public {
        token = ERC20(tokenAddress);
        dispatch = DispatchInterface(dispatchAddress);
        bondage = BondageInterface(bondageAddress);
        registry = RegistryInterface(registryAddress);
        oracle =oracleAddr;
        DataQuery=query;
        querySpec=specifier;
        queryParams=params;
    }
    modifier onlyOracle(){
        require(msg.sender==address(dispatch),"caller must the dispatch address ");
        _;
    }
    /*
    Implements overloaded callback functions for Client1
    */
    
    function callback(uint256 id, int[]  calldata response) external  onlyOracle() {
        require(response.length==1,"int resoonse must have length of 1 for prices"); 
        emit Result3(id, response);
        priceResults.push(uint(response[0]));
        priceTimeStamps.push(block.timestamp);
        priceQueryIDs.push(id);
        //queryIntResults[id]=response;
       // queryIntIDs[totalIntQueries]=id;
        totalIntQueries++;
        // do something with result
    }
   
    function initPriceQuery() external returns (uint256) {
        uint256 id = dispatch.query(oracle, DataQuery, querySpec, queryParams);
        emit MadeQuery(oracle, DataQuery, id);
        return id;
    }
   

    function returnPriceQueries() public view returns(uint[] memory,uint[] memory,uint[] memory){
        return (priceResults,priceTimeStamps,priceQueryIDs);
    }
    function latestPrice() public view returns(uint,uint,uint){
       return (priceResults[totalIntQueries-1],priceTimeStamps[totalIntQueries-1],priceQueryIDs[totalIntQueries-1]);
    }

    function updateQuery(address oracleAddr, string memory query, bytes32 specifier, bytes32[] memory params) public onlyOwner{
        oracle =oracleAddr;
        DataQuery=query;
        querySpec=specifier;
        queryParams=params;
    }
    function delegateBond() public onlyOwner{

    }
    // attempts to cancel an existing query
    function cancelQuery(uint256 id) external onlyOwner {
        dispatch.cancelQuery(id);
    }

}
