// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/proxy/Clones.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "./RevenuePath.sol";

contract ReveelMain is Ownable {

    uint256 platformFee;
    address platformWallet;

    RevenuePath[] public revenuePaths;
    event RevenuePathCreated(RevenuePath metaCoin);

    address public libraryAddress;

    constructor(address _libraryAddress) {
        libraryAddress = _libraryAddress;
    }

    function setLibraryAddress(address _libraryAddress) external onlyOwner {
        libraryAddress = _libraryAddress;
    }

    function setPlatformFee(uint256 newFee) external onlyOwner {
        platformFee = newFee;

    }

    function createRevenuePath(
        address[] memory _walletList,
        uint256[] memory _distribution
    ) external {
        RevenuePath path = RevenuePath(payable( Clones.clone(libraryAddress)));
        path.initialize( _walletList,
        _distribution,
        platformFee,
        platformWallet);

        revenuePaths.push(path);
        emit RevenuePathCreated(path);
    }

    function getPaths() external view returns (RevenuePath[] memory) {
        return revenuePaths;
    }
}
