// SPDX-License-Identifier: GPL-3.0

pragma solidity =0.5.16;

library ZapConstants { 
    // Constants

    /*
     * Addresses
     */
    bytes32 constant zapContract      = 0x710052ea0d12b2397f41c761f87b3558ef80d996883cf1def28dfbcfc4778023;

    bytes32 constant zapTokenContract = 0x0dbd11667cb3ff39667584f924913ce4dcfc6917743490eff0a0ac17f29b151e;

    bytes32 constant _owner           = 0x9dbc393ddc18fd27b1d9b1b129059925688d2f2d5818a5ec3ebb750b7c286ea6;

    bytes32 constant _deity           = 0xc72fb71df90ec89e61e8dea6fee5142880a8a329caaae9ff4931955d88f59990;

    bytes32 constant _vault           = 0x973059b1f52a2bdab7ecb9e4cd36d6cb999848b14684091a5057353deb173ed7;

    // 
    bytes32 constant requestId        = 0x31b40192effc42bcf1e4289fe674c678e673a3052992548fef566d8c33a21b91;

    bytes32 constant timestamp        = 0x4ebf727c48eac2c66272456b06a885c5cc03e54d140f63b63b6fd10c1227958e;

    bytes32 constant value            = 0x81afeeaff0ed5cee7d05a21078399c2f56226b0cd5657062500cef4c4e736f85;

    bytes32 constant minExecutionDate = 0x74c9bc34b0b2333f1b565fbee67d940cf7d78b5a980c5f23da43f6729965ed40;

    bytes32 constant numberOfVotes    = 0xa0bc13ce85a2091e950a370bced0825e58ab3a3ffeb709ed50d5562cbd82faab;

    bytes32 constant blockNumber      = 0x6f8f54d1af9b6cb8a219d88672c797f9f3ee97ce5d9369aa897fd0deb5e2dffa;

    bytes32 constant minerSlot        = 0x8ef61a1efbc527d6428ff88c95fdff5c6e644b979bfe67e03cbf88c8162c5fac;

    bytes32 constant quorum           = 0x30e85ae205656781c1a951cba9f9f53f884833c049d377a2a7046eb5e6d14b26;

    bytes32 constant fee              = 0x833b9f6abf0b529613680afe2a00fa663cc95cbdc47d726d85a044462eabbf02;

    /*
     * UINT variables
     */
    bytes32 constant decimals           = 0x784c4fb1ab068f6039d5780c68dd0fa2f8742cceb3426d19667778ca7f3518a9;

    bytes32 constant disputeFee         = 0x8b75eb45d88e80f0e4ec77d23936268694c0e7ac2e0c9085c5c6bdfcfbc49239;

    bytes32 constant disputeCount       = 0x475da5340e76792184fb177cb85d21980c2530616313aef501564d484eb5ca1e;

    bytes32 constant total_supply       = 0xb1557182e4359a1f0c6301278e8f5b35a776ab58d39892581e357578fb287836;

    bytes32 constant stakeAmount        = 0x7be108969d31a3f0b261465c71f2b0ba9301cd914d55d9091c3b36a49d4d41b2;

    bytes32 constant stakerCount        = 0xedddb9344bfe0dadc78c558b8ffca446679cbffc17be64eb83973fce7bea5f34;

    bytes32 constant timeOfLastNewValue = 0x97e6eb29f6a85471f7cc9b57f9e4c3deaf398cfc9798673160d7798baf0b13a4;

    bytes32 constant difficulty         = 0xb12aff7664b16cb99339be399b863feecd64d14817be7e1f042f97e3f358e64e;

    bytes32 constant currentTotalTips   = 0xd26d9834adf5a73309c4974bf654850bb699df8505e70d4cfde365c417b19dfc;

    bytes32 constant currentRequestId   = 0x7584d7d8701714da9c117f5bf30af73b0b88aca5338a84a21eb28de2fe0d93b8;

    bytes32 constant requestCount       = 0x05de9147d05477c0a5dc675aeea733157f5092f82add148cf39d579cafe3dc98;

    bytes32 constant slotProgress       = 0x6c505cb2db6644f57b42d87bd9407b0f66788b07d0617a2bc1356a0e69e66f9a;

    bytes32 constant miningReward       = 0x9f355ccb80c88ef4eea7a6d390e83e1044d5676886223220e9522329f054ef16;

    bytes32 constant timeTarget         = 0xad16221efc80aaf1b7e69bd3ecb61ba5ffa539adf129c3b4ffff769c9b5bbc33;

    bytes32 constant currentMinerReward = 0xdcf69331608ae4837870755f6bd10a16da39d47dbece9e37a5b80a54219d7ed3;

    bytes32 constant granularity        = 0xba3571a50e0c436953d31396edfb65be5925bcc7fef5a3441ed5d43dbce2548f;

    bytes32 constant requestQPosition   = 0x1e344bd070f05f1c5b3f0b1266f4f20d837a0a8190a3a2da8b0375eac2ba86ea;

    bytes32 constant totalTip           = 0x2a9e355a92978430eca9c1aa3a9ba590094bac282594bccf82de16b83046e2c3;

    bytes32 constant targetMiners       = 0xabef544d8048318ece54fb2c6385255cd1b06e176525d149a0338a7acca6deb3;

    bytes32 constant currentReward        = 0x9b6853911475b07474368644a0d922ee13bc76a15cd3e97d3e334326424a47d4;

    bytes32 constant devShare             = 0x8fe9ded8d7c08f720cf0340699024f83522ea66b2bbfb8f557851cb9ee63b54c;

    // Address Getters

    function getZapContract() public pure returns (bytes32) {
        return zapContract;
    }
    function getZapTokenContract() public pure returns (bytes32) {
        return zapTokenContract;
    }
    function get_owner() public pure returns (bytes32) {
        return _owner;
    }
    function get_deity() public pure returns (bytes32) {
        return _deity;
    }
    function get_vault() public pure returns (bytes32) {
        return _vault;
    }

    //

    function getRequestId() public pure returns (bytes32) {
        return requestId;
    }
    function getTimestamp() public pure returns (bytes32) {
        return timestamp;
    }
    function getValue() public pure returns (bytes32) {
        return value;
    }
    function getMinExecutionDate() public pure returns (bytes32) {
        return minExecutionDate;
    }
    function getNumberOfVotes() public pure returns (bytes32) {
        return numberOfVotes;
    }
    function getBlockNumber() public pure returns (bytes32) {
        return blockNumber;
    }
    function getMinerSlot() public pure returns (bytes32) {
        return minerSlot;
    }
    function getQuorum() public pure returns (bytes32) {
        return quorum;
    }
    function getFee() public pure returns (bytes32) {
        return fee;
    }

    // UINT Getters
    function getDecimals() public pure returns (bytes32) {
        return decimals;
    }
    function getDisputeFee() public pure returns (bytes32) {
        return disputeFee;
    }
    function getDisputeCount() public pure returns (bytes32) {
        return disputeCount;
    }
    function getTotal_supply() public pure returns (bytes32) {
        return total_supply;
    }
    function getStakeAmount() public pure returns (bytes32) {
        return stakeAmount;
    }
    function getStakerCount() public pure returns (bytes32) {
        return stakerCount;
    }
    function getTimeOfLastNewValue() public pure returns (bytes32) {
        return timeOfLastNewValue;
    }
    function getDifficulty() public pure returns (bytes32) {
        return difficulty;
    }
    function getCurrentTotalTips() public pure returns (bytes32) {
        return currentTotalTips;
    }
    function getCurrentRequestId() public pure returns (bytes32) {
        return currentRequestId;
    }
    function getRequestCount() public pure returns (bytes32) {
        return requestCount;
    }
    function getSlotProgress() public pure returns (bytes32) {
        return slotProgress;
    }
    function getMiningReward() public pure returns (bytes32) {
        return miningReward;
    }
    function getTimeTarget() public pure returns (bytes32) {
        return timeTarget;
    }
    function getCurrentMinerReward() public pure returns (bytes32) {
        return currentMinerReward;
    }
    function getGranularity() public pure returns (bytes32) {
        return granularity;
    }
    function getRequestQPosition() public pure returns (bytes32) {
        return requestQPosition;
    }
    function getTotalTip() public pure returns (bytes32) {
        return totalTip;
    }
    function getTargetMiners() public pure returns (bytes32) {
        return targetMiners;
    }
    function getCurrentReward() public pure returns (bytes32) {
        return currentReward;
    }
    function getDevShare() public pure returns (bytes32) {
        return devShare;
    }

}
