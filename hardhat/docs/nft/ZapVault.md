# ZapVault
The purpose of ZapVault is to serve as the default address to store the earnings made from an NFT sale using the ZapMedia, ZapMarket, and AuctionHouse contracts. When a sale is made, tokens get transferred here, at which point the owner of the vault may view the current balance or withdraw the tokens into his own address for further usage.

## Methods

### initializeVault(address)
This function creates the initial vault, establishing the owner and Zap token address.
|**Argument**|**Type**|**Description**|
|------|------|------|
|`token`|`address`| Address of the current zap token |

### vaultBalance()
This is a getter function that returns the current ```balance``` of Zap tokens within the smart contract, as transferred by the various NFT contracts
|**Argument**|**Type**|**Description**|
|------|------|------|
| no arguments |

### withdraw(uint256)
This function allows the owner to withdraw a number of tokes up to the smart contract's current balance
|**Argument**|**Type**|**Description**|
|------|------|------|
|`value`|`uint256`| The amount requested for withdrawal|