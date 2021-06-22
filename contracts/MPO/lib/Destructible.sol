
pragma solidity ^0.5.16;


import "./Ownable.sol";

contract Destructible is Ownable {
	function selfDestruct() public onlyOwner {
		selfdestruct(owner);
	}
}
