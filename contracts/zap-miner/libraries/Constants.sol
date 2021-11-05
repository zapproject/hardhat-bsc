// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.5.16;

library Constants{
        
        bytes32 public constant DEITY_HASH =keccak256("_deity");
        function getDeityHash() public pure returns(bytes32){return DEITY_HASH;}
        bytes32 public constant ZAP_CONTRACT_HASH = keccak256('zapContract');
        function getZapContractHash() public pure returns(bytes32){return ZAP_CONTRACT_HASH;}
        bytes32 public constant OWNER_HASH = keccak256('_owner');
        function getOwnerHash() public pure returns(bytes32){return OWNER_HASH;}
        bytes32 public constant VAULT_HASH = keccak256('_vault');
        function getVaultHash() public pure returns(bytes32){return VAULT_HASH;}
        bytes32 public constant REQUEST_ID_HASH = keccak256('requestId');
        function getRequestIdHash() public pure returns(bytes32){return REQUEST_ID_HASH;}
        bytes32 public constant TIMESTAMP_HASH= keccak256('timestamp');
        function getTimestampHash() public pure returns(bytes32){return TIMESTAMP_HASH;}
        bytes32 public constant VALUE_HASH= keccak256('value');
        function getValueHash() public pure returns(bytes32){return VAULT_HASH;}
        bytes32 public constant MINEXECUTIONDATE_HASH= keccak256('minExecutionDate');
        function getMinExecutionDateHash() public pure returns(bytes32){return MINEXECUTIONDATE_HASH;}
        bytes32 public constant NUMVOTES_HASH= keccak256('numberOfVotes');
        function getNumVotesHash() public pure returns(bytes32){return NUMVOTES_HASH;}
        bytes32 public constant BLOCKNUM_HASH= keccak256('blockNumber');
        function getBlockNumHash() public pure returns(bytes32){return BLOCKNUM_HASH;}
        bytes32 public constant MINERSLOT_HASH= keccak256('minerSlot');
        function getMinerSlotHash() public pure returns(bytes32){return MINERSLOT_HASH;}
        bytes32 public constant QUORUM_HASH= keccak256('quorum');
        function getQuorumHash() public pure returns(bytes32){return QUORUM_HASH;}
        bytes32 public constant FEE_HASH= keccak256('fee');
        function getFeeHash() public pure returns(bytes32){return FEE_HASH;}
        bytes32 public constant CURRENT_REQUEST_ID_HASH = keccak256('currentRequestId');
        function getCurrentRequestIdHash() public pure returns(bytes32){return CURRENT_REQUEST_ID_HASH;}
        bytes32 public constant DIFFICULTY_HASH = keccak256('difficulty');
        function getDifficultyHash() public pure returns(bytes32){return DIFFICULTY_HASH;}
        bytes32 public constant GRANULARITY_HASH = keccak256('granularity');
        function getGranularityHash() public pure returns(bytes32){return GRANULARITY_HASH;}
        bytes32 public constant TOTAL_TIP_HASH= keccak256('totalTip');
        function getTotalTipHash() public pure returns(bytes32){return TOTAL_TIP_HASH;}
        bytes32 public constant REQUEST_QPOSITION_HASH = keccak256('requestQPosition');
        function getRequestQPositionHash() public pure returns(bytes32){return REQUEST_QPOSITION_HASH;}
        bytes32 public constant TIME_LAST_VALUE_HASH = keccak256('timeOfLastNewValue');
        function getTimeLastValueHash() public pure returns(bytes32){return TIME_LAST_VALUE_HASH;}
        bytes32 public constant TOTAL_SUPPLY_HASH = keccak256('total_supply');
        function getTotalSupplyHash() public pure returns(bytes32){return TOTAL_SUPPLY_HASH;}

            

}