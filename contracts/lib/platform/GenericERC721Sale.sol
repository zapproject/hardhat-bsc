
pragma solidity =0.5.16;
// Replace with 721 Interface
//import "../token/FactoryTokenInterface.sol";
import "../ownership/ZapCoordinatorInterface.sol";
import "../../platform/bondage/BondageInterface.sol";
import "../../platform/bondage/currentCost/CurrentCostInterface.sol";
import "../../platform/registry/RegistryInterface.sol";
import "../../platform/bondage/currentCost/CurrentCostInterface.sol";
import "../token/FactoryTokenInterface.sol";
interface NFTTokenInterface  {

           event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
           event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
           event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
           function mint(address to,uint256 tokenId) external;
           function burnFrom(uint256 tokenId) external;
           function balanceOf(address _owner) external view returns (uint256);
           function ownerOf(uint256 _tokenId) external view returns (address);
           function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes calldata data) external;
           function safeTransferFrom(address _from, address _to, uint256 _tokenId) external;
           function transferFrom(address _from, address _to, uint256 _tokenId) external;
           function setApprovalForAll(address _operator, bool _approved) external;
           function getApproved(uint256 _tokenId) external view returns (address);
           function isApprovedForAll(address _owner, address _operator) external view returns (bool);
           function setBaseURI(string calldata baseMetadata) external;
           function setURI(uint256 tokenId,string calldata uri) external;
}
interface TokenFactoryInterface{
    function create(string calldata _name, string calldata _symbol) external returns (NFTTokenInterface);
}
contract ERC721DotFactory {
    address[] public deployedFactories;
    address public coordinator;
    address public factory;
    event newDotFactory(address dotfactory,uint PubKey,bytes32 Title );

    constructor(address _coordinator,address _factory) public {
        coordinator=_coordinator;
        factory=_factory;
    }
    function deployFactory(uint256 providerPubKey,bytes32 providerTitle ) public returns(address){
        NFTDotTokenFactory TDF=  new NFTDotTokenFactory(coordinator,factory,providerPubKey,providerTitle);
        TDF.transferOwnership(msg.sender);
        deployedFactories.push(address(TDF));
        emit newDotFactory(address(TDF),providerPubKey,providerTitle);
        return address(TDF);
    }
    function getFactories() public view returns(address[] memory){
        return deployedFactories;
    }
}

contract NFTDotTokenFactory is Ownable {

    CurrentCostInterface currentCost;
    FactoryTokenInterface public reserveToken;
    ZapCoordinatorInterface public coord;
    TokenFactoryInterface public tokenFactory;
    BondageInterface bondage;
    NFTTokenInterface public ERC721;
    mapping(bytes32 => address) public curves;
    mapping(bytes32=>uint256) public tokensMinted;
    mapping(bytes32=>bool) public whitelistedCurve; 
    mapping(address=>mapping(bytes32=>string)) public whitelisting;

    mapping(bytes32 => uint) public curvesTokenPrice;// map of endpoint specifier to token-backed dotaddress
    bytes32[] public curves_list; // array of endpoint specifiers
    event DotTokenCreated(address tokenAddress);

    constructor(
        address coordinator, 
        address factory,
        uint256 providerPubKey,
        bytes32 providerTitle
        
    ) public {
        coord = ZapCoordinatorInterface(coordinator); 
        reserveToken = FactoryTokenInterface(coord.getContract("ZAP_TOKEN"));
        //always allow bondage to transfer from wallet
        
        reserveToken.approve(coord.getContract("BONDAGE"), ~uint256(0));
        tokenFactory = TokenFactoryInterface(factory);

        RegistryInterface registry = RegistryInterface(coord.getContract("REGISTRY")); 
        registry.initiateProvider(providerPubKey, providerTitle);
    }
    //set nft price add price unit specifier
    // tokenuri string
    function initializeCurve(
        bytes32 specifier, 
        bytes32 symbol, 
        int256[] memory curve,
        uint price,
        string memory baseMetadata,
        bool whitelisted
    ) public  onlyOwner returns(address) {
        
        require(curves[specifier] == address(0), "Curve specifier already exists");
        
        RegistryInterface registry = RegistryInterface(coord.getContract("REGISTRY")); 
        require(registry.isProviderInitiated(address(this)), "Provider not intiialized");
        whitelistedCurve[specifier]=whitelisted;
        registry.initiateProviderCurve(specifier, curve, address(this));
        curves[specifier] = newToken(bytes32ToString(specifier), bytes32ToString(symbol));
        curves_list.push(specifier);
        curvesTokenPrice[specifier]=price;
        registry.setProviderParameter(specifier, toBytes(curves[specifier]));
        ERC721.setBaseURI(baseMetadata);
        emit DotTokenCreated(curves[specifier]);
        return curves[specifier];
    }
    function whitelistBonder(bytes32  specifier,address bonder,string memory uri) public onlyOwner{
        require(whitelistedCurve[specifier]==true,"curve must be  whitelisted");
        whitelisting[bonder][specifier]=uri;
    }

    event Bonded(bytes32 indexed specifier, uint256 indexed numDots, address indexed sender); 
    //function approveForBond(address user, string memory metadata) public onlyOwner;
    //whether this contract holds tokens or coming from msg.sender,etc
   
    // needs nft price 
    function bondWhiteListed(bytes32 specifier) public  {
        require(whitelistedCurve[specifier]==true,"curve must be  whitelisted");
        uint numDots=curvesTokenPrice[specifier];
        bondage = BondageInterface(coord.getContract("BONDAGE"));
        uint256 issued = bondage.getDotsIssued(address(this), specifier);

        CurrentCostInterface cost = CurrentCostInterface(coord.getContract("CURRENT_COST"));
        uint256 numReserve = cost._costOfNDots(address(this), specifier, issued + 1, numDots - 1);

        require(
            reserveToken.transferFrom(msg.sender, address(this), numReserve),
            "insufficient accepted token numDots approved for transfer"
        );
        require(bytes(whitelisting[msg.sender][specifier]).length>0,"user must be whitelisted for metadata");

        uint id= uint(keccak256(abi.encodePacked(specifier)))+tokensMinted[specifier];

        reserveToken.approve(address(bondage), numReserve);
        bondage.bond(address(this), specifier, numDots);

        NFTTokenInterface(curves[specifier]).mint(msg.sender, id);
        NFTTokenInterface(curves[specifier]).setURI(id,whitelisting[msg.sender][specifier]);
        whitelisting[msg.sender][specifier]="";

        emit Bonded(specifier, numDots, msg.sender);

    }
      function bond(bytes32 specifier) public  {
        uint numDots=curvesTokenPrice[specifier];
        bondage = BondageInterface(coord.getContract("BONDAGE"));
        uint256 issued = bondage.getDotsIssued(address(this), specifier);
        require(whitelistedCurve[specifier]==false,"curve must be not whitelisted");
        CurrentCostInterface cost = CurrentCostInterface(coord.getContract("CURRENT_COST"));
        uint256 numReserve = cost._costOfNDots(address(this), specifier, issued + 1, numDots - 1);

        require(
            reserveToken.transferFrom(msg.sender, address(this), numReserve),
            "insufficient accepted token numDots approved for transfer"
        );
        require(bytes(whitelisting[msg.sender][specifier]).length>0,"user must be whitelisted for metadata");

        uint id= uint(keccak256(abi.encodePacked(specifier)))+tokensMinted[specifier];

        reserveToken.approve(address(bondage), numReserve);
        bondage.bond(address(this), specifier, numDots);

        NFTTokenInterface(curves[specifier]).mint(msg.sender, id);
       // NFTTokenInterface(curves[specifier]).setURI(id,whitelisting[msg.sender][specifier]);
        //whitelisting[msg.sender][specifier]="";

        emit Bonded(specifier, numDots, msg.sender);

    }
    event Unbonded(bytes32 indexed specifier, uint256 indexed numDots, address indexed sender); 

    //whether this contract holds tokens or coming from msg.sender,etc
    function unbond(bytes32 specifier, uint tokenID) public {
        uint numDots=curvesTokenPrice[specifier];
        bondage = BondageInterface(coord.getContract("BONDAGE"));
        uint issued = bondage.getDotsIssued(address(this), specifier);

        currentCost = CurrentCostInterface(coord.getContract("CURRENT_COST"));
        uint reserveCost = currentCost._costOfNDots(address(this), specifier, issued + 1 - numDots, numDots - 1);
       
        //unbond dots
        bondage.unbond(address(this), specifier, numDots);
        //burn dot backed token
        NFTTokenInterface  curveToken = NFTTokenInterface(curves[specifier]);
        require(curveToken.ownerOf(tokenID) == msg.sender,"token must be owned by sender");
        curveToken.burnFrom( tokenID);

        require(reserveToken.transfer(msg.sender, reserveCost), "Error: Transfer failed");
        emit Unbonded(specifier, numDots, msg.sender);

    }

    function newToken(
        string  memory name,
        string memory symbol
    ) 
        public
        onlyOwner
        returns (address tokenAddress) 
    {
        NFTTokenInterface token = tokenFactory.create(name, symbol);
        tokenAddress = address(token);
        return tokenAddress;
    }

    function getTokenAddress(bytes32 endpoint) public view returns(address) {
        RegistryInterface registry = RegistryInterface(coord.getContract("REGISTRY"));
       // console.log(registry.getProviderParameter(address(this), endpoint));
        return toAddress(registry.getProviderParameter(address(this), endpoint),0);
    }

    function getEndpoints() public view returns(bytes32[] memory ){
      return curves_list;
    }

    // https://ethereum.stackexchange.com/questions/884/how-to-convert-an-address-to-bytes-in-solidity
    function toBytes(address x) public pure returns (bytes memory b) {
        b = new bytes(20);
        for (uint i = 0; i < 20; i++)
            b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
    }

    //https://ethereum.stackexchange.com/questions/2519/how-to-convert-a-bytes32-to-string
    function bytes32ToString(bytes32 x) public pure returns (string memory) {
        bytes memory bytesString = new bytes(32);

        bytesString = abi.encodePacked(x);

        return string(bytesString);
    }

    
    function toAddress(bytes memory _bytes, uint256 _start) internal view returns (address) {
        require(_start + 20 >= _start, "toAddress_overflow");
        //console.log(_bytes.length);
        require(_bytes.length >= _start + 20, "toAddress_outOfBounds");
        address tempAddress;

        assembly {
            tempAddress := div(mload(add(add(_bytes, 0x20), _start)), 0x1000000000000000000000000)
        }

        return tempAddress;
    }

}
