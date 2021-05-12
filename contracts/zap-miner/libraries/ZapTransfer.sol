pragma solidity ^0.5.1;

import "./SafeMathM.sol";
import "./ZapStorage.sol";

/**
* @title Zap Transfer
* @dev Contais the methods related to transfers and ERC20. Zap.sol and ZapGetters.sol
* reference this library for function's logic.
*/
library ZapTransfer {
    using SafeMathM for uint256;

    event Approval(address indexed _owner, address indexed _spender, uint256 _value);//ERC20 Approval event
    event Transfer(address indexed _from, address indexed _to, uint256 _value);//ERC20 Transfer Event

    /*Functions*/

    /**
    * @param _user address of party with the balance
    * @param _spender address of spender of parties said balance
    * @return Returns the remaining allowance of tokens granted to the _spender from the _user
    */
    function allowance(ZapStorage.ZapStorageStruct storage self,address _user, address _spender) public view returns (uint) {
       
       return self.allowed[_user][_spender]; 
    }


    /**
    * @dev Completes POWO transfers by updating the balances on the current block number
    * @param _from address to transfer from
    * @param _to addres to transfer to
    * @param _amount to transfer
    */
    function doTransfer(ZapStorage.ZapStorageStruct storage self, address _from, address _to, uint _amount) public {
        require(_amount > 0);
        require(_to != address(0));
        require(allowedToTrade(self,_from,_amount)); //allowedToTrade checks the stakeAmount is removed from balance if the _user is staked
        uint previousBalance = balanceOfAt(self,_from, block.number);
        updateBalanceAtNow(self.balances[_from], previousBalance - _amount);
        previousBalance = balanceOfAt(self,_to, block.number);
        require(previousBalance + _amount >= previousBalance); // Check for overflow
        updateBalanceAtNow(self.balances[_to], previousBalance + _amount);
        emit Transfer(_from, _to, _amount);
    }


    /**
    * @dev Queries the balance of _user at a specific _blockNumber
    * @param _user The address from which the balance will be retrieved
    * @param _blockNumber The block number when the balance is queried
    * @return The balance at _blockNumber specified
    */
    function balanceOfAt(ZapStorage.ZapStorageStruct storage self,address _user, uint _blockNumber) public view returns (uint) {
        if ((self.balances[_user].length == 0) || (self.balances[_user][0].fromBlock > _blockNumber)) {
                return 0;
        }
     else {
        return getBalanceAt(self.balances[_user], _blockNumber);
     }
    }


    /**
    * @dev Getter for balance for owner on the specified _block number
    * @param checkpoints gets the mapping for the balances[owner]
    * @param _block is the block number to search the balance on
    * @return the balance at the checkpoint
    */
    function getBalanceAt(ZapStorage.Checkpoint[] storage checkpoints, uint _block) view public returns (uint) {
        if (checkpoints.length == 0) return 0;
        if (_block >= checkpoints[checkpoints.length-1].fromBlock)
            return checkpoints[checkpoints.length-1].value;
        if (_block < checkpoints[0].fromBlock) return 0;
        // Binary search of the value in the array
        uint min = 0;
        uint max = checkpoints.length-1;
        while (max > min) {
            uint mid = (max + min + 1)/ 2;
            if (checkpoints[mid].fromBlock<=_block) {
                min = mid;
            } else {
                max = mid-1;
            }
        }
        return checkpoints[min].value;
    }


    /**
    * @dev This function returns whether or not a given user is allowed to trade a given amount 
    * and removing the staked amount from their balance if they are staked
    * @param _user address of user
    * @param _amount to check if the user can spend
    * @return true if they are allowed to spend the amount being checked
    */
    function allowedToTrade(ZapStorage.ZapStorageStruct storage self,address _user,uint _amount) public view returns(bool) {
        if(self.stakerDetails[_user].currentStatus >0){
            //Removes the stakeAmount from balance if the _user is staked
            if(balanceOfAt(self,_user,block.number).sub(self.uintVars[keccak256("stakeAmount")]).sub(_amount) >= 0){
                return true;
            }
        }
        else if(balanceOfAt(self,_user,block.number).sub(_amount) >= 0){
                return true;
        }
        return false;
    }
    

    /**
    * @dev Updates balance for from and to on the current block number via doTransfer
    * @param checkpoints gets the mapping for the balances[owner]
    * @param _value is the new balance
    */
    function updateBalanceAtNow(ZapStorage.Checkpoint[] storage checkpoints, uint _value) public {
        if ((checkpoints.length == 0) || (checkpoints[checkpoints.length -1].fromBlock < block.number)) {
               ZapStorage.Checkpoint storage newCheckPoint = checkpoints[ checkpoints.length++ ];
               newCheckPoint.fromBlock =  uint128(block.number);
               newCheckPoint.value = uint128(_value);
        } else {
               ZapStorage.Checkpoint storage oldCheckPoint = checkpoints[checkpoints.length-1];
               oldCheckPoint.value = uint128(_value);
        }
    }
}
