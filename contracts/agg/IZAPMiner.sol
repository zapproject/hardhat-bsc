// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16;

interface IZAPMiner{
    function retrieveData(uint256 _requestId, uint256 _timestamp)
        external
        view
        returns (uint256);

    function isInDispute(uint _requestId, uint _timestamp)
    external
    view
    returns(bool);

    function getNewValueCountbyRequestId(uint _requestId)
    external
    view
    returns(uint);

    function getTimestampbyRequestIDandIndex(uint _requestID, uint _index)
    external
    view
    returns(uint);
}