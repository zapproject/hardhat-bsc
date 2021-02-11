
pragma solidity ^0.5.1;


contract ZapInterface{
    //event
    event Transfer(address indexed from, address indexed to, uint256 value);

    function getContract(string memory contractName) public view returns (address); 
    //registry
    function initiateProvider(uint256, bytes32) public returns (bool);
    function initiateProviderCurve(bytes32, int256[] memory,address) public returns (bool);


    function bond(address, bytes32, uint256) external returns(uint256);
    function unbond(address, bytes32, uint256) external returns (uint256);
    function delegateBond(address, address, bytes32, uint256) external returns(uint256);
    function escrowDots(address, address, bytes32, uint256) external returns (bool);
    function releaseDots(address, address, bytes32, uint256) external returns (bool);
    function returnDots(address, address, bytes32, uint256) external returns (bool success);
    function calcZapForDots(address, bytes32, uint256) external view returns (uint256);
    function currentCostOfDot(address, bytes32, uint256) public view returns (uint256);
    function getDotsIssued(address, bytes32) public view returns (uint256);
    function getBoundDots(address, address, bytes32) public view returns (uint256);
    function getZapBound(address, bytes32) public view returns (uint256);
    function dotLimit( address, bytes32) public view returns (uint256);

    function query(address, string calldata, bytes32, bytes32[] calldata) external returns (uint256); 
    function respond1(uint256, string calldata) external returns (bool);
    function respond2(uint256, string calldata, string calldata) external returns (bool);
    function respond3(uint256, string calldata, string calldata, string calldata) external returns (bool);
    function respond4(uint256, string calldata, string calldata, string calldata, string calldata) external returns (bool);
    function respondBytes32Array(uint256, bytes32[] calldata) external returns (bool);
    function respondIntArray(uint256,int[] calldata) external returns (bool);


    function balanceOf(address who) public view returns (uint256); 
    function transfer(address to, uint256 value) public returns (bool);
	function approve(address spender, uint256 value) public returns (bool);


}