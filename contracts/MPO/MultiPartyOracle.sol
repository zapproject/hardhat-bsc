pragma solidity ^0.5.1;

import "./MPOStorage.sol";
import "./lib/Destructible.sol";
import "./lib/ZapInterface.sol";
// import "./ECRecovery.sol";
// @title - A MultiPartyOracle contract that implements the client1 callback
// @authors - Max Inciong, Jonathan Pang, Jon Morales
// @notice the contract receives queries from dispatch and queries multiple providers to resolve the query

contract MultiPartyOracle {
    event RecievedQuery(string query, bytes32 endpoint, bytes32[] params, address sender);
    event ReceivedResponse(uint256 queryId, address responder, string response);
    event Incoming(
        uint256 id,
        address provider,
        address subscriber,
        string query,
        bytes32 endpoint,
        bytes32[] endpointParams,
        bool onchainSubscriber
    );

    event Result1(uint256 id, string response1);

    ZapInterface dispatch;
    ZapInterface bondage;
    ZapInterface registry;
    ZapInterface ztoken;
    MPOStorage stor;
    
    //move dispatch address to storage
    address dispatchAddress;
    address bondageAddress;
    address registryAddress;
    address ztokenAddress;
    address public storageAddress;
    address aggregator; 

    bytes32 public spec3 = "Nonproviders";
    int256[] curve3 = [1,1,1000000000];
    // @notice constructor that sets up zap registry, dispatch, and MPO storage. Also sets up registry provider curve
    // @param address registryAddress
    // @param address _dispatchAddress
    // @param address mpoStorageAddress
    constructor(address _zapCoord, address mpoStorageAddress) public{
        // require(_responders.length<=stor.getNumResponders(), "Soft Cap reached");
        registryAddress = ZapInterface(_zapCoord).getContract("REGISTRY");
        registry = ZapInterface(registryAddress);
        dispatchAddress = ZapInterface(_zapCoord).getContract("DISPATCH");
        dispatch = ZapInterface(dispatchAddress);
        bondageAddress = ZapInterface(_zapCoord).getContract("BONDAGE");
        bondage = ZapInterface(bondageAddress);
        ztokenAddress = ZapInterface(_zapCoord).getContract("ZAP_TOKEN");
        ztoken = ZapInterface(ztokenAddress);
        stor = MPOStorage(mpoStorageAddress);
    }
    function setup(address[] memory _responders) public{
        stor.setResponders(_responders);
        bytes32 title = "MultiPartyOracle";
        registry.initiateProvider(12345, title);
        registry.initiateProviderCurve(spec3, curve3, address(0));

    }
    
    // middleware function for handling queries
    // @notice recieves query, called from dispatch
    // @param uint256 id Dispatch created query ID
    // @param string userQuery User provided query String
    // @param bytes32 endpoint Determines whether to use Onchain Providers, Offchain Providers, Non-Providers
    // @param bytes32[] endpointParams Parameters passed to providers
    // @param bool onchainSubscriber Unused boolean that determines if subscriber is a smart contract
    function receive(uint256 id, string calldata userQuery, bytes32 endpoint, bytes32[] calldata endpointParams, bool onchainSubscriber) external {
        emit RecievedQuery(userQuery, endpoint, endpointParams, msg.sender);
        require(msg.sender == dispatchAddress && stor.getQueryStatus(id) == 0, "Dispatch only");
        // endpoint params [from, to, threshold, precision, delta]
        bytes32 hash = keccak256(abi.encodePacked(endpoint));
        uint256 threshold = uint(endpointParams[2]);
        require(threshold > 0 && threshold <= stor.getNumResponders(),"Invalid Threshold Length");
        stor.setThreshold(id, threshold );
        
        if(hash == keccak256(abi.encodePacked(spec3))) {
            stor.setQueryStatus(id,1);
            uint256 mpoid;
            for(uint i=0; i<stor.getNumResponders(); i++) {      
                mpoid=uint256(keccak256(abi.encodePacked(
                                block.number, now, userQuery,id,stor.getResponderAddress(i)
                                )));
                stor.setClientQueryId(mpoid, id);
                emit Incoming(mpoid, stor.getResponderAddress(i),address(this), userQuery, "Hello?", endpointParams, true);
                
            }
        }
    }

    // @notice callback used by dispatch or nonproviders once a response has been created for the query
    // @param queryId MPO or dispatch generated MPOID to used to determine client query ID
    // @param response Response to be returned to client
    // @param msgHash, sigv, sigr, sigs to be used in ecrecover
    // @dev 
    uint numTrue = 0;
    uint numFalse = 0;
    function callback(uint256 mpoId, uint256[] calldata responses, bytes32[] calldata msgHash, uint8[] calldata sigv, bytes32[] calldata sigrs) external {
        // require(msg.sender == aggregator, "Invalid aggregator");
        
        uint256 queryId = stor.getClientQueryId(mpoId);
        address sender;
        
        for(uint i=0;i<msgHash.length;i++){
            sender = ecrecover(msgHash[i],sigv[i],sigrs[2*i],sigrs[2*i+1]);
            // If address is in whitelist
            if( stor.getAddressStatus(sender) && !stor.onlyOneResponse(queryId,sender)){
                    if(responses[i]!=0){
                        numTrue++;
                    }
                    else{
                        numFalse++;
                    }
                    stor.addResponse(queryId,sender);
                }
        }
        
        // Query status 0 = not started, 1 = in progress, 2 = complete
        if(stor.getQueryStatus(queryId) == 1) {
            // If enough answers meet the threshold send back the average of the answers
            int256[] memory response=new int256[](1);
            if(numTrue>numFalse && numTrue >= stor.getThreshold(queryId)){                
                stor.setQueryStatus(queryId, 2);
                response[0]=1;
                return;
            }
            if(numFalse>numTrue && numFalse >= stor.getThreshold(queryId)){
                stor.setQueryStatus(queryId, 2);
                response[0]=0;
                dispatch.respondIntArray(queryId, response);
                return;
            }
        }
        

    }
    mapping(address => uint) credits;
    uint payoutTally = 0;
    function payout() external {
        require(stor.getAddressStatus(msg.sender), "Invalid Voter");
        payoutTally++;
        
        if(payoutTally > stor.getNumResponders()/2){
            uint payoutVal = bondage.getBoundDots(address(this),address(this),"Nonproviders");
            require(payoutVal>0, "No dots bound");
            bondage.unbond(address(this),"Nonproviders",payoutVal);
            payoutVal = ztoken.balanceOf(address(this))/stor.getNumResponders();
            address[] memory payArr = stor.getResponders();
            for(uint i=0; i<stor.getNumResponders(); i++) {
                credits[payArr[i]] += payoutVal;
                // require(ztoken.transfer(payArr[i],payout), "Failed to Tranfer Token");
            }
            payoutTally=0;
        }
        
        

    }

    function withdrawBalance() public {
        uint amount = credits[msg.sender];

        require(amount != 0, "No payout available");
        require(ztoken.balanceOf(address(this)) >= amount, "Not enough funds in contract");

        credits[msg.sender] = 0;

        require(ztoken.transfer(msg.sender, amount), "Failed to Tranfer Token");
    }

  }
    

