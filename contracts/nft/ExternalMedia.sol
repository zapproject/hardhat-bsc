pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/introspection/ERC165StorageUpgradeable.sol'; // exposes _registerInterface
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

import {SafeMath} from '@openzeppelin/contracts/utils/math/SafeMath.sol';
import {Math} from '@openzeppelin/contracts/utils/math/Math.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {Counters} from '@openzeppelin/contracts/utils/Counters.sol';
import {EnumerableSet} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {IMarket} from './interfaces/IMarket.sol';
import {IMedia} from './interfaces/IMedia.sol';
import {Ownable} from './Ownable.sol';
import {MediaGetter} from './MediaGetter.sol';
import {MediaStorage} from './libraries/MediaStorage.sol';
import './libraries/Constants.sol';

/**
 * @title A media value system, with perpetual equity to creators
 * @notice This contract provides an interface to mint media with a market
 * owned by the creator.
 */
contract ExternalMedia is
    IMedia,
    ERC721BurnableUpgradeable,
    ReentrancyGuardUpgradeable,
    Ownable,
    MediaGetter,
    ERC721URIStorageUpgradeable,
    ERC721EnumerableUpgradeable,
    ERC165StorageUpgradeable
{
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.UintSet;
    using SafeMath for uint256;

     

}