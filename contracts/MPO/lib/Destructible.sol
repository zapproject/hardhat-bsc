<<<<<<< HEAD
pragma solidity ^0.5.1;
=======
pragma solidity ^0.4.24;
>>>>>>> develop

import "./Ownable.sol";

contract Destructible is Ownable {
	function selfDestruct() public onlyOwner {
		selfdestruct(owner);
	}
}
