pragma solidity ^0.4.24;

contract ZapInterface{
    //event
    event Transfer(address indexed from, address indexed to, uint256 value);
    //coordinator
    function getContract(string contractName) public view returns (address); 
    //registry
    function initiateProvider(uint256, bytes32) public returns (bool);
    function initiateProviderCurve(bytes32, int256[], address) public returns (bool);
    //bondage
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
    //dispatch
    function query(address, string, bytes32, bytes32[]) external returns (uint256); 
    function respond1(uint256, string) external returns (bool);
    function respond2(uint256, string, string) external returns (bool);
    function respond3(uint256, string, string, string) external returns (bool);
    function respond4(uint256, string, string, string, string) external returns (bool);
    function respondBytes32Array(uint256, bytes32[]) external returns (bool);
    function respondIntArray(uint256,int[] ) external returns (bool);
    // Token
    function balanceOf(address who) public view returns (uint256); 
    function transfer(address to, uint256 value) public returns (bool);
	function approve(address spender, uint256 value) public returns (bool);


}