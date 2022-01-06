// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import './SafeMathM.sol';
import './ZapStorage.sol';
import './ZapConstants.sol';

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
        disp.disputeUintVars[ZapConstants.getNumberOfVotes()] += 1;

        //Update the quorum by adding the voteWeight
        disp.disputeUintVars[ZapConstants.getQuorum()] += voteWeight;

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
            disp.disputeUintVars[ZapConstants.getRequestId()]
        ];
        
        uint disputeFeeForDisputeId = disp.disputeUintVars[ZapConstants.getFee()];
        address disputeFeeWinnerAddress;
        
        //Ensure this has not already been executed/tallied
        require(!disp.executed, "This has already been executed");

        //Ensure the time for voting has elapsed
        require(block.timestamp > disp.disputeUintVars[ZapConstants.getMinExecutionDate()], "Cannot vote at this time.");

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
                self.uintVars[ZapConstants.getStakerCount()]--;
                updateDisputeFee(self);
                
                //Set the dispute state to passed/true
                disp.disputeVotePassed = true;

                //If the dispute was succeful(miner found guilty) then update the timestamp value to zero
                //so that users don't use this datapoint
                if (
                    _request.inDispute[
                        disp.disputeUintVars[ZapConstants.getTimestamp()]
                    ]
                ) {
                    _request.finalValues[
                        disp.disputeUintVars[ZapConstants.getTimestamp()]
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
                        disp.disputeUintVars[ZapConstants.getTimestamp()]
                    ]
                ) {
                    _request.inDispute[
                        disp.disputeUintVars[ZapConstants.getTimestamp()]
                    ] = false;
                }
                
                disputeFeeWinnerAddress = disp.reportedMiner;

                // return (address(this), disp.reportedMiner, disputeFeeForDisputeId);

            }
            //If the vote is for a proposed fork require 35% quorum before executing the update to the new zap contract address
        } else {
            if (disp.tally > 0) {
                require(
                    disp.disputeUintVars[ZapConstants.getQuorum()] >
                        ((self.uintVars[ZapConstants.getTotal_supply()] * 35) / 100)
                );

                if (disp.forkedContract == 1) { // 1 == ZapContract
                    self.addressVars[ZapConstants.getZapContract()] = disp.proposedForkAddress;
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

    /**
     * @dev Allows for a fork to be proposed
     * @param _propNewZapAddress address for new proposed Zap
     */
    function proposeFork(
        ZapStorage.ZapStorageStruct storage self,
        address _propNewZapAddress,
        uint256 forkedContract
    ) public {
        bytes32 _hash = keccak256(abi.encodePacked(_propNewZapAddress));
        require(self.disputeIdByDisputeHash[_hash] == 0,"Dispute Hash is not equal to zero");

        self.uintVars[ZapConstants.getDisputeCount()]++;
        uint256 disputeId = self.uintVars[ZapConstants.getDisputeCount()];
        self.disputeIdByDisputeHash[_hash] = disputeId;
        
        self.disputesById[disputeId].hash = _hash;
        self.disputesById[disputeId].forkedContract = forkedContract;
        self.disputesById[disputeId].reportedMiner = msg.sender;
        self.disputesById[disputeId].reportingParty = msg.sender;
        self.disputesById[disputeId].proposedForkAddress = _propNewZapAddress;
        self.disputesById[disputeId].executed = false;
        self.disputesById[disputeId].disputeVotePassed = false;
        self.disputesById[disputeId].tally = 0;

        self.disputesById[disputeId].disputeUintVars[
            ZapConstants.getBlockNumber()
        ] = block.number;
        self.disputesById[disputeId].disputeUintVars[ZapConstants.getFee()] = self
        .uintVars[ZapConstants.getDisputeFee()];
        self.disputesById[disputeId].disputeUintVars[
            ZapConstants.getMinExecutionDate()
        ] = block.timestamp + 7 days;

        emit NewForkProposal(
            disputeId,
            block.timestamp,
            _propNewZapAddress
        );
    }

    /**
     * @dev this function allows the dispute fee to fluctuate based on the number of miners on the system.
     * The floor for the fee is 15.
     */
    function updateDisputeFee(ZapStorage.ZapStorageStruct storage self) public {
        //if the number of staked miners divided by the target count of staked miners is less than 1
        if (
            (self.uintVars[ZapConstants.getStakerCount()] * 1000) /
                self.uintVars[ZapConstants.getTargetMiners()] <
            1000
        ) {
            //Set the dispute fee at stakeAmt * (1- stakerCount/targetMiners)
            //or at the its minimum of 15
            self.uintVars[ZapConstants.getDisputeFee()] = SafeMathM.max(
                15,
                self.uintVars[ZapConstants.getStakeAmount()].mul(
                    1000 -
                        (self.uintVars[ZapConstants.getStakerCount()] * 1000) /
                        self.uintVars[ZapConstants.getTargetMiners()]
                ) / 1000
            );
        } else {
            //otherwise set the dispute fee at 15 (the floor/minimum fee allowed)
            self.uintVars[ZapConstants.getDisputeFee()] = 15;
        }
    }
}
