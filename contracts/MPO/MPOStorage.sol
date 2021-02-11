
pragma solidity ^0.5.1;



import "./lib/Ownable.sol";

contract MPOStorage is Ownable{


	// check if msg.sender is in global approved list of responders
	mapping(address => bool) approvedAddress; 
	mapping(uint256 => mapping(address => bool) ) isThresholdReached; 
	mapping(uint256 => bool ) thresholdReached; 
	// Threshold reached, do not accept any more responses
	mapping(uint256 => uint256) queryStatus;
	// Tally of each response.
	mapping(uint256 => mapping(uint256 => uint256) ) responseTally; 
	mapping(uint256 => mapping(address => uint256) ) addressResponse; 
	mapping(uint256 => mapping(address => uint256) ) addressTally; 
	mapping(uint256 => uint256[]) responseArr; 
	mapping(uint256 => uint256[]) thresholdArr;
	mapping(uint256 => uint256) average;
	// Make sure each party can only submit one response
	mapping(uint256 => mapping(address => bool)) oneAddressResponse; 
	mapping(uint256 => uint256) mpoToClientId;
	
	mapping(uint256 => uint256) precision; 
	mapping(uint256 => uint256) delta; 

	mapping(uint256 => uint256) threshold;
	address[] responders;
	uint256 responderLength = 5;
	// implements Client1
	address client;
	uint256 clientQueryId; 


	// Set Methods / Mutators
	function setThreshold(uint queryId, uint256 _threshold) external onlyOwner {
		threshold[queryId] = _threshold;
	}

	function setClientQueryId(uint256 mpoId, uint256 _clientQueryId) external onlyOwner {
		mpoToClientId[mpoId] = _clientQueryId;
	}
 

	function setResponders(address[] calldata parties) external  onlyOwner{

		responders=parties;
		if(responderLength>parties.length){
			responderLength = parties.length;
		}
		for(uint256 i=0; i <responderLength; i++){
			approvedAddress[responders[i]]=true;
		}
	}
	function reachedThreshold(uint256 queryId, address sender) external  onlyOwner{
		isThresholdReached[queryId][sender] = true;
		thresholdReached[queryId] = true;
	}
	function setQueryStatus(uint queryId, uint256 status) external onlyOwner {
		queryStatus[queryId]=status;
	}

	function tallyResponse(uint256 queryId, uint response) external onlyOwner {
		responseTally[queryId][response]++;

	}
	function tallyAddress(uint256 queryId, address responder) external onlyOwner {
		addressTally[queryId][responder]++;

	}
	function addResponse(uint256 queryId, address party) external onlyOwner {
		// responseArr[queryId].push(response);
		// addressTally[queryId][party]++;
		// addressResponse[queryId][party] = response;
		oneAddressResponse[queryId][party] = true;
	}
	function addThresholdResponse(uint256 queryId, uint256 response) external onlyOwner {
		thresholdArr[queryId].push(response);
	}
	function setDelta(uint256 queryId, uint256 _delta) external{
		delta[queryId] = _delta;
	}

	function setPrecision(uint256 queryId, uint256 _precision) external{
		precision[queryId] = _precision;
	}
	// Get Methods / Accessors

	function onlyOneResponse(uint256 queryId, address party) external view returns(bool) {
        return oneAddressResponse[queryId][party];
    }
    function getThresholdStatus(uint256 queryId, address party) external view returns(bool) {
        return isThresholdReached[queryId][party];
    }

    function getAddressStatus(address party) external view returns(bool){
        return approvedAddress[party];
    }
	
	function getThreshold(uint queryId) external view returns(uint) { 
		return threshold[queryId];
	}
	
	function getTally(uint256 queryId, uint256 response)external view returns(uint256){
		return responseTally[queryId][response];
	}
	function getAddressTally(uint256 queryId, address responder)external view returns(uint256){
		return addressTally[queryId][responder];
	}
	function getAddressResponse(uint256 queryId, address responder)external view returns(uint256){
		return addressResponse[queryId][responder];
	}
	
	function getClientQueryId(uint256 mpoId) external view returns(uint256){
		return mpoToClientId[mpoId];
	}

	function getQueryStatus(uint256 queryId) external view returns(uint256){
		return queryStatus[queryId];
	}




	function getThresholdResponses(uint256 queryId) external view returns(uint256[] memory ){

		return thresholdArr[queryId];
	}

	function getNumResponders() external view returns (uint) {
		return responderLength;
	}

	function getResponderAddress(uint index) external view returns(address){
		return responders[index];
	}

	

	function getResponders() external view returns (address[] memory){
		return responders;
	}
	function getResponses(uint256 queryId) external view returns(uint256[] memory){

		return responseArr[queryId];
	}
	function getDelta(uint256 queryId) external view returns(uint256){
		return delta[queryId];
	}
	function getPrecision(uint256 queryId) external view returns(uint256){
		return precision[queryId];
	}
	function getQueryThreshold(uint queryId)external view returns(bool){
		return thresholdReached[queryId];
	}

	function getAverage(uint256 queryId) external view returns(int[] memory ){

		require(responders.length!=0, "Division error");
		uint total = 0;
		uint len=0;
		
		for (uint i =0; i < responderLength ;i++){
			if(isThresholdReached[queryId][responders[i]] ){
				len++;
				total+=addressResponse[queryId][responders[i]];
				
			}
		}
		require(total<uint(2**256-1), "Overflow error(getAverage)");
		int[] memory avg = new int[](1);
		avg[0]=int(total) / int(len);
		return avg;
	}
	

}
