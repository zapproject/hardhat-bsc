// Sources flattened with hardhat v2.6.8 https://hardhat.org

// File contracts/zap-miner/libraries/SafeMathM.sol

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

//Slightly modified SafeMath library - includes a min and max function, removes useless div function
library SafeMathM {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }

    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    function max(int256 a, int256 b) internal pure returns (uint256) {
        assert(a >= 0 && b >= 0);
        return a > b ? uint256(a) : uint256(b);
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }
}


// File contracts/zap-miner/libraries/ZapStorage.sol

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
/**
 * @title Zap Oracle Storage Library
 * @dev Contains all the variables/structs used by Zap
 */

// Libraries contain reusable Solidity types
library ZapStorage {
    //Internal struct for use in proof-of-work submission
    struct Details {
        uint256 value;
        address miner;
    }

    struct Dispute {
        bytes32 hash; //unique hash of dispute: keccak256(_miner,_requestId,_timestamp)
        int256 tally; //current tally of votes for - against measure
        bool executed; //is the dispute settled
        bool disputeVotePassed; //did the vote pass?
        //Contract to be foked: 0 - No Contract to be forked, 1 - Zap Contract, 2 - ZapMaster, 3 - Vault Contract
        uint256 forkedContract;
        address reportedMiner; //miner who alledgedly submitted the 'bad value' will get disputeFee if dispute vote fails
        address reportingParty; //miner reporting the 'bad value'-pay disputeFee will get reportedMiner's stake if dispute vote passes
        address proposedForkAddress; //new fork address (if fork proposal)
        mapping(bytes32 => uint256) disputeUintVars;
        //Each of the variables below is saved in the mapping disputeUintVars for each disputeID
        //e.g. ZapStorageStruct.DisputeById[disputeID].disputeUintVars[keccak256("requestId")]
        //These are the variables saved in this mapping:
        // uint keccak256("requestId");//apiID of disputed value
        // uint keccak256("timestamp");//timestamp of distputed value
        // uint keccak256("value"); //the value being disputed
        // uint keccak256("minExecutionDate");//7 days from when dispute initialized
        // uint keccak256("numberOfVotes");//the number of parties who have voted on the measure
        // uint keccak256("blockNumber");// the blocknumber for which votes will be calculated from
        // uint keccak256("minerSlot"); //index in dispute array
        // uint keccak256("quorum"); //quorum for dispute vote NEW
        // uint keccak256("fee"); //fee paid corresponding to dispute
        mapping(address => bool) voted; //mapping of address to whether or not they voted
    }

    struct StakeInfo {
        uint256 currentStatus; //0-not Staked, 1=Staked, 2=LockedForWithdraw 3= OnDispute
        uint256 startDate; //stake start date
    }

    //Internal struct to allow balances to be queried by blocknumber for voting purposes
    struct Checkpoint {
        uint128 fromBlock; // fromBlock is the block number that the value was generated from
        uint128 value; // value is the amount of tokens at a specific block number
    }

    struct Request {
        string queryString; //id to string api
        string dataSymbol; //short name for api request
        bytes32 queryHash; //hash of api string and granularity e.g. keccak256(abi.encodePacked(_sapi,_granularity))
        uint256[] requestTimestamps; //array of all newValueTimestamps requested
        mapping(bytes32 => uint256) apiUintVars;
        //Each of the variables below is saved in the mapping apiUintVars for each api request
        //e.g. requestDetails[_requestId].apiUintVars[keccak256("totalTip")]
        //These are the variables saved in this mapping:
        // uint keccak256("granularity"); //multiplier for miners
        // uint keccak256("requestQPosition"); //index in requestQ
        // uint keccak256("totalTip");//bonus portion of payout
        mapping(uint256 => uint256) minedBlockNum; //[apiId][minedTimestamp]=>block.number
        mapping(uint256 => uint256) finalValues; //This the time series of finalValues stored by the contract where uint UNIX timestamp is mapped to value
        mapping(uint256 => bool) inDispute; //checks if API id is in dispute or finalized.
        mapping(uint256 => address[5]) minersByValue;
        mapping(uint256 => uint256[5]) valuesByTimestamp;
    }

    struct ZapStorageStruct {
        bytes32 currentChallenge; //current challenge to be solved
        uint256[51] requestQ; //uint50 array of the top50 requests by payment amount
        uint256[] newValueTimestamps; //array of all timestamps requested
        Details[5] currentMiners; //This struct is for organizing the five mined values to find the median
        mapping(bytes32 => address) addressVars;
        //Address fields in the Zap contract are saved the addressVars mapping
        //e.g. addressVars[keccak256("zapContract")] = address
        //These are the variables saved in this mapping:
        // address keccak256("zapContract");//Zap address
        // address  keccak256("zapTokenContract");//ZapToken address
        // address  keccak256("_owner");//Zap Owner address
        // address  keccak256("_deity");//Zap Owner that can do things at will
        // address  keccak256("_vault");//Address of the vault contract set in Zap.sol
        // address  keccak256("oldZapMaster); // The predecessor ZapMaster if there exists one (for forking)
        mapping(bytes32 => uint256) uintVars;
        //uint fields in the Zap contract are saved the uintVars mapping
        //e.g. uintVars[keccak256("decimals")] = uint
        //These are the variables saved in this mapping:
        // keccak256("decimals");    //18 decimal standard ERC20
        // keccak256("disputeFee");//cost to dispute a mined value
        // keccak256("disputeCount");//totalHistoricalDisputes
        // keccak256("total_supply"); //total_supply of the token in circulation
        // keccak256("stakeAmount");//stakeAmount for miners (we can cut gas if we just hardcode it in...or should it be variable?)
        // keccak256("stakerCount"); //number of parties currently staked
        // keccak256("timeOfLastNewValue"); // time of last challenge solved
        // keccak256("difficulty"); // Difficulty of current block
        // keccak256("currentTotalTips"); //value of highest api/timestamp PayoutPool
        // keccak256("currentRequestId"); //API being mined--updates with the ApiOnQ Id
        // keccak256("requestCount"); // total number of requests through the system
        // keccak256("slotProgress");//Number of miners who have mined this value so far
        // keccak256("miningReward");//Mining Reward in PoWo tokens given to all miners per value
        // keccak256("timeTarget"); //The time between blocks (mined Oracle values)
        // keccak256("currentMinerReward"); //The last reward given to miners on creation of a new block
        mapping(bytes32 => mapping(address => bool)) minersByChallenge; //This is a boolean that tells you if a given challenge has been completed by a given miner
        mapping(uint256 => uint256) requestIdByTimestamp; //minedTimestamp to apiId
        mapping(uint256 => uint256) requestIdByRequestQIndex; //link from payoutPoolIndex (position in payout pool array) to apiId
        mapping(uint256 => Dispute) disputesById; //disputeId=> Dispute details
        mapping(address => Checkpoint[]) balances; //balances of a party given blocks
        mapping(address => mapping(address => uint256)) allowed; //allowance for a given party and approver
        mapping(address => StakeInfo) stakerDetails; //mapping from a persons address to their staking info
        mapping(uint256 => Request) requestDetails; //mapping of apiID to details
        mapping(bytes32 => uint256) requestIdByQueryHash; // api bytes32 gets an id = to count of requests array
        mapping(bytes32 => uint256) disputeIdByDisputeHash; //maps a hash to an ID for each dispute
    }
}


// File contracts/zap-miner/libraries/Utilities.sol

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

//Functions for retrieving min and Max in 51 length array (requestQ)
//Taken partly from: https://github.com/modular-network/ethereum-libraries-array-utils/blob/master/contracts/Array256Lib.sol

library Utilities {
    /// @dev Returns the minimum value and position in an array.
    //@note IT IGNORES THE 0 INDEX
    function getMin(uint256[51] memory arr)
        internal
        pure
        returns (uint256 min, uint256 minIndex)
    {
        assembly {
            minIndex := 50
            min := mload(add(arr, mul(minIndex, 0x20)))
            for {
                let i := 49
            } gt(i, 0) {
                i := sub(i, 1)
            } {
                let item := mload(add(arr, mul(i, 0x20)))
                if lt(item, min) {
                    min := item
                    minIndex := i
                }
            }
        }
    }

    // function getMin(uint[51] memory data) internal pure returns(uint256 minimal,uint minIndex) {
    //       minIndex = data.length - 1;
    //       minimal = data[minIndex];
    //       for(uint i = data.length-1;i > 0;i--) {
    //           if(data[i] < minimal) {
    //               minimal = data[i];
    //               minIndex = i;
    //           }
    //       }
    // }

    function getMax(uint256[51] memory arr)
        internal
        pure
        returns (uint256 max, uint256 maxIndex)
    {
        assembly {
            for {
                let i := 0
            } lt(i, 51) {
                i := add(i, 1)
            } {
                let item := mload(add(arr, mul(i, 0x20)))
                if lt(max, item) {
                    max := item
                    maxIndex := i
                }
            }
        }
    }
}


// File contracts/zap-miner/libraries/ZapGettersLibrary.sol

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;



/**
 * @title Zap Getters Library
 * @dev This is the getter library for all variables in the Zap Token system. ZapGetters references this
 * libary for the getters logic
 */
library ZapGettersLibrary {
    using SafeMathM for uint256;

    event NewZapAddress(address _newZap); //emmited when a proposed fork is voted true

    /*Functions*/

    //The next two functions are onlyOwner functions.  For Zap to be truly decentralized, we will need to transfer the Deity to the 0 address.
    //Only needs to be in library
    /**
     * @dev This function allows us to set a new Deity (or remove it)
     * @param _newDeity address of the new Deity of the zap system
     */
    function changeDeity(
        ZapStorage.ZapStorageStruct storage self,
        address _newDeity
    ) internal {
        require(self.addressVars[keccak256('_deity')] == msg.sender);
        self.addressVars[keccak256('_deity')] = _newDeity;
    }

    //Only needs to be in library
    /**
     * @dev This function allows the deity to upgrade the Zap System
     * @param _zapContract address of new updated ZapCore contract
     */
    function changeZapContract(
        ZapStorage.ZapStorageStruct storage self,
        address _zapContract
    ) internal {
        require(self.addressVars[keccak256('_deity')] == msg.sender);
        self.addressVars[keccak256('zapContract')] = _zapContract;
        emit NewZapAddress(_zapContract);
    }

    function changeVaultContract(
        ZapStorage.ZapStorageStruct storage self,
        address _vaultAddress
    ) internal {
        require(self.addressVars[keccak256('_owner')] == msg.sender);

        self.addressVars[keccak256('_vault')] = _vaultAddress;
    }

    /*Zap Getters*/

    /**
     * @dev This function tells you if a given challenge has been completed by a given miner
     * @param _challenge the challenge to search for
     * @param _miner address that you want to know if they solved the challenge
     * @return true if the _miner address provided solved the
     */
    function didMine(
        ZapStorage.ZapStorageStruct storage self,
        bytes32 _challenge,
        address _miner
    ) internal view returns (bool) {
        return self.minersByChallenge[_challenge][_miner];
    }

    /**
     * @dev Checks if an address voted in a dispute
     * @param _disputeId to look up
     * @param _address of voting party to look up
     * @return bool of whether or not party voted
     */
    function didVote(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _disputeId,
        address _address
    ) internal view returns (bool) {
        return self.disputesById[_disputeId].voted[_address];
    }

    /**
     * @dev allows Zap to read data from the addressVars mapping
     * @param _data is the keccak256("variable_name") of the variable that is being accessed.
     * These are examples of how the variables are saved within other functions:
     * addressVars[keccak256("_owner")]
     * addressVars[keccak256("zapContract")]
     */
    function getAddressVars(
        ZapStorage.ZapStorageStruct storage self,
        bytes32 _data
    ) internal view returns (address) {
        return self.addressVars[_data];
    }

    // /**
    //  * @dev Gets all dispute variables
    //  * @param _disputeId to look up
    //  * @return bytes32 hash of dispute
    //  * @return bool executed where true if it has been voted on
    //  * @return bool disputeVotePassed
    //  * @return bool isPropFork true if the dispute is a proposed fork
    //  * @return address of reportedMiner
    //  * @return address of reportingParty
    //  * @return address of proposedForkAddress
    //  * @return uint of requestId
    //  * @return uint of timestamp
    //  * @return uint of value
    //  * @return uint of minExecutionDate
    //  * @return uint of numberOfVotes
    //  * @return uint of blocknumber
    //  * @return uint of minerSlot
    //  * @return uint of quorum
    //  * @return uint of fee
    //  * @return int count of the current tally
    //  */
    function getAllDisputeVars(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _disputeId
    )
        internal
        view
        returns (
            bytes32,
            bool,
            bool,
            address,
            address,
            address,
            uint256,
            uint256[9] memory,
            int256
        )
    {
        ZapStorage.Dispute storage disp = self.disputesById[_disputeId];
        return (
            disp.hash,
            disp.executed,
            disp.disputeVotePassed,
            disp.reportedMiner,
            disp.reportingParty,
            disp.proposedForkAddress,
            disp.forkedContract,
            [  //all these keys are being being calculated
                disp.disputeUintVars[keccak256('requestId')],
                disp.disputeUintVars[keccak256('timestamp')],
                disp.disputeUintVars[keccak256('value')],
                disp.disputeUintVars[keccak256('minExecutionDate')],
                disp.disputeUintVars[keccak256('numberOfVotes')],
                disp.disputeUintVars[keccak256('blockNumber')],
                disp.disputeUintVars[keccak256('minerSlot')],
                disp.disputeUintVars[keccak256('quorum')],
                disp.disputeUintVars[keccak256('fee')]
            ],
            disp.tally
        );
    }

    /**
     * @dev Getter function for variables for the requestId being currently mined(currentRequestId)
     * @return current challenge, curretnRequestId, level of difficulty, api/query string, and granularity(number of decimals requested), total tip for the request
     */
    function getCurrentVariables(ZapStorage.ZapStorageStruct storage self)
        internal
        view
        returns (
            bytes32,
            uint256,
            uint256,
            string memory,
            uint256,
            uint256
        )
    {
        return (
            self.currentChallenge, //these keys below are being calculated
            self.uintVars[keccak256('currentRequestId')],
            self.uintVars[keccak256('difficulty')],
            self
                .requestDetails[self.uintVars[keccak256('currentRequestId')]]
                .queryString,
            self
                .requestDetails[self.uintVars[keccak256('currentRequestId')]]
                .apiUintVars[keccak256('granularity')],
            self
                .requestDetails[self.uintVars[keccak256('currentRequestId')]]
                .apiUintVars[keccak256('totalTip')]
        );
    }

    /**
     * @dev Checks if a given hash of miner,requestId has been disputed
     * @param _hash is the sha256(abi.encodePacked(_miners[2],_requestId));
     * @return uint disputeId
     */
    function getDisputeIdByDisputeHash(
        ZapStorage.ZapStorageStruct storage self,
        bytes32 _hash
    ) internal view returns (uint256) {
        return self.disputeIdByDisputeHash[_hash];
    }

    /**
     * @dev Checks for uint variables in the disputeUintVars mapping based on the disuputeId
     * @param _disputeId is the dispute id;
     * @param _data the variable to pull from the mapping. _data = keccak256("variable_name") where variable_name is
     * the variables/strings used to save the data in the mapping. The variables names are
     * commented out under the disputeUintVars under the Dispute struct
     * @return uint value for the bytes32 data submitted
     */
    function getDisputeUintVars(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _disputeId,
        bytes32 _data
    ) internal view returns (uint256) {
        return self.disputesById[_disputeId].disputeUintVars[_data];
    }

    /**
     * @dev Gets the a value for the latest timestamp available
     * @return value for timestamp of last proof of work submited
     * @return true if the is a timestamp for the lastNewValue
     */
    function getLastNewValue(ZapStorage.ZapStorageStruct storage self)
        internal
        view
        returns (uint256, bool)
    {
        return (
            retrieveData(
                self, //more being calculated
                self.requestIdByTimestamp[
                    self.uintVars[keccak256('timeOfLastNewValue')]
                ],
                self.uintVars[keccak256('timeOfLastNewValue')]
            ),
            true
        );
    }

    /**
     * @dev Gets the a value for the latest timestamp available
     * @param _requestId being requested
     * @return value for timestamp of last proof of work submited and if true if it exist or 0 and false if it doesn't
     */
    function getLastNewValueById(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _requestId
    ) internal view returns (uint256, bool) {
        ZapStorage.Request storage _request = self.requestDetails[_requestId];
        if (_request.requestTimestamps.length > 0) {
            return (
                retrieveData(
                    self,
                    _requestId,
                    _request.requestTimestamps[
                        _request.requestTimestamps.length - 1
                    ]
                ),
                true
            );
        } else {
            return (0, false);
        }
    }

    /**
     * @dev Gets blocknumber for mined timestamp
     * @param _requestId to look up
     * @param _timestamp is the timestamp to look up blocknumber
     * @return uint of the blocknumber which the dispute was mined
     */
    function getMinedBlockNum(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _requestId,
        uint256 _timestamp
    ) internal view returns (uint256) {
        return self.requestDetails[_requestId].minedBlockNum[_timestamp];
    }

    /**
     * @dev Gets the 5 miners who mined the value for the specified requestId/_timestamp
     * @param _requestId to look up
     * @param _timestamp is the timestamp to look up miners for
     * @return the 5 miners' addresses
     */
    function getMinersByRequestIdAndTimestamp(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _requestId,
        uint256 _timestamp
    ) internal view returns (address[5] memory) {
        return self.requestDetails[_requestId].minersByValue[_timestamp];
    }

    /**
     * @dev Counts the number of values that have been submited for the request
     * if called for the currentRequest being mined it can tell you how many miners have submitted a value for that
     * request so far
     * @param _requestId the requestId to look up
     * @return uint count of the number of values received for the requestId
     */
    function getNewValueCountbyRequestId(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _requestId
    ) internal view returns (uint256) {
        return self.requestDetails[_requestId].requestTimestamps.length;
    }

    /**
     * @dev Getter function for the specified requestQ index
     * @param _index to look up in the requestQ array
     * @return uint of reqeuestId
     */
    function getRequestIdByRequestQIndex(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _index
    ) internal view returns (uint256) {
        require(_index <= 50);
        return self.requestIdByRequestQIndex[_index];
    }

    /**
     * @dev Getter function for requestId based on timestamp
     * @param _timestamp to check requestId
     * @return uint of reqeuestId
     */
    function getRequestIdByTimestamp(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _timestamp
    ) internal view returns (uint256) {
        return self.requestIdByTimestamp[_timestamp];
    }

    /**
     * @dev Getter function for requestId based on the qeuaryHash
     * @param _queryHash hash(of string api and granularity) to check if a request already exists
     * @return uint requestId
     */
    function getRequestIdByQueryHash(
        ZapStorage.ZapStorageStruct storage self,
        bytes32 _queryHash
    ) internal view returns (uint256) {
        return self.requestIdByQueryHash[_queryHash];
    }

    /**
     * @dev Getter function for the requestQ array
     * @return the requestQ arrray
     */
    function getRequestQ(ZapStorage.ZapStorageStruct storage self)
        internal
        view
        returns (uint256[51] memory)
    {
        return self.requestQ;
    }

    /**
     * @dev Allowes access to the uint variables saved in the apiUintVars under the requestDetails struct
     * for the requestId specified
     * @param _requestId to look up
     * @param _data the variable to pull from the mapping. _data = keccak256("variable_name") where variable_name is
     * the variables/strings used to save the data in the mapping. The variables names are
     * commented out under the apiUintVars under the requestDetails struct
     * @return uint value of the apiUintVars specified in _data for the requestId specified
     */
    function getRequestUintVars(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _requestId,
        bytes32 _data
    ) internal view returns (uint256) {
        return self.requestDetails[_requestId].apiUintVars[_data];
    }

    /**
     * @dev Gets the API struct variables that are not mappings
     * @param _requestId to look up
     * @return string of api to query
     * @return string of symbol of api to query
     * @return bytes32 hash of string
     * @return bytes32 of the granularity(decimal places) requested
     * @return uint of index in requestQ array
     * @return uint of current payout/tip for this requestId
     */
    function getRequestVars(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _requestId
    )
        internal
        view
        returns (
            string memory,
            string memory,
            bytes32,
            uint256,
            uint256,
            uint256
        )
    {
        ZapStorage.Request storage _request = self.requestDetails[_requestId];
        return (
            _request.queryString,
            _request.dataSymbol,
            _request.queryHash, //more to be calculated
            _request.apiUintVars[keccak256('granularity')],
            _request.apiUintVars[keccak256('requestQPosition')],
            _request.apiUintVars[keccak256('totalTip')]
        );
    }

    /**
     * @dev This function allows users to retireve all information about a staker
     * @param _staker address of staker inquiring about
     * @return uint current state of staker
     * @return uint startDate of staking
     */
    function getStakerInfo(
        ZapStorage.ZapStorageStruct storage self,
        address _staker
    ) internal view returns (uint256, uint256) {
        return (
            self.stakerDetails[_staker].currentStatus,
            self.stakerDetails[_staker].startDate
        );
    }

    /**
     * @dev Gets the 5 miners who mined the value for the specified requestId/_timestamp
     * @param _requestId to look up
     * @param _timestamp is the timestampt to look up miners for
     * @return address[5] array of 5 addresses ofminers that mined the requestId
     */
    function getSubmissionsByTimestamp(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _requestId,
        uint256 _timestamp
    ) internal view returns (uint256[5] memory) {
        return self.requestDetails[_requestId].valuesByTimestamp[_timestamp];
    }

    /**
     * @dev Gets the timestamp for the value based on their index
     * @param _requestID is the requestId to look up
     * @param _index is the value index to look up
     * @return uint timestamp
     */
    function getTimestampbyRequestIDandIndex(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _requestID,
        uint256 _index
    ) internal view returns (uint256) {
        return self.requestDetails[_requestID].requestTimestamps[_index];
    }

    /**
     * @dev Getter for the variables saved under the ZapStorageStruct uintVars variable
     * @param _data the variable to pull from the mapping. _data = keccak256("variable_name") where variable_name is
     * the variables/strings used to save the data in the mapping. The variables names are
     * commented out under the uintVars under the ZapStorageStruct struct
     * This is an example of how data is saved into the mapping within other functions:
     * self.uintVars[keccak256("stakerCount")]
     * @return uint of specified variable
     */
    function getUintVar(ZapStorage.ZapStorageStruct storage self, bytes32 _data)
        internal
        view
        returns (uint256)
    {
        return self.uintVars[_data];
    }

    /**
     * @dev Getter function for next requestId on queue/request with highest payout at time the function is called
     * @return onDeck/info on request with highest payout-- RequestId, Totaltips, and API query string
     */
    function getVariablesOnDeck(ZapStorage.ZapStorageStruct storage self)
        internal
        view
        returns (
            uint256,
            uint256,
            string memory
        )
    {
        uint256 newRequestId = getTopRequestID(self);
        return (
            newRequestId, //more being calculated
            self.requestDetails[newRequestId].apiUintVars[
                keccak256('totalTip')
            ],
            self.requestDetails[newRequestId].queryString
        );
    }

    // /**
    //  * @dev Getter function for the request with highest payout. This function is used withing the getVariablesOnDeck function
    //  * @return uint _requestId of request with highest payout at the time the function is called
    //  */
    function getTopRequestID(ZapStorage.ZapStorageStruct storage self)
        internal
        view
        returns (uint256 _requestId)
    {
        uint256 _max;
        uint256 _index;
        (_max, _index) = Utilities.getMax(self.requestQ);
        _requestId = self.requestIdByRequestQIndex[_index];
    }

    /**
     * @dev Gets the 5 miners who mined the value for the specified requestId/_timestamp
     * @param _requestId to look up
     * @param _timestamp is the timestamp to look up miners for
     * @return bool true if requestId/timestamp is under dispute
     */
    function isInDispute(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _requestId,
        uint256 _timestamp
    ) internal view returns (bool) {
        return self.requestDetails[_requestId].inDispute[_timestamp];
    }

    /**
     * @dev Retreive value from oracle based on requestId/timestamp
     * @param _requestId being requested
     * @param _timestamp to retreive data/value from
     * @return uint value for requestId/timestamp submitted
     */
    function retrieveData(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _requestId,
        uint256 _timestamp
    ) internal view returns (uint256) {
        return self.requestDetails[_requestId].finalValues[_timestamp];
    }

    /**
     * @dev Getter for the total_supply of oracle tokens
     * @return uint total supply
     */
    function totalSupply(ZapStorage.ZapStorageStruct storage self)
        internal
        view
        returns (uint256)
    { //below is caculation
        return self.uintVars[keccak256('total_supply')];
    }
}


// File contracts/zap-miner/libraries/ZapDispute.sol

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;


/**
 * @title Zap Dispute
 * @dev Contais the methods related to disputes. Zap.sol references this library for function's logic.
 */

library ZapDispute {
    using SafeMathM for uint256;

    event NewDispute(
        uint256 indexed _disputeId,
        uint256 indexed _requestId,
        uint256 _timestamp,
        address _miner
    ); //emitted when a new dispute is initialized
    event Voted(
        uint256 indexed _disputeID,
        bool _position,
        address indexed _voter
    ); //emitted when a new vote happens
    event DisputeVoteTallied(
        uint256 indexed _disputeID,
        int256 _result,
        address indexed _reportedMiner,
        address _reportingParty,
        bool _active
    ); //emitted upon dispute tally
    event NewZapAddress(address _newZap); //emmited when a proposed fork is voted true
    event NewForkProposal(
        uint256 indexed _disputeId,
        uint256 _timestamp,
        address indexed proposedContract
    );

    /*Functions*/

    /**
     * @dev Allows token holders to vote
     * @param _disputeId is the dispute id
     * @param _supportsDispute is the vote (true=the dispute has basis false = vote against dispute)
     */
    function vote(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _disputeId,
        bool _supportsDispute,
        uint256 voteWeight
    ) public {
        ZapStorage.Dispute storage disp = self.disputesById[_disputeId];

        //ensure that only stakers can vote
        require(self.stakerDetails[msg.sender].currentStatus == 1, "Only Stakers that are not under dispute can vote");

        //Require that the msg.sender has not voted
        require(disp.voted[msg.sender] != true, "msg.sender has already voted");

        //Requre that the user had a balance >0 at time/blockNumber the disupte began
        require(voteWeight > 0, "User must have a balance greater than zero");

        //Ensure the reporting party cannot vote for that specific dispute
        require(msg.sender != disp.reportingParty, "The reporting party of the dispute cannot vote");

        //Update user voting status to true
        disp.voted[msg.sender] = true;

        //Update the number of votes for the dispute
        disp.disputeUintVars[keccak256('numberOfVotes')] += 1;

        //Update the quorum by adding the voteWeight
        disp.disputeUintVars[keccak256('quorum')] += voteWeight;

        //If the user supports the dispute increase the tally for the dispute by the voteWeight
        //otherwise decrease it
        if (_supportsDispute) {
            disp.tally = disp.tally + int256(voteWeight);
        } else {
            disp.tally = disp.tally - int256(voteWeight);
        }

        //Let the network know the user has voted on the dispute and their casted vote
        emit Voted(_disputeId, _supportsDispute, msg.sender);
    }

    /**
     * @dev tallies the votes.
     * @param _disputeId is the dispute id
     */
    function tallyVotes(
        ZapStorage.ZapStorageStruct storage self,
        uint256 _disputeId
    ) public returns (address _from, address _to, uint _disputeFee) {

        ZapStorage.Dispute storage disp = self.disputesById[_disputeId];
        ZapStorage.Request storage _request = self.requestDetails[
            disp.disputeUintVars[keccak256('requestId')]
        ];
        
        uint disputeFeeForDisputeId = disp.disputeUintVars[keccak256("fee")];
        address disputeFeeWinnerAddress;
        
        //Ensure this has not already been executed/tallied
        require(!disp.executed, "This has already been executed");

        //Ensure the time for voting has elapsed
        require(block.timestamp > disp.disputeUintVars[keccak256('minExecutionDate')], "Cannot vote at this time.");

        //If the vote is not a proposed fork
        if (disp.forkedContract == 0) {
            ZapStorage.StakeInfo storage stakes = self.stakerDetails[disp.reportedMiner];
            // instead of percentage, find the multiple of this dispute voters compared to numbe rof staked users
            uint quorum = (self.uintVars[keccak256("stakerCount")] - 2) / disp.disputeUintVars[keccak256('numberOfVotes')];
            //If the vote for disputing a value is succesful(disp.tally >0) then unstake the reported
            // miner and transfer the stakeAmount and dispute fee to the reporting party
            // the 2nd conditional will check if the amount of voters for this dispute is gte 10% of staked users
            if (disp.tally > 0 && quorum <= 10) {
                //Changing the currentStatus and startDate unstakes the reported miner and allows for the
                //transfer of the stakeAmount

                // keep status at in dispute
                // stakes.currentStatus = 0;
                stakes.startDate = block.timestamp - (block.timestamp % 86400);

                //Decreases the stakerCount since the miner's stake is being slashed
                self.uintVars[keccak256('stakerCount')]--;
                updateDisputeFee(self);
                
                //Set the dispute state to passed/true
                disp.disputeVotePassed = true;

                //If the dispute was succeful(miner found guilty) then update the timestamp value to zero
                //so that users don't use this datapoint
                if (
                    _request.inDispute[
                        disp.disputeUintVars[keccak256('timestamp')]
                    ]
                ) {
                    _request.finalValues[
                        disp.disputeUintVars[keccak256('timestamp')]
                    ] = 0;
                }
                

                disputeFeeWinnerAddress = disp.reportingParty;

                // return (address(this), disp.reportingParty, disputeFeeForDisputeId);

                //If the vote for disputing a value is unsuccesful then update the miner status from being on
                //dispute(currentStatus=3) to staked(currentStatus =1) and tranfer the dispute fee to the miner
            } else {
                //Update the miner's current status to staked(currentStatus = 1)
                stakes.currentStatus = 1;

                if (
                    _request.inDispute[
                        disp.disputeUintVars[keccak256('timestamp')]
                    ]
                ) {
                    _request.inDispute[
                        disp.disputeUintVars[keccak256('timestamp')]
                    ] = false;
                }
                
                disputeFeeWinnerAddress = disp.reportedMiner;

                // return (address(this), disp.reportedMiner, disputeFeeForDisputeId);

            }
            //If the vote is for a proposed fork require 35% quorum before executing the update to the new zap contract address
        } else {
            if (disp.tally > 0) {
                require(
                    disp.disputeUintVars[keccak256('quorum')] >
                        ((self.uintVars[keccak256('total_supply')] * 35) / 100)
                );

                if (disp.forkedContract == 1) { // 1 == ZapContract
                    self.addressVars[keccak256('zapContract')] = disp.proposedForkAddress;
                }
                
                disp.disputeVotePassed = true;
                emit NewZapAddress(disp.proposedForkAddress);
            }
        }

        //update the dispute status to executed
        disp.executed = true;
        emit DisputeVoteTallied(
            _disputeId,
            disp.tally,
            disp.reportedMiner,
            disp.reportingParty,
            disp.disputeVotePassed
        );
        return (address(this), disputeFeeWinnerAddress, disputeFeeForDisputeId);
    }

    // /**
    //  * @dev Allows for a fork to be proposed
    //  * @param _propNewZapAddress address for new proposed Zap
    //  */
    // function proposeFork(
    //     ZapStorage.ZapStorageStruct storage self,
    //     address _propNewZapAddress,
    //     uint256 forkedContract
    // ) public {
    //     bytes32 _hash = keccak256(abi.encodePacked(_propNewZapAddress));
    //     require(self.disputeIdByDisputeHash[_hash] == 0,"Dispute Hash is not equal to zero");

    //     self.uintVars[keccak256('disputeCount')]++;
    //     uint256 disputeId = self.uintVars[keccak256('disputeCount')];
    //     self.disputeIdByDisputeHash[_hash] = disputeId;
    //     ZapStorage.Dispute storage newDispute = ZapStorage.Dispute();
    //     newDispute = ZapStorage.Dispute({
    //         hash: _hash,
    //         forkedContract: forkedContract,
    //         reportedMiner: msg.sender,
    //         reportingParty: msg.sender,
    //         proposedForkAddress: _propNewZapAddress,
    //         executed: false,
    //         disputeVotePassed: false,
    //         tally: 0
    //     });
    //     self.disputesById[disputeId].disputeUintVars[
    //         keccak256('blockNumber')
    //     ] = block.number;
    //     self.disputesById[disputeId].disputeUintVars[keccak256('fee')] = self
    //     .uintVars[keccak256('disputeFee')];
    //     self.disputesById[disputeId].disputeUintVars[
    //         keccak256('minExecutionDate')
    //     ] = now + 7 days;

    //     emit NewForkProposal(
    //         disputeId,
    //         now,
    //         _propNewZapAddress
    //     );
    // }

    /**
     * @dev this function allows the dispute fee to fluctuate based on the number of miners on the system.
     * The floor for the fee is 15.
     */
    function updateDisputeFee(ZapStorage.ZapStorageStruct storage self) public {
        //if the number of staked miners divided by the target count of staked miners is less than 1
        if (
            (self.uintVars[keccak256('stakerCount')] * 1000) /
                self.uintVars[keccak256('targetMiners')] <
            1000
        ) {
            //Set the dispute fee at stakeAmt * (1- stakerCount/targetMiners)
            //or at the its minimum of 15
            self.uintVars[keccak256('disputeFee')] = SafeMathM.max(
                15,
                self.uintVars[keccak256('stakeAmount')].mul(
                    1000 -
                        (self.uintVars[keccak256('stakerCount')] * 1000) /
                        self.uintVars[keccak256('targetMiners')]
                ) / 1000
            );
        } else {
            //otherwise set the dispute fee at 15 (the floor/minimum fee allowed)
            self.uintVars[keccak256('disputeFee')] = 15;
        }
    }
}


// File contracts/zap-miner/libraries/ZapStake.sol

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;


// import "hardhat/console.sol";

/**
* @title Zap Dispute
* @dev Contais the methods related to miners staking and unstaking. Zap.sol 
* references this library for function's logic.
*/

library ZapStake {
    event NewStake(address indexed _sender);//Emits upon new staker
    event StakeWithdrawn(address indexed _sender);//Emits when a staker is now no longer staked
    event StakeWithdrawRequested(address indexed _sender);//Emits when a staker begins the 7 day withdraw period

    /*Functions*/
    
    /**
    * @dev This function stakes the five initial miners, sets the supply and all the constant variables.
    * This function is called by the constructor function on ZapMaster.sol
    */
    function init(ZapStorage.ZapStorageStruct storage self) public{
        require(self.uintVars[keccak256("decimals")] == 0, "Already initialized");
        
        //set Constants
        self.uintVars[keccak256("decimals")] = 18;
        self.uintVars[keccak256("targetMiners")] = 200;
        self.uintVars[keccak256("stakeAmount")] = 500000 * 1e18;
        self.uintVars[keccak256("disputeFee")] = 970 * 1e18;
        self.uintVars[keccak256("timeTarget")]= 600;
        self.uintVars[keccak256("timeOfLastNewValue")] = block.timestamp - block.timestamp  % self.uintVars[keccak256("timeTarget")];
        self.uintVars[keccak256("difficulty")] = 1;
    }


    /**
    * @dev This function allows stakers to request to withdraw their stake (no longer stake)
    * once they lock for withdraw(stakes.currentStatus = 2) they are locked for 7 days before they
    * can withdraw the deposit
    */
    function requestStakingWithdraw(ZapStorage.ZapStorageStruct storage self) public {
        ZapStorage.StakeInfo storage stakes = self.stakerDetails[msg.sender];
        //Require that the miner is staked
        require(stakes.currentStatus == 1, "Miner is not staked");

        //Change the miner staked to locked to be withdrawStake
        stakes.currentStatus = 2;

        //Change the startDate to now since the lock up period begins now
        //and the miner can only withdraw 7 days later from now(check the withdraw function)
        stakes.startDate = block.timestamp -(block.timestamp % 86400);

        //Reduce the staker count
        self.uintVars[keccak256("stakerCount")] -= 1;
        ZapDispute.updateDisputeFee(self);
        emit StakeWithdrawRequested(msg.sender);
    }

    /**
    * @dev This function allows users to withdraw their stake after a 7 day waiting period from request 
    */
    function withdrawStake(ZapStorage.ZapStorageStruct storage self) public {
        ZapStorage.StakeInfo storage stakes = self.stakerDetails[msg.sender];
        //Require the staker has locked for withdraw(currentStatus ==2) and that 7 days have 
        //passed by since they locked for withdraw
        require(block.timestamp - (block.timestamp % 86400) - stakes.startDate >= 7 days, "Can't withdraw yet. Need to wait at LEAST 7 days from stake start date.");
        require(stakes.currentStatus == 2, "Required to request withdraw of stake");
        stakes.currentStatus = 0;

        emit StakeWithdrawn(msg.sender);
    }

    /**
    * @dev This function allows miners to deposit their stake.
    */
    function depositStake(ZapStorage.ZapStorageStruct storage self) public {
      newStake(self, msg.sender);
      //self adjusting disputeFee
      ZapDispute.updateDisputeFee(self);
    }

    /**
    * @dev This function is used by the init function to succesfully stake the initial 5 miners.
    * The function updates their status/state and status start date so they are locked it so they can't withdraw
    * and updates the number of stakers in the system.
    */
    function newStake(ZapStorage.ZapStorageStruct storage self, address staker) internal {

        //Ensure they can only stake if they are not currrently staked 
        require(self.stakerDetails[staker].currentStatus == 0, "ZapStake: Staker is already staked");
        self.uintVars[keccak256("stakerCount")] += 1;
        self.stakerDetails[staker] = ZapStorage.StakeInfo({
            currentStatus: 1,
            //this resets their stake start date to today
            startDate: block.timestamp - (block.timestamp % 86400)
        });

        emit NewStake(staker);
    }

    /**
    * @dev Getter function for the requestId being mined 
    * @return _challenge _requestIds _difficuilty _tip : variables for the current mining event: Challenge, 5 RequestId, difficulty and Totaltips
    */
    function getNewCurrentVariables(ZapStorage.ZapStorageStruct storage self) internal view returns(bytes32 _challenge,uint[5] memory _requestIds,uint256 _difficulty, uint256 _tip){
        for(uint i=0;i<5;i++){
            _requestIds[i] =  self.currentMiners[i].value;
        }
        return (self.currentChallenge,_requestIds,self.uintVars[keccak256("difficulty")],self.uintVars[keccak256("currentTotalTips")]);
    }
}


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v4.3.2

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}


// File contracts/zap-miner/ZapGetters.sol

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;





/**
 * @title Zap Getters
 * @dev Oracle contract with all zap getter functions. The logic for the functions on this contract
 * is saved on the ZapGettersLibrary, ZapGettersLibrary, and ZapStake
 */
contract ZapGetters {
    using SafeMathM for uint256;
    using ZapGettersLibrary for ZapStorage.ZapStorageStruct;
    using ZapStake for ZapStorage.ZapStorageStruct;

    ZapStorage.ZapStorageStruct internal zap;
    IERC20 internal token;

    constructor(address zapTokenBsc) {
        token = IERC20(zapTokenBsc);
        zap.addressVars[keccak256('zapTokenContract')] = zapTokenBsc;
    }

    /**
     * @param _user address
     * @param _spender address
     * @return Returns the remaining allowance of tokens granted to the _spender from the _user
     */
    function allowance(address _user, address _spender)
        public
        view
        returns (uint256)
    {
        //    return zap.allowance(_user,_spender);
        return token.allowance(_user, _spender);
    }

    /**
     * @dev Gets balance of owner specified
     * @param _user is the owner address used to look up the balance
     * @return Returns the balance associated with the passed in _user
     */
    function balanceOf(address _user) public view returns (uint256) {
        // return zap.balanceOf(_user);
        return token.balanceOf(_user);
    }

    /**
     * @dev Queries the balance of _user at a specific _blockNumber
     * @param _user The address from which the balance will be retrieved
     * @param _blockNumber The block number when the balance is queried
     * @return The balance at _blockNumber
     */
    // function balanceOfAt(address _user, uint _blockNumber) external view returns (uint) {
    //     return zap.balanceOfAt(_user,_blockNumber);
    // }

    /**
     * @dev This function tells you if a given challenge has been completed by a given miner
     * @param _challenge the challenge to search for
     * @param _miner address that you want to know if they solved the challenge
     * @return true if the _miner address provided solved the
     */
    function didMine(bytes32 _challenge, address _miner)
        external
        view
        returns (bool)
    {
        return zap.didMine(_challenge, _miner);
    }

    /**
     * @dev Checks if an address voted in a given dispute
     * @param _disputeId to look up
     * @param _address to look up
     * @return bool of whether or not party voted
     */
    function didVote(uint256 _disputeId, address _address)
        external
        view
        returns (bool)
    {
        return zap.didVote(_disputeId, _address);
    }

    /**
     * @dev allows Zap to read data from the addressVars mapping
     * @param _data is the keccak256("variable_name") of the variable that is being accessed.
     * These are examples of how the variables are saved within other functions:
     * addressVars[keccak256("_owner")]
     * addressVars[keccak256("zapContract")]
     */
    function getAddressVars(bytes32 _data) external view returns (address) {
        return zap.getAddressVars(_data);
    }

    // /**
    //  * @dev Gets all dispute variables
    //  * @param _disputeId to look up
    //  * @return bytes32 hash of dispute
    //  * @return bool executed where true if it has been voted on
    //  * @return bool disputeVotePassed
    //  * @return address of reportedMiner
    //  * @return address of reportingParty
    //  * @return address of proposedForkAddress
    //  * @return uint of forkedContract
    //  * @return uint of requestId
    //  * @return uint of timestamp
    //  * @return uint of value
    //  * @return uint of minExecutionDate
    //  * @return uint of numberOfVotes
    //  * @return uint of blocknumber
    //  * @return uint of minerSlot
    //  * @return uint of quorum
    //  * @return uint of fee
    //  * @return int count of the current tally
    //  */
    function getAllDisputeVars(uint256 _disputeId)
        public
        view
        returns (
            bytes32,
            bool,
            bool,
            address,
            address,
            address,
            uint256,
            uint256[9] memory,
            int256
        )
    {
        return zap.getAllDisputeVars(_disputeId);
    }

    /**
     * @dev Getter function for variables for the requestId being currently mined(currentRequestId)
     * @return current challenge, curretnRequestId, level of difficulty, api/query string, and granularity(number of decimals requested), total tip for the request
     */
    function getCurrentVariables()
        external
        view
        returns (
            bytes32,
            uint256,
            uint256,
            string memory,
            uint256,
            uint256
        )
    {
        return zap.getCurrentVariables();
    }

    /**
     * @dev Checks if a given hash of miner,requestId has been disputed
     * @param _hash is the sha256(abi.encodePacked(_miners[2],_requestId));
     * @return uint disputeId
     */
    function getDisputeIdByDisputeHash(bytes32 _hash)
        external
        view
        returns (uint256)
    {
        return zap.getDisputeIdByDisputeHash(_hash);
    }

    /**
     * @dev Checks for uint variables in the disputeUintVars mapping based on the disuputeId
     * @param _disputeId is the dispute id;
     * @param _data the variable to pull from the mapping. _data = keccak256("variable_name") where variable_name is
     * the variables/strings used to save the data in the mapping. The variables names are
     * commented out under the disputeUintVars under the Dispute struct
     * @return uint value for the bytes32 data submitted
     */
    function getDisputeUintVars(uint256 _disputeId, bytes32 _data)
        external
        view
        returns (uint256)
    {
        return zap.getDisputeUintVars(_disputeId, _data);
    }

    /**
     * @dev Gets the a value for the latest timestamp available
     * @return value for timestamp of last proof of work submited
     * @return true if the is a timestamp for the lastNewValue
     */
    function getLastNewValue() external view returns (uint256, bool) {
        return zap.getLastNewValue();
    }

    /**
     * @dev Gets the a value for the latest timestamp available
     * @param _requestId being requested
     * @return value for timestamp of last proof of work submited and if true if it exist or 0 and false if it doesn't
     */
    function getLastNewValueById(uint256 _requestId)
        external
        view
        returns (uint256, bool)
    {
        return zap.getLastNewValueById(_requestId);
    }

    /**
     * @dev Gets blocknumber for mined timestamp
     * @param _requestId to look up
     * @param _timestamp is the timestamp to look up blocknumber
     * @return uint of the blocknumber which the dispute was mined
     */
    function getMinedBlockNum(uint256 _requestId, uint256 _timestamp)
        external
        view
        returns (uint256)
    {
        return zap.getMinedBlockNum(_requestId, _timestamp);
    }

    /**
     * @dev Gets the 5 miners who mined the value for the specified requestId/_timestamp
     * @param _requestId to look up
     * @param _timestamp is the timestamp to look up miners for
     * @return the 5 miners' addresses
     */
    function getMinersByRequestIdAndTimestamp(
        uint256 _requestId,
        uint256 _timestamp
    ) external view returns (address[5] memory) {
        return zap.getMinersByRequestIdAndTimestamp(_requestId, _timestamp);
    }

    /**
     * @dev Counts the number of values that have been submited for the request
     * if called for the currentRequest being mined it can tell you how many miners have submitted a value for that
     * request so far
     * @param _requestId the requestId to look up
     * @return uint count of the number of values received for the requestId
     */
    function getNewValueCountbyRequestId(uint256 _requestId)
        external
        view
        returns (uint256)
    {
        return zap.getNewValueCountbyRequestId(_requestId);
    }

    /**
     * @dev Getter function for the specified requestQ index
     * @param _index to look up in the requestQ array
     * @return uint of reqeuestId
     */
    function getRequestIdByRequestQIndex(uint256 _index)
        external
        view
        returns (uint256)
    {
        return zap.getRequestIdByRequestQIndex(_index);
    }

    /**
     * @dev Getter function for requestId based on timestamp
     * @param _timestamp to check requestId
     * @return uint of reqeuestId
     */
    function getRequestIdByTimestamp(uint256 _timestamp)
        external
        view
        returns (uint256)
    {
        return zap.getRequestIdByTimestamp(_timestamp);
    }

    /**
     * @dev Getter function for requestId based on the queryHash
     * @param _request is the hash(of string api and granularity) to check if a request already exists
     * @return uint requestId
     */
    function getRequestIdByQueryHash(bytes32 _request)
        external
        view
        returns (uint256)
    {
        return zap.getRequestIdByQueryHash(_request);
    }

    /**
     * @dev Getter function for the requestQ array
     * @return the requestQ arrray
     */
    function getRequestQ() public view returns (uint256[51] memory) {
        return zap.getRequestQ();
    }

    /**
     * @dev Allowes access to the uint variables saved in the apiUintVars under the requestDetails struct
     * for the requestId specified
     * @param _requestId to look up
     * @param _data the variable to pull from the mapping. _data = keccak256("variable_name") where variable_name is
     * the variables/strings used to save the data in the mapping. The variables names are
     * commented out under the apiUintVars under the requestDetails struct
     * @return uint value of the apiUintVars specified in _data for the requestId specified
     */
    function getRequestUintVars(uint256 _requestId, bytes32 _data)
        external
        view
        returns (uint256)
    {
        return zap.getRequestUintVars(_requestId, _data);
    }

    /**
     * @dev Gets the API struct variables that are not mappings
     * @param _requestId to look up
     * @return string of api to query
     * @return string of symbol of api to query
     * @return bytes32 hash of string
     * @return bytes32 of the granularity(decimal places) requested
     * @return uint of index in requestQ array
     * @return uint of current payout/tip for this requestId
     */
    function getRequestVars(uint256 _requestId)
        external
        view
        returns (
            string memory,
            string memory,
            bytes32,
            uint256,
            uint256,
            uint256
        )
    {
        return zap.getRequestVars(_requestId);
    }

    /**
     * @dev This function allows users to retireve all information about a staker
     * @param _staker address of staker inquiring about
     * @return uint current state of staker
     * @return uint startDate of staking
     */
    function getStakerInfo(address _staker)
        external
        view
        returns (uint256, uint256)
    {
        return zap.getStakerInfo(_staker);
    }

    /**
     * @dev Gets the 5 miners who mined the value for the specified requestId/_timestamp
     * @param _requestId to look up
     * @param _timestamp is the timestampt to look up miners for
     * @return address[5] array of 5 addresses ofminers that mined the requestId
     */
    function getSubmissionsByTimestamp(uint256 _requestId, uint256 _timestamp)
        external
        view
        returns (uint256[5] memory)
    {
        return zap.getSubmissionsByTimestamp(_requestId, _timestamp);
    }

    /**
     * @dev Gets the timestamp for the value based on their index
     * @param _requestID is the requestId to look up
     * @param _index is the value index to look up
     * @return uint timestamp
     */
    function getTimestampbyRequestIDandIndex(uint256 _requestID, uint256 _index)
        external
        view
        returns (uint256)
    {
        return zap.getTimestampbyRequestIDandIndex(_requestID, _index);
    }

    /**
     * @dev Getter for the variables saved under the ZapStorageStruct uintVars variable
     * @param _data the variable to pull from the mapping. _data = keccak256("variable_name") where variable_name is
     * the variables/strings used to save the data in the mapping. The variables names are
     * commented out under the uintVars under the ZapStorageStruct struct
     * This is an example of how data is saved into the mapping within other functions:
     * self.uintVars[keccak256("stakerCount")]
     * @return uint of specified variable
     */
    function getUintVar(bytes32 _data) public view returns (uint256) {
        return zap.getUintVar(_data);
    }

    /**
     * @dev Getter function for next requestId on queue/request with highest payout at time the function is called
     * @return onDeck/info on request with highest payout-- RequestId, Totaltips, and API query string
     */
    function getVariablesOnDeck()
        external
        view
        returns (
            uint256,
            uint256,
            string memory
        )
    {
        return zap.getVariablesOnDeck();
    }

    /**
     * @dev Gets the 5 miners who mined the value for the specified requestId/_timestamp
     * @param _requestId to look up
     * @param _timestamp is the timestamp to look up miners for
     * @return bool true if requestId/timestamp is under dispute
     */
    function isInDispute(uint256 _requestId, uint256 _timestamp)
        external
        view
        returns (bool)
    {
        return zap.isInDispute(_requestId, _timestamp);
    }

    /**
     * @dev Retreive value from oracle based on timestamp
     * @param _requestId being requested
     * @param _timestamp to retreive data/value from
     * @return value for timestamp submitted
     */
    function retrieveData(uint256 _requestId, uint256 _timestamp)
        external
        view
        returns (uint256)
    {
        return zap.retrieveData(_requestId, _timestamp);
    }

    /**
     * @dev Getter for the total_supply of oracle tokens
     * @return uint total supply
     */
    function totalTokenSupply() external view returns (uint256) {
        return zap.totalSupply();
        // return token.totalSupply;
    }
}


// File contracts/zap-miner/libraries/Address.sol

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        (bool success, ) = recipient.call{value:amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCall(target, data, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");

        (bool success, bytes memory returndata) = target.call{value:value}(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");

        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Tool to verifies that a low level call was successful, and revert if it wasn't, either by bubbling the
     * revert reason using the provided one.
     *
     * _Available since v4.3._
     */
    function verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal pure returns (bytes memory) {
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}


// File contracts/zap-miner/ZapMaster.sol

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;


/**
 * @title Zap Master
 * @dev This is the Master contract with all zap getter functions and delegate call to Zap.
 * The logic for the functions on this contract is saved on the ZapGettersLibrary,
 * ZapGettersLibrary, and ZapStake
 */
contract ZapMaster is ZapGetters {
    event NewZapAddress(address _newZap);
    event Received(address, uint);

    using Address for address;

    address public owner;
    bool private vaultLock;

    /// @dev Throws if called by any contract other than latest designated caller
    modifier onlyOwner() {
        require(msg.sender == owner, 'Only owner can transfer balance.');
        _;
    }

    /**
     * @dev The constructor sets the original `zapStorageOwner` of the contract to the sender
     * account, the zap contract to the Zap master address and owner to the Zap master owner address.
     * If there are no predecessors or no storage transfer is wanted, pass in the zero address.
     * @param _zapContract is the address for the zap contract
     * @param tokenAddress is the address for the ZAP token contract
     */
    constructor(address _zapContract, address tokenAddress)
        public
        ZapGetters(tokenAddress)
    {
        zap.init();
        zap.addressVars[keccak256('_owner')] = msg.sender;
        zap.addressVars[keccak256('_deity')] = msg.sender;
        zap.addressVars[keccak256('zapContract')] = _zapContract;

        owner = msg.sender;

        emit NewZapAddress(_zapContract);
    }

    /**
     * @dev Gets the 5 miners who mined the value for the specified requestId/_timestamp
     * @dev Only needs to be in library
     * @param _newDeity the new Deity in the contract
     */
    function changeDeity(address _newDeity) external onlyOwner {
        zap.changeDeity(_newDeity);
    }

    /**
     * @dev  allows for the deity to make fast upgrades.  Deity should be 0 address if decentralized
     * @param _vaultContract the address of the new Vault Contract
     */
    function changeVaultContract(address _vaultContract) external onlyOwner {
        require(!vaultLock);
        vaultLock = true;
        zap.changeVaultContract(_vaultContract);
    }

    /**
     * @dev This is the fallback function that allows contracts to call the zap contract at the address stored
     */
    fallback() external payable {
        address addr = zap.addressVars[keccak256('zapContract')];
        bytes memory _calldata = msg.data;
        assembly {
            let result := delegatecall(
                gas(),
                addr,
                add(_calldata, 0x20),
                mload(_calldata),
                0,
                0
            )
            let size := returndatasize()
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)
            // revert instead of invalid() bc if the underlying call failed with invalid() it already wasted gas.
            // if the call returned error data, forward it
            switch result
            case 0 {
                revert(ptr, size)
            }
            default {
                return(ptr, size)
            }
        }
    }

    /**
     * Receive function for incoming ethers
     */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
