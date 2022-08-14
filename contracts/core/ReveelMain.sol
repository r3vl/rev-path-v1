// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "openzeppelin-solidity/contracts/proxy/Clones.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/security/Pausable.sol";
import "./RevenuePath.sol";

contract ReveelMain is Ownable, Pausable {
    //@notice Fee percentage that will be applicable for additional tiers
    uint256 private platformFee;
    //@notice Address of platform wallet to collect fees
    address private platformWallet;
    //@notice The list of revenue path contracts
    RevenuePath[] private revenuePaths;
    //@notice The revenue path contract address who's bytecode will be used for cloning
    address private libraryAddress;

    /********************************
     *           EVENTS              *
     ********************************/
    /** @notice Emits when a new revenue path is created
     * @param path The address of the new revenue path
     */
     // if we index we can then query the name, deploy block etc
    event RevenuePathCreated(RevenuePath indexed path);
    /** @notice Updates the libray contract address
     * @param newLibrary The address of the library contract
     */
    event UpdatedLibraryAddress(address newLibrary);

    /** @notice Updates the platform fee percentage
     * @param newFeePercentage The new fee percentage
     */
    event UpdatedPlatformFee(uint256 newFeePercentage);

    /** @notice Updates the platform fee collecting wallet
     * @param newWallet The new fee collecting wallet
     */
    event UpdatedPlatformWallet(address newWallet);

    /** @notice Intialize the Revenue main contract
     * @param _libraryAddress The revenue path contract address who's bytecode will be used for cloning
     * @param _platformFee The platform fee percentage
     * @param _platformWallet The platform fee collector wallet
     */

    /********************************
     *           EVENTS              *
     ********************************/
    /** @dev Reverts when zero address is assigned
     */
    error ZeroAddressProvided();

    constructor(
        address _libraryAddress,
        uint256 _platformFee,
        address _platformWallet
    ) {
        if (_libraryAddress == address(0) || _platformWallet == address(0)) {
            revert ZeroAddressProvided();
        }

        // Should we not emit platform fee and library update event here?
        libraryAddress = _libraryAddress;
        platformFee = _platformFee;
        platformWallet = _platformWallet;
    }

    /** @notice Sets the libaray contract address
     * @param _libraryAddress The address of the library contract
     */
    function setLibraryAddress(address _libraryAddress) external onlyOwner {
        if (_libraryAddress == address(0)) {
            revert ZeroAddressProvided();
        }
        libraryAddress = _libraryAddress;
        emit UpdatedLibraryAddress(libraryAddress);
    }

    /** @notice Set the platform fee percentage
     * @param newFeePercentage The new fee percentage
     */
    function setPlatformFee(uint256 newFeePercentage) external onlyOwner {
        platformFee = newFeePercentage;
        emit UpdatedPlatformFee(platformFee);
    }

    /** @notice Set the platform fee collecting wallet
     * @param newWallet The new fee collecting wallet
     */
    function setPlatformWallet(address newWallet) external onlyOwner {
        if (newWallet == address(0)) {
            revert ZeroAddressProvided();
        }
        platformWallet = newWallet;
        emit UpdatedPlatformWallet(platformWallet);
    }

    /** @notice Create a new revenue path
     * @param _walletList A nested array of member wallet list
     * @param _distribution A nested array of distribution percentages
     * @param tierLimit A sequential list of tier limit
     * @param isImmutable Set this flag to true if immutable
     */
    function createRevenuePath(
        address[][] memory _walletList,
        uint256[][] memory _distribution,
        uint256[] memory tierLimit,
        // is this necessary?
        string memory _name,
        bool isImmutable
    ) external whenNotPaused {
        RevenuePath path = RevenuePath(payable(Clones.clone(libraryAddress)));
        revenuePaths.push(path);

        RevenuePath.PathInfo memory pathInfo;
        pathInfo.name = _name;
        pathInfo.platformFee = platformFee;
        pathInfo.platformWallet = platformWallet;
        pathInfo.isImmutable = isImmutable;

        path.initialize(_walletList, _distribution, tierLimit, pathInfo, msg.sender);
        emit RevenuePathCreated(path);
    }

    /**
     * @notice Owner can toggle & pause contract
     * @dev emits relevant Pausable events
     */
    function toggleContractState() external onlyOwner {
        if (!paused()) {
            _pause();
        } else {
            _unpause();
        }
    }

    // why do we need this array?
    /** @notice Get the list of revenue paths deployed and count
     */
    function getPaths() external view returns (RevenuePath[] memory, uint256 totalPaths) {
        return (revenuePaths, revenuePaths.length);
    }

    // what about setting the variables to public?
    /** @notice Gets the libaray contract address
     */
    function getLibraryAddress() external view returns (address) {
        return libraryAddress;
    }

    /** @notice Gets the platform fee percentage
     */
    function getPlatformFee() external view returns (uint256) {
        return platformFee;
    }

    /** @notice Gets the platform fee percentage
     */
    function getPlatformWallet() external view returns (address) {
        return platformWallet;
    }
}
