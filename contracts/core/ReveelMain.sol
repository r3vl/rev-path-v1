// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "openzeppelin-solidity/contracts/proxy/Clones.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "./RevenuePath.sol";

contract ReveelMain is Ownable {
    
    //@notice Fee percentage that will be applicable for additional tiers
    uint256 public platformFee;
    //@notice Addres of platform wallet to collect fees
    address public platformWallet;
    //@notice The list of revenue path contracts
    RevenuePath[] public revenuePaths;
    //@notice The revenue path contract address who's bytecode will be used for cloning
    address public libraryAddress;

    /********************************
     *           EVENTS              *
     ********************************/
    /** @notice Emits when a new revenue path is created
     * @param path The address of the new revenue path
     */
    event RevenuePathCreated(RevenuePath path);
    /** @notice Updates the libaray contract address
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
    constructor(address _libraryAddress, uint256 _platformFee,address _platformWallet) {
        libraryAddress = _libraryAddress;
        platformFee = _platformFee;
        platformWallet = _platformWallet;
    }

    /** @notice Sets the libaray contract address
     * @param _libraryAddress The address of the library contract
     */
    function setLibraryAddress(address _libraryAddress) external onlyOwner {
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
        bool isImmutable
    ) external {
        RevenuePath path = RevenuePath(payable(Clones.clone(libraryAddress)));
        revenuePaths.push(path);

        path.initialize(_walletList, _distribution, tierLimit, platformFee, platformWallet, isImmutable, msg.sender);
        emit RevenuePathCreated(path);
    }

    /** @notice Get the list of revenue paths deployed and count
     */
    function getPaths() external view returns (RevenuePath[] memory, uint256 totalPaths) {
        return (revenuePaths, revenuePaths.length);
    }
}
