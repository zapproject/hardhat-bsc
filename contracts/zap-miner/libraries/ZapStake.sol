pragma solidity =0.5.16;

import './ZapConstants.sol';
import "./ZapStorage.sol";
import "./ZapDispute.sol";

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
        require(self.uintVars[ZapConstants.getDecimals()] == 0, "Already initialized");
        
        //set Constants
        self.uintVars[ZapConstants.getDecimals()] = 18;
        self.uintVars[ZapConstants.getTargetMiners()] = 200;
        self.uintVars[ZapConstants.getStakeAmount()] = 500000 * 1e18;
        self.uintVars[ZapConstants.getDisputeFee()] = 970 * 1e18;
        self.uintVars[ZapConstants.getTimeTarget()]= 600;
        self.uintVars[ZapConstants.getTimeOfLastNewValue()] = now - now  % self.uintVars[ZapConstants.getTimeTarget()];
        self.uintVars[ZapConstants.getDifficulty()] = 1;
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
        stakes.startDate = now -(now % 86400);

        //Reduce the staker count
        self.uintVars[ZapConstants.getStakerCount()] -= 1;
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
        require(now - (now % 86400) - stakes.startDate >= 7 days, "Can't withdraw yet. Need to wait at LEAST 7 days from stake start date.");
        require(stakes.currentStatus == 2, "Required to request withdraw of stake");
        stakes.currentStatus = 0;

        /*
            NOT TOTALLY SURE OF THESE FUNCTON NAMES.
            BUT THE LOGIC SHOULD BE SOMETHING LIKE THIS...
            // msg.sender is the staker that wants to withdraw their tokens
            previousBalance = balanceOf(msg.sender); // grab the balance of the staker
            updateBalanceAtNow(self.balancecs(msg.sender), previousBalance) // update 
            tranferFrom(vault, msg.sender);
            
            // updates the storage portion that keeps track of balances at a block. set it to 0 since staker is unstaking
            updateBalanceAtNow(self.balancecs(msg.sender), 0) 
        */
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
        //Ensure they can only stake if they are not currrently staked or if their stake time frame has ended
        //and they are currently locked for witdhraw
        require(self.stakerDetails[staker].currentStatus == 0 || self.stakerDetails[staker].currentStatus == 2, "ZapStake: Either already staked or stake time frame ended");
        self.uintVars[ZapConstants.getStakerCount()] += 1;
        self.stakerDetails[staker] = ZapStorage.StakeInfo({
            currentStatus: 1,
            //this resets their stake start date to today
            startDate: now - (now % 86400)
        });

        emit NewStake(staker);
    }

     /**
    * @dev Getter function for the requestId being mined 
    * @return variables for the current minin event: Challenge, 5 RequestId, difficulty and Totaltips
    */
    function getNewCurrentVariables(ZapStorage.ZapStorageStruct storage self) internal view returns(bytes32 _challenge,uint[5] memory _requestIds,uint256 _difficulty, uint256 _tip){
        for(uint i=0;i<5;i++){
            _requestIds[i] =  self.currentMiners[i].value;
        }
        return (self.currentChallenge,_requestIds,self.uintVars[ZapConstants.getDifficulty()],self.uintVars[ZapConstants.getCurrentTotalTips()]);
    }
}
