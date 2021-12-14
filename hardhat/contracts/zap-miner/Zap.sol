pragma solidity =0.5.16;

import './libraries/SafeMathM.sol';
import './libraries/ZapStorage.sol';
import './libraries/ZapDispute.sol';
import './libraries/ZapStake.sol';
import './libraries/ZapLibrary.sol';
import '../token/ZapTokenBSC.sol';
import './libraries/Address.sol';
import './Vault.sol';

/**
 * @title Zap Oracle System
 * @dev Oracle contract where miners can submit the proof of work along with the value.
 * The logic for this contract is in ZapLibrary.sol, ZapDispute.sol and ZapStake.sol
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
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    using SafeMathM for uint256;
    using Address for address;

    using ZapDispute for ZapStorage.ZapStorageStruct;
    using ZapLibrary for ZapStorage.ZapStorageStruct;
    using ZapStake for ZapStorage.ZapStorageStruct;

    /*Global Variables*/
    enum ForkedContract {
        NoContract,
        ZapContract,
        ZapMasterContract,
        VaultContract
    }
    ZapStorage.ZapStorageStruct private zap;
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
        // FOR BTC:require that no more than a day( (24 hours * 60 minutes)/10minutes=144 blocks) has gone by since the value was "mined"
        // FOR BSC:require that no more than a day( (24 hours * 60 minutes * 60 seconds)/3 seconds=28800 blocks) has gone by since the value was "mined"
        // FOR ETH:require that no more than a day( (24 hours * 60 minutes * 60 seconds)/13 seconds=6646 blocks) has gone by since the value was "mined"
        require(block.number - _request.minedBlockNum[_timestamp] <= 28800, "Must dispute within 1 day of being mined.");
        require(_request.minedBlockNum[_timestamp] > 0);
        require(_minerIndex < 5);
        //require that only stakers can dispute values
        require(zap.stakerDetails[msg.sender].currentStatus == 1, "Only stakers can begin a dispute");

        //ensure the msg.sender is staked and not in dispute
        require(token.balanceOf(msg.sender) >= zap.uintVars[keccak256('disputeFee')], "You do not have a balance to dispute.");
        

        //_miner is the miner being disputed. For every mined value 5 miners are saved in an array and the _minerIndex
        //provided by the party initiating the dispute
        address _miner = _request.minersByValue[_timestamp][_minerIndex];
        bytes32 _hash = keccak256(
            abi.encodePacked(_miner, _requestId, _timestamp)
        );

        //Ensures that a dispute is not already open for the that miner, requestId and timestamp
        require(zap.disputeIdByDisputeHash[_hash] == 0);

        address vaultAddress = zap.addressVars[keccak256('_vault')];
        Vault vault = Vault(vaultAddress);

        vault.withdraw(msg.sender, zap.uintVars[keccak256('disputeFee')]);
        vault.deposit(zap.addressVars[keccak256('_owner')], zap.uintVars[keccak256('disputeFee')]);
        transferFrom(msg.sender, zap.addressVars[keccak256('_owner')], zap.uintVars[keccak256('disputeFee')]);

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
            forkedContract: 0, // aka no contract is being forked for this dispute
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

        address vaultAddress = zap.addressVars[keccak256('_vault')];
        Vault vault = Vault(vaultAddress);

        uint256 voteWeight = vault.userBalance(msg.sender);
        zap.vote(_disputeId, _supportsDispute, voteWeight);
    }

    /**
     * @dev tallies the votes.
     * @param _disputeId is the dispute id
     */
    function tallyVotes(uint256 _disputeId) external {

        address currentVault = zap.addressVars[keccak256('_vault')];
        (address _from, address _to, uint256 _disputeFee) = zap.tallyVotes(_disputeId);

        ZapStorage.Dispute storage disp = zap.disputesById[_disputeId];
        bytes memory data;

        Vault vault = Vault(currentVault);

        if (disp.forkedContract == uint(ForkedContract.NoContract)) {
            // If this is a normal dispute, send the winners amount to their wallet
            vault.deposit(_to, _disputeFee);
            data = abi.encodeWithSignature(
                "transfer(address,uint256)",
                _to, _disputeFee);
            _callOptionalReturn(token, data);
        }

        if (disp.forkedContract == uint(ForkedContract.ZapMasterContract)) {
            // If this is fork proposal for changing ZapMaster, transfer the zapMaster
            // total balance of current ZapMaster
            uint256 zapMasterBalance = token.balanceOf(address(this));

            data = abi.encodeWithSignature(
                "transfer(address,uint256)",
                disp.proposedForkAddress, zapMasterBalance);
            // transfer `zapMasterBalance` ZAP from current ZapMaster to new ZapMaster
            _callOptionalReturn(token, data);
        } else if (disp.forkedContract == uint(ForkedContract.VaultContract)) {
            // Approve the current vault to call deposit on the pending, new Vault
            Vault(disp.proposedForkAddress).setApproval(currentVault);
            // If this is a fork proposal for changing the Vault Contract, transfer
            // the current Vault balance to the new one
            increaseVaultApproval(currentVault);
            transferFrom(currentVault, disp.proposedForkAddress, token.balanceOf(currentVault));
            // ...and also migrate the accounts from the old vault contract to the new one
            if (vault.setNewVault(disp.proposedForkAddress)) {
                assert(vault.migrateVault());
            }
            zap.addressVars[keccak256('_vault')] = disp.proposedForkAddress;
        }
    }

    /**
     * @dev Allows for a fork to be proposed
     * @param _propNewZapAddress address for new proposed Zap
     * @param forkedContract contract to be foked: 1 == Zap Contract, 2 == ZapMaster, 3 == Vault Contract
     */
    function proposeFork(address _propNewZapAddress, uint256 forkedContract) external {
        zap.proposeFork(_propNewZapAddress, forkedContract);
            transferFrom(
                msg.sender,
                zap.addressVars[keccak256("_owner")],
                zap.uintVars[keccak256('disputeFee')]
            );
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
                transferFrom(msg.sender, address(this), _tip);
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

        if (minerReward != 0){
            // Pay the miners
            for (uint256 i = 0; i < 5; i++) {
                if (a[i].miner != address(0)){
                    transfer(address(vault), minerReward);
                    vault.deposit(a[i].miner, minerReward);
                }
            }

            // Pay the devshare
            transfer(
                zap.addressVars[keccak256('_owner')],
                zap.uintVars[keccak256('devShare')]
            );
        }

        zap.uintVars[keccak256('currentMinerReward')] = 0;
    }

    /**
     * @dev This function allows miners to deposit their stake.
     */
    function depositStake() external {
        // require balance is >= here before it hits NewStake()
        uint256 stakeAmount = zap.uintVars[keccak256('stakeAmount')];
        require(
            token.balanceOf(msg.sender) >=
                stakeAmount,
            "Not enough ZAP to stake"
        );
        zap.depositStake();

        zap.uintVars[keccak256("total_supply")] += stakeAmount;

        address vaultAddress = zap.addressVars[keccak256('_vault')];
        Vault vault = Vault(vaultAddress);

       
        transferFrom(msg.sender, vaultAddress, stakeAmount);
        vault.deposit(msg.sender, stakeAmount);
        
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

        address vaultAddress = zap.addressVars[keccak256('_vault')];
        Vault vault = Vault(vaultAddress);

        uint256 userBalance = vault.userBalance(msg.sender);

        transferFrom(address(vault), msg.sender, userBalance);

        vault.withdraw(msg.sender, userBalance);

        zap.uintVars[keccak256('total_supply')] -= userBalance;
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
    function transfer(address _to, uint256 _amount) public {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, _to, _amount));
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
    ) public {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, _from, _to, _amount));
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
        require(_tip <= 10000 * 1e18, "Tip cannot be greater than 1000 Zap Tokens.");

        //If the tip > 0 transfer the tip to this contract
        if (_tip > 0) {
            // doTransfer(msg.sender, address(this), _tip);
            transferFrom(msg.sender, address(this), _tip);
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
    function increaseVaultApproval(address vaultAddress) public returns (bool) {
        return Vault(vaultAddress).increaseApproval();
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param _token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     */
    function _callOptionalReturn(ZapTokenBSC _token, bytes memory data) private {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves. We use {Address.functionCall} to perform this call, which verifies that
        // the target address contains contract code and also asserts for success in the low-level call.

        bytes memory returndata = address(_token).functionCall(data, "ZapTokenBSC: low-level call failed");
        if (returndata.length > 0) {
            // Return data is optional
            require(abi.decode(returndata, (bool)), "ZapTokenBSC: ERC20 operation did not succeed");
        }
    }
}
