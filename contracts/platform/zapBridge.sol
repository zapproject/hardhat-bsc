// pragma solidity ^0.4.24;
// import "./ERC20.sol";

// contract ZapBridge{
//     function getContract(string contractName) public view returns (address); //coordinator
//     function calcZapForDots(address, bytes32, uint256) external view returns (uint256); //bondage
//     function delegateBond(address holderAddress, address oracleAddress, bytes32 endpoint, uint256 numDots) external returns (uint256 boundZap); //bondage
//     function query(address, string, bytes32, bytes32[]) external returns (uint256); //dispatch
//     function respondIntArray(uint256, string) external returns (bool); //dispatch
// }


// contract priceBet {

//     address public owner;
//     ZapBridge public coordinator;
//     ERC20 token;


//     constructor(address _coordinator) {
//         owner = msg.sender;
//         coordinator = ZapBridge(_coordinator);
//         address zapTokenAddress = coordinator.getContract("ZAP_TOKEN");
//         token = ERC20(zapTokenAddress);
//     }

//     //Set provider that contract will receive data (only owner)
//     function setProvider(address _provider, bytes32 _endpoint){
//         require(msg.sender == owner);
//         endpoint = _endpoint;
//         provider = _provider;
//     }

//     //Query offchain or onchain provider.
//     function queryProvider(string endpoint, bytes32[] params) returns (uint256) {
//         //specify who can query provider here
//         address dispatchAddress = coordinator.getContract("DISPATCH");
//         id = ZapBridge(dispatchAddress).query(provider,coin,endpoint,params);
//         return id;
//     }

//     //Implementing callback that will accept provider's respondIntArray
//     //Response method options  are  :respondBytes32Array, respondIntArray, respond1, respond2, respond3, respond4
//     function callback(uint256 _id, int[] _response) external{
//         require(_id==id);
//         //Implement your logic with _response
//     }

// }
