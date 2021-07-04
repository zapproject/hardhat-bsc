pragma solidity =0.5.16;

import './libraries/SafeMathM.sol';
import './libraries/ZapStorage.sol';
import './libraries/ZapDispute.sol';
import './libraries/ZapStake.sol';
import './libraries/ZapLibrary.sol';
import '../token/ZapTokenBSC.sol';
import './Vault.sol';

/**
 * @title Zap Oracle System
 * @dev Oracle contract where miners can submit the proof of work along with the value.
 * The logic for this contract is in ZapLibrary.sol, ZapDispute.sol, ZapStake.sol,
 * and ZapTransfer.sol
 */
contract Zap {
    event NewDispute(
        uint256 indexed _disputeId,
        uint256 indexed _requestId,
        uint256 _timestamp,
        address _miner
    ); //emitted when a new dispute is initialized
    event NewChallenge(
        bytes32 _currentChallenge,
        uint256 indexed _currentRequestId,
        uint256 _difficulty,
        uint256 _multiplier,
        string _query,
        uint256 _totalTips
    ); //emits when a new challenge is created (either on mined block or when a new request is pushed forward on waiting system)
    event TipAdded(
        address indexed _sender,
        uint256 indexed _requestId,
        uint256 _tip,
        uint256 _totalTips
    );
    event NewRequestOnDeck(
        uint256 indexed _requestId,
        string _query,
        bytes32 _onDeckQueryHash,
        uint256 _onDeckTotalTips
    ); //emits when a the payout of another request is higher after adding to the payoutPool or submitting a request
    event DataRequested(
        address indexed _sender,
        string _query,
        string _querySymbol,
        uint256 _granularity,
        uint256 indexed _requestId,
        uint256 _totalTips
    ); //Emits upon someone adding value to a pool; msg.sender, amount added, and timestamp incentivized to be mined
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    ); //ERC20 Approval event
    event Transfer(address indexed _from, address indexed _to, uint256 _value); //ERC20 Transfer Event
    event OwnershipTransferred(address indexed previousOwner,address indexed newOwner);

    using SafeMathM for uint256;

    using ZapDispute for ZapStorage.ZapStorageStruct;
    using ZapLibrary for ZapStorage.ZapStorageStruct;
    using ZapStake for ZapStorage.ZapStorageStruct;

    ZapStorage.ZapStorageStruct zap;
    ZapTokenBSC public token;
    // Vault public vault;
    // address public vaultAddress;

    address payable public owner;

    constructor(address zapTokenBsc) public {
        token = ZapTokenBSC(zapTokenBsc);
        owner = msg.sender;
    }

    /// @dev Throws if called by any contract other than latest designated caller
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }


    function balanceOf(address _user) public view returns (uint256 balance) {
        return token.balanceOf(_user);
    }

    /*Functions*/

    /**
     * @dev Helps initialize a dispute by assigning it a disputeId
     * when a miner returns a false on the validate array(in Zap.ProofOfWork) it sends the
     * invalidated value information to POS voting
     * @param _requestId being disputed
     * @param _timestamp being disputed
     * @param _minerIndex the index of the miner that submitted the value being disputed. Since each official value
     * requires 5 miners to submit a value.
     */
    function beginDispute(
        uint256 _requestId,
        uint256 _timestamp,
        uint256 _minerIndex
    ) external {
        ZapStorage.Request storage _request = zap.requestDetails[_requestId];
        //require that no more than a day( (24 hours * 60 minutes)/10minutes=144 blocks) has gone by since the value was "mined"
        require(block.number - _request.minedBlockNum[_timestamp] <= 144);
        require(_request.minedBlockNum[_timestamp] > 0);
        require(_minerIndex < 5);

        //_miner is the miner being disputed. For every mined value 5 miners are saved in an array and the _minerIndex
        //provided by the party initiating the dispute
        address _miner = _request.minersByValue[_timestamp][_minerIndex];
        bytes32 _hash = keccak256(
            abi.encodePacked(_miner, _requestId, _timestamp)
        );

        //Ensures that a dispute is not already open for the that miner, requestId and timestamp
        require(zap.disputeIdByDisputeHash[_hash] == 0);
        doTransfer(
            msg.sender,
            address(this),
            zap.uintVars[keccak256('disputeFee')]
        );

        //Increase the dispute count by 1
        zap.uintVars[keccak256('disputeCount')] =
            zap.uintVars[keccak256('disputeCount')] +
            1;

        //Sets the new disputeCount as the disputeId
        uint256 disputeId = zap.uintVars[keccak256('disputeCount')];

        //maps the dispute hash to the disputeId
        zap.disputeIdByDisputeHash[_hash] = disputeId;
        //maps the dispute to the Dispute struct
        zap.disputesById[disputeId] = ZapStorage.Dispute({
            hash: _hash,
            isPropFork: false,
            reportedMiner: _miner,
            reportingParty: msg.sender,
            proposedForkAddress: address(0),
            executed: false,
            disputeVotePassed: false,
            tally: 0
        });

        //Saves all the dispute variables for the disputeId
        zap.disputesById[disputeId].disputeUintVars[
            keccak256('requestId')
        ] = _requestId;
        zap.disputesById[disputeId].disputeUintVars[
            keccak256('timestamp')
        ] = _timestamp;
        zap.disputesById[disputeId].disputeUintVars[
            keccak256('value')
        ] = _request.valuesByTimestamp[_timestamp][_minerIndex];
        zap.disputesById[disputeId].disputeUintVars[
            keccak256('minExecutionDate')
        ] = now + 7 days;
        zap.disputesById[disputeId].disputeUintVars[
            keccak256('blockNumber')
        ] = block.number;
        zap.disputesById[disputeId].disputeUintVars[
            keccak256('minerSlot')
        ] = _minerIndex;
        zap.disputesById[disputeId].disputeUintVars[keccak256('fee')] = zap
        .uintVars[keccak256('disputeFee')];

        //Values are sorted as they come in and the official value is the median of the first five
        //So the "official value" miner is always minerIndex==2. If the official value is being
        //disputed, it sets its status to inDispute(currentStatus = 3) so that users are made aware it is under dispute
        if (_minerIndex == 2) {
            zap.requestDetails[_requestId].inDispute[_timestamp] = true;
        }
        zap.stakerDetails[_miner].currentStatus = 3;
        emit NewDispute(disputeId, _requestId, _timestamp, _miner);
    }

    /**
     * @dev Allows token holders to vote
     * @param _disputeId is the dispute id
     * @param _supportsDispute is the vote (true=the dispute has basis false = vote against dispute)
     */
    function vote(uint256 _disputeId, bool _supportsDispute) external {
        zap.vote(_disputeId, _supportsDispute);
    }

    /**
     * @dev tallies the votes.
     * @param _disputeId is the dispute id
     */
    function tallyVotes(uint256 _disputeId) external {
        zap.tallyVotes(_disputeId);
    }

    /**
     * @dev Allows for a fork to be proposed
     * @param _propNewZapAddress address for new proposed Zap
     */
    function proposeFork(address _propNewZapAddress) external {
        zap.proposeFork(_propNewZapAddress);
    }

    /**
     * @dev Request to retreive value from oracle based on timestamp. The tip is not required to be
     * greater than 0 because there are no tokens in circulation for the initial(genesis) request
     * @param _c_sapi string API being requested be mined
     * @param _c_symbol is the zshort string symbol for the api request
     * @param _granularity is the number of decimals miners should include on the submitted value
     * @param _tip amount the requester is willing to pay to be get on queue. Miners
     * mine the onDeckQueryHash, or the api with the highest payout pool
     */
    function requestData(
        string calldata _c_sapi,
        string calldata _c_symbol,
        uint256 _granularity,
        uint256 _tip
    ) external {
        //Require at least one decimal place
        require(_granularity > 0);

        //But no more than 18 decimal places
        require(_granularity <= 1e18);

        //If it has been requested before then add the tip to it otherwise create the queryHash for it
        string memory _sapi = _c_sapi;
        string memory _symbol = _c_symbol;
        require(bytes(_sapi).length > 0);
        require(bytes(_symbol).length < 64);
        bytes32 _queryHash = keccak256(abi.encodePacked(_sapi, _granularity));

        //If this is the first time the API and granularity combination has been requested then create the API and granularity hash
        //otherwise the tip will be added to the requestId submitted
        if (zap.requestIdByQueryHash[_queryHash] == 0) {
            zap.uintVars[keccak256('requestCount')]++;
            uint256 _requestId = zap.uintVars[keccak256('requestCount')];
            zap.requestDetails[_requestId] = ZapStorage.Request({
                queryString: _sapi,
                dataSymbol: _symbol,
                queryHash: _queryHash,
                requestTimestamps: new uint256[](0)
            });
            zap.requestDetails[_requestId].apiUintVars[
                keccak256('granularity')
            ] = _granularity;
            zap.requestDetails[_requestId].apiUintVars[
                keccak256('requestQPosition')
            ] = 0;
            zap.requestDetails[_requestId].apiUintVars[
                keccak256('totalTip')
            ] = 0;
            zap.requestIdByQueryHash[_queryHash] = _requestId;

            //If the tip > 0 it tranfers the tip to this contract
            if (_tip > 0) {
                doTransfer(msg.sender, address(this), _tip);
            }
            updateOnDeck(_requestId, _tip);
            emit DataRequested(
                msg.sender,
                zap.requestDetails[_requestId].queryString,
                zap.requestDetails[_requestId].dataSymbol,
                _granularity,
                _requestId,
                _tip
            );
        }
        //Add tip to existing request id since this is not the first time the api and granularity have been requested
        else {
            addTip(zap.requestIdByQueryHash[_queryHash], _tip);
        }
    }

    /**
     * @dev Proof of work is called by the miner when they submit the solution (proof of work and value)
     * @param _nonce uint submitted by miner
     * @param _requestId the apiId being mined
     * @param _value of api query
     */
    function submitMiningSolution(
        string calldata _nonce,
        uint256 _requestId,
        uint256 _value
    ) external {
        zap.submitMiningSolution(_nonce, _requestId, _value);

        ZapStorage.Details[5] memory a = zap.currentMiners;

        address vaultAddress = zap.addressVars[keccak256('_vault')];
        Vault vault = Vault(vaultAddress);

        uint256 minerReward = zap.uintVars[keccak256('currentMinerReward')];

        for (uint256 i = 0; i < 5; i++) {
            if (a[i].miner != address(0)){
                token.approve(address(this), minerReward);
                token.transferFrom(address(this), address(vault), minerReward);
                vault.deposit(a[i].miner, minerReward);
            }
        }
    }

    /**
     * @dev This function allows miners to deposit their stake.
     */
    function depositStake() external {
        // require balance is >= here before it hits NewStake()
        uint256 stakeAmount = zap.uintVars[keccak256('stakeAmount')];
        require(
            token.balanceOf(msg.sender) >=
                stakeAmount
        );
        zap.depositStake();

        // address vaultAddress = zap.addressVars[keccak256('_vault')];
        // Vault vault = Vault(vaultAddress);

        // token.approve(address(this), stakeAmount);
        // token.transferFrom(address(this), address(vault), stakeAmount);
        // vault.deposit(msg.sender, stakeAmount);
    }

    /**
     * @dev This function allows stakers to request to withdraw their stake (no longer stake)
     * once they lock for withdraw(stakes.currentStatus = 2) they are locked for 7 days before they
     * can withdraw the stake
     */
    function requestStakingWithdraw() external {
        zap.requestStakingWithdraw();
    }

    /**
     * @dev This function allows users to withdraw their stake after a 7 day waiting period from request
     */
    function withdrawStake() external {
        zap.withdrawStake();
    }

    /**
     * @dev This function approves a _spender an _amount of tokens to use
     * @param _spender address
     * @param _amount amount the spender is being approved for
     * @return true if spender appproved successfully
     */
    function approve(address _spender, uint256 _amount) public returns (bool) {
        return token.approve(_spender, _amount);
    }

    /**
     * @dev Allows for a transfer of tokens to _to
     * @param _to The address to send tokens to
     * @param _amount The amount of tokens to send
     * @return true if transfer is successful
     */
    function transfer(address _to, uint256 _amount) public returns (bool) {
        // return zap.transfer(_to,_amount);
        uint256 previousBalance = balanceOf(msg.sender);
        updateBalanceAtNow(msg.sender, previousBalance - _amount);
        previousBalance = balanceOf(_to);
        require(previousBalance + _amount >= previousBalance); // Check for overflow
        updateBalanceAtNow(_to, previousBalance + _amount);
        return token.transfer(_to, _amount);
    }

    /**
     * @notice Send _amount tokens to _to from _from on the condition it
     * is approved by _from
     * @param _from The address holding the tokens being transferred
     * @param _to The address of the recipient
     * @param _amount The amount of tokens to be transferred
     * @return True if the transfer was successful
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) public returns (bool) {
        // return zap.transferFrom(_from,_to,_amount);
        uint256 previousBalance = balanceOf(_from);
        updateBalanceAtNow(_from, previousBalance - _amount);
        previousBalance = balanceOf(_to);
        require(previousBalance + _amount >= previousBalance); // Check for overflow
        updateBalanceAtNow(_to, previousBalance + _amount);
        return token.transferFrom(_from, _to, _amount);
    }

    /**
     * @dev Getter for the current variables that include the 5 requests Id's
     * @return the challenge, 5 requestsId, difficulty and tip
     */
    function getNewCurrentVariables()
        external
        view
        returns (
            bytes32 _challenge,
            uint256[5] memory _requestIds,
            uint256 _difficutly,
            uint256 _tip
        )
    {
        return zap.getNewCurrentVariables();
    }

    /**
        Migrated functions from ZapTransfer.sol
     */

    /**
     * @dev Completes POWO transfers by updating the balances on the current block number
     * @param _from address to transfer from
     * @param _to addres to transfer to
     * @param _amount to transfer
     */
    function doTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) public {
        require(_amount > 0);
        require(_to != address(0));
        require(allowedToTrade(_from, _amount)); //allowedToTrade checks the stakeAmount is removed from balance if the _user is staked
        uint256 previousBalance = balanceOf(_from);
        previousBalance = balanceOf(_to);
        require(previousBalance + _amount >= previousBalance); // Check for overflow
        transferFrom(_from, _to, _amount); // do the actual transfer to ZapToken
        emit Transfer(_from, _to, _amount);
    }

    /**
     * @dev This function returns whether or not a given user is allowed to trade a given amount
     * and removing the staked amount from their balance if they are staked
     * @param _user address of user
     * @param _amount to check if the user can spend
     * @return true if they are allowed to spend the amount being checked
     */
    function allowedToTrade(address _user, uint256 _amount)
        public
        view
        returns (bool)
    {
        if (zap.stakerDetails[_user].currentStatus > 0) {
            //Removes the stakeAmount from balance if the _user is staked
            if (
                balanceOf(_user)
                .sub(zap.uintVars[keccak256('stakeAmount')])
                .sub(_amount) >= 0
            ) {
                return true;
            }
        } else if (balanceOf(_user).sub(_amount) >= 0) {
            return true;
        }
        return false;
    }

    /**
     * @dev Updates balance for from and to on the current block number via doTransfer
     * @param _value is the new balance
     */
    // remove checkpoints and pass in address _user to retrieve directly from storage
    function updateBalanceAtNow(address _user, uint256 _value) public {
        ZapStorage.Checkpoint[] storage checkpoints = zap.balances[_user];
        if (
            (checkpoints.length == 0) ||
            (checkpoints[checkpoints.length - 1].fromBlock < block.number)
        ) {
            ZapStorage.Checkpoint storage newCheckPoint = checkpoints[
                checkpoints.length++
            ];
            newCheckPoint.fromBlock = uint128(block.number);
            newCheckPoint.value = uint128(_value);
        } else {
            ZapStorage.Checkpoint storage oldCheckPoint = checkpoints[
                checkpoints.length - 1
            ];
            oldCheckPoint.value = uint128(_value);
        }
    }

    /**
     * @dev Getter for balance for owner on the specified _block number
     * @param _block is the block number to search the balance on
     * @return the balance at the checkpoint
     */
    function getBalanceAt(address _user, uint256 _block)
        public
        view
        returns (uint256)
    {
        ZapStorage.Checkpoint[] storage checkpoints = zap.balances[_user];
        if (checkpoints.length == 0) return 0;
        if (_block >= checkpoints[checkpoints.length - 1].fromBlock)
            return checkpoints[checkpoints.length - 1].value;
        if (_block < checkpoints[0].fromBlock) return 0;
        // Binary search of the value in the array
        uint256 min = 0;
        uint256 max = checkpoints.length - 1;
        while (max > min) {
            uint256 mid = (max + min + 1) / 2;
            if (checkpoints[mid].fromBlock <= _block) {
                min = mid;
            } else {
                max = mid - 1;
            }
        }
        return checkpoints[min].value;
    }

    /**
        Migrated from ZapLibrary
     */
    /**
     * @dev Add tip to Request value from oracle
     * @param _requestId being requested to be mined
     * @param _tip amount the requester is willing to pay to be get on queue. Miners
     * mine the onDeckQueryHash, or the api with the highest payout pool
     */
    function addTip(uint256 _requestId, uint256 _tip) public {
        require(_requestId > 0);

        //If the tip > 0 transfer the tip to this contract
        if (_tip > 0) {
            doTransfer(msg.sender, address(this), _tip);
        }

        //Update the information for the request that should be mined next based on the tip submitted
        updateOnDeck(_requestId, _tip);
        emit TipAdded(
            msg.sender,
            _requestId,
            _tip,
            zap.requestDetails[_requestId].apiUintVars[keccak256('totalTip')]
        );
    }

    /**
     * @dev This function updates APIonQ and the requestQ when requestData or addTip are ran
     * @param _requestId being requested
     * @param _tip is the tip to add
     */
    function updateOnDeck(uint256 _requestId, uint256 _tip) internal {
        ZapStorage.Request storage _request = zap.requestDetails[_requestId];
        uint256 onDeckRequestId = ZapGettersLibrary.getTopRequestID(zap);
        //If the tip >0 update the tip for the requestId
        if (_tip > 0) {
            _request.apiUintVars[keccak256('totalTip')] = _request
            .apiUintVars[keccak256('totalTip')]
            .add(_tip);
        }
        //Set _payout for the submitted request
        uint256 _payout = _request.apiUintVars[keccak256('totalTip')];

        //If there is no current request being mined
        //then set the currentRequestId to the requestid of the requestData or addtip requestId submitted,
        // the totalTips to the payout/tip submitted, and issue a new mining challenge
        if (zap.uintVars[keccak256('currentRequestId')] == 0) {
            _request.apiUintVars[keccak256('totalTip')] = 0;
            zap.uintVars[keccak256('currentRequestId')] = _requestId;
            zap.uintVars[keccak256('currentTotalTips')] = _payout;
            zap.currentChallenge = keccak256(
                abi.encodePacked(
                    _payout,
                    zap.currentChallenge,
                    blockhash(block.number - 1)
                )
            ); // Save hash for next proof
            emit NewChallenge(
                zap.currentChallenge,
                zap.uintVars[keccak256('currentRequestId')],
                zap.uintVars[keccak256('difficulty')],
                zap
                    .requestDetails[zap.uintVars[keccak256('currentRequestId')]]
                    .apiUintVars[keccak256('granularity')],
                zap
                    .requestDetails[zap.uintVars[keccak256('currentRequestId')]]
                    .queryString,
                zap.uintVars[keccak256('currentTotalTips')]
            );
        } else {
            //If there is no OnDeckRequestId
            //then replace/add the requestId to be the OnDeckRequestId, queryHash and OnDeckTotalTips(current highest payout, aside from what
            //is being currently mined)
            if (
                _payout >
                zap.requestDetails[onDeckRequestId].apiUintVars[
                    keccak256('totalTip')
                ] ||
                (onDeckRequestId == 0)
            ) {
                //let everyone know the next on queue has been replaced
                emit NewRequestOnDeck(
                    _requestId,
                    _request.queryString,
                    _request.queryHash,
                    _payout
                );
            }

            //if the request is not part of the requestQ[51] array
            //then add to the requestQ[51] only if the _payout/tip is greater than the minimum(tip) in the requestQ[51] array
            if (_request.apiUintVars[keccak256('requestQPosition')] == 0) {
                uint256 _min;
                uint256 _index;
                (_min, _index) = Utilities.getMin(zap.requestQ);
                //we have to zero out the oldOne
                //if the _payout is greater than the current minimum payout in the requestQ[51] or if the minimum is zero
                //then add it to the requestQ array aand map its index information to the requestId and the apiUintvars
                if (_payout > _min || _min == 0) {
                    zap.requestQ[_index] = _payout;
                    zap
                    .requestDetails[zap.requestIdByRequestQIndex[_index]]
                    .apiUintVars[keccak256('requestQPosition')] = 0;
                    zap.requestIdByRequestQIndex[_index] = _requestId;
                    _request.apiUintVars[
                        keccak256('requestQPosition')
                    ] = _index;
                }
            }
            //else if the requestid is part of the requestQ[51] then update the tip for it
            else if (_tip > 0) {
                zap.requestQ[
                    _request.apiUintVars[keccak256('requestQPosition')]
                ] += _tip;
            }
        }
    }

    /**
     * Increase the approval of ZapMaster for the Vault
     */
    function increaseVaultApproval() public returns (bool) {
        address vaultAddress = zap.addressVars[keccak256('_vault')];
        Vault vault = Vault(vaultAddress);
        return vault.increaseApproval();
    }
}
