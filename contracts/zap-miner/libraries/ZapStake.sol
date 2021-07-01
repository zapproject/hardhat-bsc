pragma solidity =0.5.16;

import "./ZapStorage.sol";
import "./ZapTransfer.sol";
import "./ZapDispute.sol";

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
        require(self.uintVars[keccak256("decimals")] == 0);
        //Give this contract 6000 Zap Token so that it can stake the initial 6 miners
        ZapTransfer.updateBalanceAtNow(self.balances[address(this)], 6000);

        // //the initial 5 miner addresses are specfied below
        // //changed payable[5] to 6
        address payable[6] memory _initalMiners = [
            address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266),
            address(0xcd3B766CCDd6AE721141F452C550Ca635964ce71),
            address(0x2546BcD3c84621e976D8185a91A922aE77ECEc30),
            address(0xbDA5747bFD65F08deb54cb465eB87D40e51B197E),
            address(0xdD2FD4581271e230360230F9337D5c0430Bf44C0),
            address(0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199)
        ];
        //Stake each of the 5 miners specified above
        for(uint i=0;i<6;i++){//6th miner to allow for dispute
            //Miner balance is set at 1000 at the block that this function is ran
            ZapTransfer.updateBalanceAtNow(self.balances[_initalMiners[i]],1000);

            newStake(self, _initalMiners[i]);
        }

        //update the total suppply
        self.uintVars[keccak256("total_supply")] += 6000;//6th miner to allow for dispute
        //set Constants
        self.uintVars[keccak256("decimals")] = 18;
        self.uintVars[keccak256("targetMiners")] = 200;
        self.uintVars[keccak256("stakeAmount")] = 1000;
        self.uintVars[keccak256("disputeFee")] = 970;
        self.uintVars[keccak256("timeTarget")]= 600;
        self.uintVars[keccak256("timeOfLastNewValue")] = now - now  % self.uintVars[keccak256("timeTarget")];
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
        require(stakes.currentStatus == 1);

        //Change the miner staked to locked to be withdrawStake
        stakes.currentStatus = 2;

        //Change the startDate to now since the lock up period begins now
        //and the miner can only withdraw 7 days later from now(check the withdraw function)
        stakes.startDate = now -(now % 86400);

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
        require(now - (now % 86400) - stakes.startDate >= 7 days);
        require(stakes.currentStatus == 2);
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
        // require(ZapTransfer.balanceOf(self,staker) >= self.uintVars[keccak256("stakeAmount")]);
        //Ensure they can only stake if they are not currrently staked or if their stake time frame has ended
        //and they are currently locked for witdhraw
        require(self.stakerDetails[staker].currentStatus == 0 || self.stakerDetails[staker].currentStatus == 2);
        self.uintVars[keccak256("stakerCount")] += 1;
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
        return (self.currentChallenge,_requestIds,self.uintVars[keccak256("difficulty")],self.uintVars[keccak256("currentTotalTips")]);
    }
}
