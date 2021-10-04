// pragma solidity =0.5.16;
pragma solidity =0.5.16;

import './SafeMathM.sol';
import './SignedSafeMath.sol';
import './Utilities.sol';
import './ZapConstants.sol';
import './ZapStorage.sol';
import './ZapDispute.sol';
import './ZapStake.sol';
import './ZapGettersLibrary.sol';


/**
 * @title Zap Oracle System Library
 * @dev Contains the functions' logic for the Zap contract where miners can submit the proof of work
 * along with the value and smart contracts can requestData and tip miners.
 */
library ZapLibrary {
    using SafeMathM for uint256;
    using SignedSafeMath for int256;

    event TipAdded(
        address indexed _sender,
        uint256 indexed _requestId,
        uint256 _tip,
        uint256 _totalTips
    );
    event DataRequested(
        address indexed _sender,
        string _query,
        string _querySymbol,
        uint256 _granularity,
        uint256 indexed _requestId,
        uint256 _totalTips
    ); //Emits upon someone adding value to a pool; msg.sender, amount added, and timestamp incentivized to be mined
    event NewChallenge(
        bytes32 _currentChallenge,
        uint256 indexed _currentRequestId,
        uint256 _difficulty,
        uint256 _multiplier,
        string _query,
        uint256 _totalTips
    ); //emits when a new challenge is created (either on mined block or when a new request is pushed forward on waiting system)
    event NewRequestOnDeck(
        uint256 indexed _requestId,
        string _query,
        bytes32 _onDeckQueryHash,
        uint256 _onDeckTotalTips
    ); //emits when a the payout of another request is higher after adding to the payoutPool or submitting a request
    event NewValue(
        uint256 indexed _requestId,
        uint256 _time,
        uint256 _value,
        uint256 _totalTips,
        bytes32 _currentChallenge
    ); //Emits upon a successful Mine, indicates the blocktime at point of the mine and the value mined
    event NonceSubmitted(
        address indexed _miner,
        string _nonce,
        uint256 indexed _requestId,
        uint256 _value,
        bytes32 _currentChallenge
    ); //Emits upon each mine (5 total) and shows the miner, nonce, and value submitted
    event OwnershipTransferred(
        address indexed _previousOwner,
        address indexed _newOwner
    );

    /*Functions*/

    /**
     * @dev This fucntion is called by submitMiningSolution and adjusts the difficulty, sorts and stores the first
     * 5 values received, pays the miners, the dev share and assigns a new challenge
     * @param _nonce or solution for the PoW  for the requestId
     * @param _requestId for the current request being mined
     */
    function newBlock(
        ZapStorage.ZapStorageStruct storage self,
        string memory _nonce,
        uint256 _requestId
    ) internal {
        ZapStorage.Request storage _request = self.requestDetails[_requestId];

        // If the difference between the timeTarget and how long it takes to solve the challenge this updates the challenge
        //difficulty up or donw by the difference between the target time and how long it took to solve the prevous challenge
        //otherwise it sets it to 1

        // difficulty + difficulty(timeTarget - (now - timeOfLastNewValue))

        int256 _newDiff = int256(self.uintVars[ZapConstants.getDifficulty()])
            .add(
                int256(self.uintVars[ZapConstants.getDifficulty()]).mul(
                    int256(self.uintVars[ZapConstants.getTimeTarget()]).sub(
                        int256(
                            now.sub(
                                self.uintVars[ZapConstants.getTimeOfLastNewValue()]
                            )
                        )
                    )
                )
            )
            .div(100);

        // original
        // int256 _newDiff = int256(self.uintVars[ZapConstants.getDifficulty()]) +
        //     (int256(self.uintVars[ZapConstants.getDifficulty()]) *
        //         (int256(self.uintVars[ZapConstants.getTimeTarget()]) -
        //             int256(
        //                 now - self.uintVars[ZapConstants.getTimeOfLastNewValue()]
        //             ))) /
        //     100;

        if (_newDiff <= 0) {
            self.uintVars[ZapConstants.getDifficulty()] = 1;
        } else {
            self.uintVars[ZapConstants.getDifficulty()] = uint256(_newDiff);
        }

        //Sets time of value submission rounded to 1 minute
        self.uintVars[ZapConstants.getTimeOfLastNewValue()] =
            now -
            (now % 1 minutes);

        //The sorting algorithm that sorts the values of the first five values that come in
        ZapStorage.Details[5] memory a = self.currentMiners;
        uint256 i;
        for (i = 1; i < 5; i++) {
            uint256 temp = a[i].value;
            address temp2 = a[i].miner;
            uint256 j = i;
            while (j > 0 && temp < a[j - 1].value) {
                a[j].value = a[j - 1].value;
                a[j].miner = a[j - 1].miner;
                j--;
            }
            if (j < i) {
                a[j].value = temp;
                a[j].miner = temp2;
            }
        }

        //Pay the miners
        if (self.uintVars[ZapConstants.getCurrentReward()] == 0) {
            self.uintVars[ZapConstants.getCurrentReward()] = 6e18;
        }
        if (self.uintVars[ZapConstants.getCurrentReward()] > 1e18) {
            self.uintVars[ZapConstants.getCurrentReward()] =
                self.uintVars[ZapConstants.getCurrentReward()] -
                (self.uintVars[ZapConstants.getCurrentReward()] * 30612633181126) /
                1e18;
            self.uintVars[ZapConstants.getDevShare()] =
                ((self.uintVars[ZapConstants.getCurrentReward()]) * 50) /
                100;
        } else {
            self.uintVars[ZapConstants.getCurrentReward()] = 1e18;
        }

        uint256 baseReward = (self.uintVars[ZapConstants.getCurrentReward()] /
            1e18) * 1e18;
        self.uintVars[ZapConstants.getCurrentMinerReward()] =
            baseReward +
            self.uintVars[ZapConstants.getCurrentTotalTips()] /
            5;

        emit NewValue(
            _requestId,
            self.uintVars[ZapConstants.getTimeOfLastNewValue()],
            a[2].value,
            self.uintVars[ZapConstants.getCurrentTotalTips()] -
                (self.uintVars[ZapConstants.getCurrentTotalTips()] % 5),
            self.currentChallenge
        );

        //update the total supply
        self.uintVars[ZapConstants.getTotal_supply()] +=
            self.uintVars[ZapConstants.getDevShare()] +
            self.uintVars[ZapConstants.getCurrentMinerReward()] *
            5;
        // self.uintVars[ZapConstants.getTotal_supply()] += 275;

        //Save the official(finalValue), timestamp of it, 5 miners and their submitted values for it, and its block number
        _request.finalValues[
            self.uintVars[ZapConstants.getTimeOfLastNewValue()]
        ] = a[2].value;
        _request.requestTimestamps.push(
            self.uintVars[ZapConstants.getTimeOfLastNewValue()]
        );
        //these are miners by timestamp
        _request.minersByValue[
            self.uintVars[ZapConstants.getTimeOfLastNewValue()]
        ] = [a[0].miner, a[1].miner, a[2].miner, a[3].miner, a[4].miner];
        _request.valuesByTimestamp[
            self.uintVars[ZapConstants.getTimeOfLastNewValue()]
        ] = [a[0].value, a[1].value, a[2].value, a[3].value, a[4].value];
        _request.minedBlockNum[
            self.uintVars[ZapConstants.getTimeOfLastNewValue()]
        ] = block.number;
        //map the timeOfLastValue to the requestId that was just mined

        self.requestIdByTimestamp[
            self.uintVars[ZapConstants.getTimeOfLastNewValue()]
        ] = _requestId;
        //add timeOfLastValue to the newValueTimestamps array
        self.newValueTimestamps.push(
            self.uintVars[ZapConstants.getTimeOfLastNewValue()]
        );
        //re-start the count for the slot progress to zero before the new request mining starts
        self.uintVars[ZapConstants.getSlotProgress()] = 0;
        self.uintVars[ZapConstants.getCurrentRequestId()] = ZapGettersLibrary
            .getTopRequestID(self);
        //if the currentRequestId is not zero(currentRequestId exists/something is being mined) select the requestId with the hightest payout
        //else wait for a new tip to mine
        if (self.uintVars[ZapConstants.getCurrentRequestId()] > 0) {
            //Update the current request to be mined to the requestID with the highest payout
            self.uintVars[ZapConstants.getCurrentTotalTips()] = self
                .requestDetails[self.uintVars[ZapConstants.getCurrentRequestId()]]
                .apiUintVars[ZapConstants.getTotalTip()];
            //Remove the currentRequestId/onDeckRequestId from the requestQ array containing the rest of the 50 requests
            self.requestQ[
                self
                    .requestDetails[
                        self.uintVars[ZapConstants.getCurrentRequestId()]
                    ]
                    .apiUintVars[ZapConstants.getRequestQPosition()]
            ] = 0;

            //unmap the currentRequestId/onDeckRequestId from the requestIdByRequestQIndex
            self.requestIdByRequestQIndex[
                self
                    .requestDetails[
                        self.uintVars[ZapConstants.getCurrentRequestId()]
                    ]
                    .apiUintVars[ZapConstants.getRequestQPosition()]
            ] = 0;

            //Remove the requestQposition for the currentRequestId/onDeckRequestId since it will be mined next
            self
                .requestDetails[self.uintVars[ZapConstants.getCurrentRequestId()]]
                .apiUintVars[ZapConstants.getRequestQPosition()] = 0;

            //Reset the requestId TotalTip to 0 for the currentRequestId/onDeckRequestId since it will be mined next
            //and the tip is going to the current timestamp miners. The tip for the API needs to be reset to zero
            self
                .requestDetails[self.uintVars[ZapConstants.getCurrentRequestId()]]
                .apiUintVars[ZapConstants.getTotalTip()] = 0;

            //gets the max tip in the in the requestQ[51] array and its index within the array??
            uint256 newRequestId = ZapGettersLibrary.getTopRequestID(self);
            //Issue the the next challenge
            self.currentChallenge = keccak256(
                abi.encodePacked(
                    _nonce,
                    self.currentChallenge,
                    blockhash(block.number - 1)
                )
            ); // Save hash for next proof
            emit NewChallenge(
                self.currentChallenge,
                self.uintVars[ZapConstants.getCurrentRequestId()],
                self.uintVars[ZapConstants.getDifficulty()],
                self
                    .requestDetails[
                        self.uintVars[ZapConstants.getCurrentRequestId()]
                    ]
                    .apiUintVars[ZapConstants.getGranularity()],
                self
                    .requestDetails[
                        self.uintVars[ZapConstants.getCurrentRequestId()]
                    ]
                    .queryString,
                self.uintVars[ZapConstants.getCurrentTotalTips()]
            );
            emit NewRequestOnDeck(
                newRequestId,
                self.requestDetails[newRequestId].queryString,
                self.requestDetails[newRequestId].queryHash,
                self.requestDetails[newRequestId].apiUintVars[
                    ZapConstants.getTotalTip()
                ]
            );
        } else {
            self.uintVars[ZapConstants.getCurrentTotalTips()] = 0;
            self.currentChallenge = '';
        }
    }

    /**
     * @dev Proof of work is called by the miner when they submit the solution (proof of work and value)
     * @param _nonce uint submitted by miner
     * @param _requestId the apiId being mined
     * @param _value of api query
     */
    function submitMiningSolution(
        ZapStorage.ZapStorageStruct storage self,
        string memory _nonce,
        uint256 _requestId,
        uint256 _value
    ) public {
        //requre miner is staked
        require(self.stakerDetails[msg.sender].currentStatus == 1, "Miner is not staked");

        //Check the miner is submitting the pow for the current request Id
        require(_requestId == self.uintVars[ZapConstants.getCurrentRequestId()], "The solution submitted is not for the current request ID");

        //Saving the challenge information as unique by using the msg.sender
        require(
            uint256(
                sha256(
                    abi.encodePacked(
                        ripemd160(
                            abi.encodePacked(
                                keccak256(
                                    abi.encodePacked(
                                        self.currentChallenge,
                                        msg.sender,
                                        _nonce
                                    )
                                )
                            )
                        )
                    )
                )
            ) %
                self.uintVars[ZapConstants.getDifficulty()] ==
                0
            , "Challenge info is not unique"
        );

        //Make sure the miner does not submit a value more than once
        require(self.minersByChallenge[self.currentChallenge][msg.sender] == false, "Miner has already submitted a value");

        // Set miner reward to zero to prevent it from giving rewards before a block is mined
        self.uintVars[ZapConstants.getCurrentMinerReward()] = 0;

        //Save the miner and value received
        self
            .currentMiners[self.uintVars[ZapConstants.getSlotProgress()]]
            .value = _value;
        self.currentMiners[self.uintVars[ZapConstants.getSlotProgress()]].miner = msg
            .sender;

        //Add to the count how many values have been submitted, since only 5 are taken per request
        self.uintVars[ZapConstants.getSlotProgress()]++;

        //Update the miner status to true once they submit a value so they don't submit more than once
        self.minersByChallenge[self.currentChallenge][msg.sender] = true;

        emit NonceSubmitted(
            msg.sender,
            _nonce,
            _requestId,
            _value,
            self.currentChallenge
        );

        //If 5 values have been received, adjust the difficulty otherwise sort the values until 5 are received
        if (self.uintVars[ZapConstants.getSlotProgress()] == 5) {
            newBlock(self, _nonce, _requestId);
        }
    }
}
