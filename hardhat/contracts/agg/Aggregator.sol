// SPDX-License-Identifier: MIT
// solhint-disable-next-line compiler-version
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "./ZapApi.sol";

interface Oracle {
    function getUintVar(bytes32 _data) external view returns (uint256);

    function getNewValueCountbyRequestId(uint256 _requestId)
        external
        view
        returns (uint256);

    function getTimestampbyRequestIDandIndex(uint256 _requestID, uint256 _index)
        external
        view
        returns (uint256);

    function retrieveData(uint256 _requestId, uint256 _timestamp)
        external
        view
        returns (uint256);

    function getAddressVars(bytes32 _data) external view returns (address);

    function getRequestUintVars(uint256 _requestId, bytes32 _data)
        external
        view
        returns (uint256);
}

/**
 * @title ZapMiner Aggregator main contract
 * @dev Aggregate and simplify calls to the ZapMiner oracle.
 **/
contract Aggregator is ZapApi {
    Oracle public oracle;

    struct DataID {
        uint256 id;
        string name;
        uint256 granularity;
    }

    struct Value {
        DataID meta;
        uint256 timestamp;
        uint256 value;
        uint256 tip;
    }

    address private admin;

    DataID[] public dataIDs;
    mapping(uint256 => uint256) public dataIDsMap;

    constructor(address payable _oracle) ZapApi(_oracle) {
        oracle = Oracle(_oracle);
        admin = msg.sender;
    }

    modifier onlyAdmin {
        require(msg.sender == admin, "not an admin");
        _;
    }

    function destroy() external onlyAdmin {
        address payable owner = address(uint160(admin));
        selfdestruct(owner);
    }

    function setOracle(address _oracle) external onlyAdmin {
        oracle = Oracle(_oracle);
    }

    function setAdmin(address _admin) external onlyAdmin {
        admin = _admin;
    }

    function replaceDataIDs(DataID[] memory _dataIDs) external onlyAdmin {
        delete dataIDs;
        for (uint256 i = 0; i < _dataIDs.length; i++) {
            dataIDs.push(_dataIDs[i]);
            dataIDsMap[_dataIDs[i].id] = i;
        }
    }

    function setDataID(uint256 _id, DataID memory _dataID) external onlyAdmin {
        dataIDs[_id] = _dataID;
        dataIDsMap[_dataID.id] = _id;
    }

    function pushDataID(DataID memory _dataID) external onlyAdmin {
        dataIDs.push(_dataID);
        dataIDsMap[_dataID.id] = dataIDs.length - 1;
    }

    function dataIDsAll() external view returns (DataID[] memory) {
        return dataIDs;
    }

    /**
     * @return Returns the current reward amount.
     */
    function currentReward() external view returns (uint256) {
        uint256 timeDiff =
            block.timestamp -
                oracle.getUintVar(keccak256("timeOfLastNewValue"));
        uint256 rewardAmount = 1e18;

        uint256 rewardAccumulated = (timeDiff * rewardAmount) / 300; // 1TRB every 6 minutes.

        uint256 tip = oracle.getUintVar(keccak256("currentTotalTips")) / 10; // Half of the tips are burnt.
        return rewardAccumulated + tip;
    }

    // function getValuesFromPair(string memory dataSymbol) public view returns(Value[] memory) {
    //     Value[] memory returnedValues = new Value[];
    //     uint256 numberOfReturnedValues = 0;

    //     for (uint256 index = 0; index < dataIDs.length; index++) {
    //         Value[] memory v = getLastValues(dataIDs[index].id, 1);
    //         if (v[0].meta.name == dataSymbol){
    //             returnedValues[numberOfReturnedValues] = v[0];
    //             numberOfReturnedValues++;
    //         }
    //     }

    //     return returnedValues;
    // }

    /**
     * @param _dataID is the ID for which the function returns the values for. When dataID is negative it returns the values for all dataIDs.
     * @param _count is the number of last values to return.
     * @return Returns the last N values for a request ID.
     */
    function getLastValues(uint256 _dataID, uint256 _count)
        public
        view
        returns (Value[] memory)
    {
        uint256 totalCount = oracle.getNewValueCountbyRequestId(_dataID);
        if (_count > totalCount) {
            _count = totalCount;
        }
        Value[] memory values = new Value[](_count);
        for (uint256 i = 0; i < _count; i++) {
            uint256 ts =
                oracle.getTimestampbyRequestIDandIndex(
                    _dataID,
                    totalCount - i - 1
                );
            uint256 v = oracle.retrieveData(_dataID, ts);
            values[i] = Value({
                meta: DataID({
                    id: _dataID,
                    name: dataIDs[dataIDsMap[_dataID]].name,
                    granularity: dataIDs[dataIDsMap[_dataID]].granularity
                }),
                timestamp: ts,
                value: v,
                tip: totalTip(_dataID)
            });
        }

        return values;
    }

    /**
     * @param count is the number of last values to return.
     * @return Returns the last N values for a data IDs.
     */
    function getLastValuesAll(uint256 count)
        external
        view
        returns (Value[] memory)
    {
        Value[] memory values = new Value[](count * dataIDs.length);
        uint256 pos = 0;
        for (uint256 i = 0; i < dataIDs.length; i++) {
            Value[] memory v = getLastValues(dataIDs[i].id, count);
            for (uint256 ii = 0; ii < v.length; ii++) {
                values[pos] = v[ii];
                pos++;
            }
        }
        return values;
    }

    /**
     * @return Returns the contract deity that can do things at will.
     */
    function deity() external view returns (address) {
        return oracle.getAddressVars(keccak256("_deity"));
    }

    /**
     * @return Returns the contract owner address.
     */
    function owner() external view returns (address) {
        return oracle.getAddressVars(keccak256("_owner"));
    }

    /**
     * @return Returns the contract address that executes all proxy calls.
     */
    function zapminerContract() external view returns (address) {
        return oracle.getAddressVars(keccak256("zapContract"));
    }

    /**
     * @param _dataID is the ID for which the function returns the total tips.
     * @return Returns the current tips for a give request ID.
     */
    function totalTip(uint256 _dataID) public view returns (uint256) {
        return oracle.getRequestUintVars(_dataID, keccak256("totalTip"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the last time when a value was submitted.
     */
    function timeOfLastValue() external view returns (uint256) {
        return oracle.getUintVar(keccak256("timeOfLastNewValue"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the total number of requests from user thorugh the addTip function.
     */
    function requestCount() external view returns (uint256) {
        return oracle.getUintVar(keccak256("requestCount"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the current block difficulty.
     *
     */
    function difficulty() external view returns (uint256) {
        return oracle.getUintVar(keccak256("difficulty"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable is used to calculate the block difficulty based on
     * the time diff since the last oracle block.
     */
    function timeTarget() external view returns (uint256) {
        return oracle.getUintVar(keccak256("timeTarget"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the highest api/timestamp PayoutPool.
     */
    function currentTotalTips() external view returns (uint256) {
        return oracle.getUintVar(keccak256("currentTotalTips"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the number of miners who have mined this value so far.
     */
    function slotProgress() external view returns (uint256) {
        return oracle.getUintVar(keccak256("slotProgress"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the cost to dispute a mined value.
     */
    function disputeFee() external view returns (uint256) {
        return oracle.getUintVar(keccak256("disputeFee"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     */
    function disputeCount() external view returns (uint256) {
        return oracle.getUintVar(keccak256("disputeCount"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks stake amount required to become a miner.
     */
    function stakeAmount() external view returns (uint256) {
        return oracle.getUintVar(keccak256("stakeAmount"));
    }

    /**
     * @return Returns the getUintVar variable named after the function name.
     * This variable tracks the number of parties currently staked.
     */
    function stakeCount() external view returns (uint256) {
        return oracle.getUintVar(keccak256("stakerCount"));
    }
}
