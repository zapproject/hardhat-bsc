pragma solidity =0.5.16;

import './Client.sol';
import '../../platform/dispatch/DispatchInterface.sol';
import '../../platform/bondage/BondageInterface.sol';
import '../../platform/registry/RegistryInterface.sol';
import './OnChainProvider.sol';
import '../ERC20.sol';
import '../ownership/Ownable.sol';

contract priceClient is Ownable {
    event MadeQuery(address oracle, string query, uint256 id);
    event Result1(uint256 id, string response1);
    event Result32(uint256 id, bytes32 response1);
    event Result2(uint256 id, string response1, string response2);
    event Result3(uint256 id, int256[] response3);

    mapping(uint256 => string) public queryResults;
    mapping(uint256 => bytes32[]) public queryBytes32Results;
    //mapping(uint=>int[]) public queryIntResults;
    uint256[] public priceResults;
    uint256[] public priceTimeStamps;
    uint256[] public priceQueryIDs;

    mapping(uint256 => uint256) public queryBytes32IDs;
    mapping(uint256 => uint256) public queryIntIDs;
    mapping(uint256 => uint256) public queryIDs;

    //** Oracle Details*/
    address public oracle;
    string public DataQuery;
    bytes32 public querySpec;
    bytes32[] public queryParams;

    uint256 public totalQueries;
    uint256 public totalIntQueries;
    uint256 public totalBytes32Queries;

    ERC20 token;
    DispatchInterface dispatch;
    BondageInterface bondage;
    RegistryInterface registry;

    constructor(
        address tokenAddress,
        address dispatchAddress,
        address bondageAddress,
        address registryAddress,
        address oracleAddr,
        string memory query,
        bytes32 specifier,
        bytes32[] memory params
    ) public {
        token = ERC20(tokenAddress);
        dispatch = DispatchInterface(dispatchAddress);
        bondage = BondageInterface(bondageAddress);
        registry = RegistryInterface(registryAddress);
        oracle = oracleAddr;
        DataQuery = query;
        querySpec = specifier;
        queryParams = params;
    }

    modifier onlyOracle() {
        require(
            msg.sender == address(dispatch),
            'caller must the dispatch address '
        );
        _;
    }

    /*
    Implements overloaded callback functions for Client1
    */

    function callback(uint256 id, int256[] calldata response)
        external
        onlyOracle()
    {
        require(
            response.length == 1,
            'int resoonse must have length of 1 for prices'
        );
        emit Result3(id, response);
        priceResults.push(uint256(response[0]));
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

    function returnPriceQueries()
        public
        view
        returns (
            uint256[] memory,
            uint256[] memory,
            uint256[] memory
        )
    {
        return (priceResults, priceTimeStamps, priceQueryIDs);
    }

    function latestPrice()
        public
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        return (
            priceResults[totalIntQueries - 1],
            priceTimeStamps[totalIntQueries - 1],
            priceQueryIDs[totalIntQueries - 1]
        );
    }

    function updateQuery(
        address oracleAddr,
        string memory query,
        bytes32 specifier,
        bytes32[] memory params
    ) public onlyOwner {
        oracle = oracleAddr;
        DataQuery = query;
        querySpec = specifier;
        queryParams = params;
    }

    function delegateBond() public onlyOwner {}

    // attempts to cancel an existing query
    function cancelQuery(uint256 id) external onlyOwner {
        dispatch.cancelQuery(id);
    }
}
