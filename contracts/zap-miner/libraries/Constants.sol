// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.5.16;

library Constants{

        bytes32 public constant DEITY_HASH =keccak256("_deity");
        bytes32 public constant ZAP_CONTRACT_HASH = keccak256('zapContract');
        bytes32 public constant OWNER_HASH = keccak256('_owner');
        bytes32 public constant VAULT_HASH = keccak256('_vault');
        bytes32 public constant REQUEST_ID_HASH = keccak256('requestId');
        bytes32 public constant TIMESTAMP_HASH= keccak256('timestamp');
        bytes32 public constant VALUE_HASH= keccak256('value');
        bytes32 public constant MINEXECUTIONDATE_HASH= keccak256('minExecutionDate');
        bytes32 public constant NUMVOTES_HASH= keccak256('numberOfVotes');
        bytes32 public constant BLOCKNUM_HASH= keccak256('blockNumber');
        bytes32 public constant MINERSLOT_HASH= keccak256('minerSlot');
        bytes32 public constant QUORUM_HASH= keccak256('quorum');
        bytes32 public constant FEE_HASH= keccak256('fee');
        bytes32 public constant CURRENT_REQUEST_ID_HASH = keccak256('currentRequestId');
        bytes32 public constant DIFFICULTY_HASH = keccak256('difficulty');
        bytes32 public constant GRANULARITY_HASH = keccak256('granularity');
        bytes32 public constant TOTAL_TIP_HASH= [keccak256('totalTip');

            

}