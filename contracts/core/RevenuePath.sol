// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/proxy/utils/Initializable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

/*******************************
 * @title Revenue Path V1
 * @notice The revenue path clone instance contract.
 */

contract RevenuePath is Ownable, Initializable {
    uint256 public constant BASE = 1e4; // this is not clear to me

    //@notice Addres of platform wallet to collect fees
    address private platformFeeWallet;

    //@notice Status to flag if fee is applicable to the revenue paths
    // what about feeEnabled?
    bool private feeRequired;

    //@notice Status to flag if revenue path is immutable. True if immutable
    bool private isImmutable;

    //@notice Fee percentage that will be applicable for additional tiers
    uint88 private platformFee;

    //@notice Current ongoing tier for eth distribution, in case multiple tiers are added
    uint256 private currentTier;

    //@noitce Total fee accumulated by the revenue path and waiting to be collected.
    uint256 private feeAccumulated;

    //@notice Total ETH that has been released/withdrawn by the revenue path members
    uint256 private totalReleased;

    // What do we need a name for? Could be fetched from the events instead
    string private name;

    /// ETH

    // @notice ETH revenue waiting to be collected for a given address
    mapping(address => uint256) private ethRevenuePending;

    /** @notice For a given tier & address, the eth revenue distribution proportion is returned
     *  @dev Index for tiers starts from 0. i.e, the first tier is marked 0 in the list.
     */
    mapping(uint256 => mapping(address => uint256)) private revenueProportion;

    // @notice Amount of ETH release for a given address
    mapping(address => uint256) private released;

    // @notice Total amount of ETH distributed for a given tier at that time.
    mapping(uint256 => uint256) private totalDistributed;

    /// ERC20
    // @notice ERC20 revenue share/proportion for a given address
    // does this allow for different proportions for different tokens?
    mapping(address => uint256) private erc20RevenueShare;

    /**  @notice For a given token & wallet address, the amount of the token that has been released
    . erc20Released[token][wallet]*/
    mapping(address => mapping(address => uint256)) private erc20Released;

    // @notice Total ERC20 released from the revenue path for a given token address
    mapping(address => uint256) private totalERC20Released;

    struct Revenue {
        uint256 limitAmount;
        address[] walletList;
    }

    struct PathInfo {
        uint88 platformFee;
        address platformWallet;
        bool isImmutable;
        string name;
    }

    Revenue[] revenueTiers;

    /********************************
     *           EVENTS              *
     ********************************/

    /** @notice Emits when incoming ETH is distributed among members
     * @param amount The amount of eth that has been distributed in a tier
     * @param distributionTier the tier index at which the distribution is being done.
     * @param walletList the list of wallet addresses for which ETH has been distributed
     */
    event EthDistributed(uint256 indexed amount, uint256 indexed distributionTier, address[] walletList);

    /** @notice Emits when ETH payment is withdrawn/claimed by a member
     * @param account The wallet for which ETH has been claimed for
     * @param payment The amount of ETH that has been paid out to the wallet
     */
    event PaymentReleased(address indexed account, uint256 indexed payment);

    /** @notice Emits when ERC20 payment is withdrawn/claimed by a member
     * @param token The token address for which withdrawal is made
     * @param account The wallet address to which withdrawal is made
     * @param payment The amount of the given token the wallet has claimed
     */
    event ERC20PaymentReleased(address indexed token, address indexed account, uint256 indexed payment);

    event RevenueTiersAdded(
        address[][] addedWalletLists,
        uint256[][] addedDistributionLists,
        uint256 indexed newTiersCount
    );

    event RevenueTiersUpdated(
        address[] updatedWalletList,
        uint256[] updatedDistributionLists,
        uint256 indexed updatedTierNumber,
        uint256 indexed newLimit
    );

    event ERC20RevneuUpdated(address[] updatedWalletLists, uint256[] updatedDistributionLists);

    /********************************
     *           MODIFIERS          *
     ********************************/
    /** @notice Entrant guard for mutable contract methods
     */
    // why not whenMutable?
    modifier isAllowed() {
        // require(!isImmutable, "IMMUTABLE_PATH_CAN_NOT_USE_THIS");
        if (isImmutable) {
            revert RevenuePathNotMutable();
        }
        _;
    }

    /********************************
     *           ERRORS          *
     ********************************/

    /** @dev Reverts when passed wallet list and distribution list length is not equal
     * @param walletCount Length of wallet list
     * @param distributionCount Length of distribution list
     */
    error WalletAndDistributionCountMismatch(uint256 walletCount, uint256 distributionCount);

    /** @dev Reverts when passed wallet list and tier limit count doesn't add up.
       The tier limit count should be 1 less than wallet list
     * @param walletCount  Length of wallet list
     * @param tierLimitCount Length of tier limit list
     */
    error WalletAndTierLimitMismatch(uint256 walletCount, uint256 tierLimitCount);

    /** @dev Reverts when zero address is assigned
     */
    error ZeroAddressProvided();

    /** @dev Reverts when limit is not greater than already distributed amount for the given tier
     * @param alreadyDistributed The amount of ETH that has already been distributed for that tier
     * @param proposedNewLimit The amount of ETH proposed to be added/updated as limit for the given tier
     */
    error LimitNotGreaterThanTotalDistributed(uint256 alreadyDistributed, uint256 proposedNewLimit);

    /** @dev Reverts when the tier is not eligible for being updated.
      Requested tier for update must be greater than or equal to current tier.
     * @param currentTier The ongoing tier for distribution
     * @param requestedTier The tier which is requested for an update
     */
    error IneligibileTierUpdate(uint256 currentTier, uint256 requestedTier);

    /** @dev Reverts when the member has zero ETH withdrawal balance available
     */
    error InsufficientWithdrawalBalance();
    /** @dev Reverts when the member has zero percentage shares for ERC20 distribution
     */
    error ZeroERC20Shares(address wallet);

    /** @dev Reverts when wallet has no due ERC20 available for withdrawal
     * @param wallet The member's wallet address
     * @param tokenAddress The requested token address
     */
    error NoDueERC20Payment(address wallet, address tokenAddress);

    /** @dev Reverts when immutable path attempts to use mutable methods
     */
    error RevenuePathNotMutable();

    /** @dev Reverts when contract has insufficient ETH for withdrawal
     * @param contractBalance  The total balance of ETH available in the contract
     * @param requiredAmount The total amount of ETH requested for withdrawal
     */
    error InsufficentBalance(uint256 contractBalance, uint256 requiredAmount);

    error TotalShareNotHundred();

    /********************************
     *           FUNCTIONS           *
     ********************************/

    /** @notice Contract ETH receiver, triggers distribution. Called when ETH is transferred to the revenue path.
     */
    receive() external payable {
        distributeHoldings(msg.value, currentTier);
    }

    /** @notice The initializer for revenue path, directly called from the RevenueMain contract.._
     * @param _walletList A nested array list of member wallets
     * @param _distribution A nested array list of distribution percentages
     * @param _tierLimit A list of tier limits
     * @param pathInfo The basic info related to the path
     * @param _owner The owner of the revenue path
     */

    function initialize(
        address[][] memory _walletList,
        uint256[][] memory _distribution,
        uint256[] memory _tierLimit,
        PathInfo memory pathInfo,
        address _owner
    ) external initializer {
        if (_walletList.length != _distribution.length) {
            revert WalletAndDistributionCountMismatch({
                walletCount: _walletList.length,
                distributionCount: _distribution.length
            });
        }
        // can you not have a length smaller than the tierLimit?
        if ((_walletList.length - 1) != _tierLimit.length) {
            revert WalletAndTierLimitMismatch({ walletCount: _walletList.length, tierLimitCount: _tierLimit.length });
        }

        uint256 listLength = _walletList.length;
        uint256 i;
        uint256 j;
        for (i = 0; i < listLength;) {
            Revenue memory tier;

            uint256 walletMembers = _walletList[i].length;
            tier.walletList = _walletList[i];
            if (i != listLength - 1) {
                tier.limitAmount = _tierLimit[i];
            }
            uint256 totalShare;
            for (j = 0; j < walletMembers; ) {
                // what do the parenthesis around _distribution[i] do?
                revenueProportion[i][(_walletList[i])[j]] = (_distribution[i])[j];
                totalShare += (_distribution[i])[j];
                unchecked {
                    j++;
                }
            }
            if (totalShare != BASE) {
                revert TotalShareNotHundred();
            }
            revenueTiers.push(tier);

            unchecked {
                i++;
            }
        }

        uint256 erc20WalletMembers = _walletList[listLength - 1].length;
        for (uint256 k = 0; k < erc20WalletMembers; ) {
            erc20RevenueShare[(_walletList[listLength - 1])[k]] = (_distribution[listLength - 1])[k];
            unchecked {
                k++;
            }
        }

        if (revenueTiers.length > 1) {
            feeRequired = true;
        }
        // do we need to set these before feeRequired is true?
        platformFeeWallet = pathInfo.platformWallet;
        platformFee = pathInfo.platformFee;
        isImmutable = pathInfo.isImmutable;
        name = pathInfo.name;
        _transferOwnership(_owner);
    }

    /** @notice Adds multiple revenue tiers. Only for mutable revenue path
     * @param _walletList A nested array list of member wallets
     * @param _distribution A nested array list of distribution percentages
     * @param previousTierLimit A list of tier limits, starting with the current last tier's new limit.
     */
    function addRevenueTier(
        address[][] calldata _walletList,
        uint256[][] calldata _distribution,
        uint256[] calldata previousTierLimit
    ) external isAllowed onlyOwner {
        if (_walletList.length != _distribution.length) {
            revert WalletAndDistributionCountMismatch({
                walletCount: _walletList.length,
                distributionCount: _distribution.length
            });
        }

        uint256 listLength = _walletList.length;
        uint256 nextRevenueTier = revenueTiers.length;
        for (uint256 i = 0; i < listLength; ) {
            if (previousTierLimit[i] < totalDistributed[nextRevenueTier - 1]) {
                revert LimitNotGreaterThanTotalDistributed({
                    alreadyDistributed: totalDistributed[nextRevenueTier - 1],
                    proposedNewLimit: previousTierLimit[i]
                });
            }

            Revenue memory tier;
            uint256 walletMembers = _walletList[i].length;

            if (walletMembers != _distribution[i].length) {
                revert WalletAndDistributionCountMismatch({
                    walletCount: walletMembers,
                    distributionCount: _distribution[i].length
                });
            }
            revenueTiers[nextRevenueTier - 1].limitAmount = previousTierLimit[i];
            tier.walletList = _walletList[i];
            uint256 totalShares;
            for (uint256 j = 0; j < walletMembers; j++) {
                revenueProportion[nextRevenueTier][(_walletList[i])[j]] = (_distribution[i])[j];
                totalShares += (_distribution[i])[j];
            }

            if (totalShares != BASE) {
                revert TotalShareNotHundred();
            }
            revenueTiers.push(tier);
            nextRevenueTier += 1;

            unchecked {
                i++;
            }
        }
        if (!feeRequired) {
            feeRequired = true;
        }

        emit RevenueTiersAdded(_walletList, _distribution, revenueTiers.length);
    }

    /** @notice Update given revenue tier. Only for mutable revenue path
     * @param _walletList A list of member wallets
     * @param _distribution A list of distribution percentages
     * @param newLimit The new limit of the requested tier
     * @param tierNumber The tier index for which update is being requested.
     */
    function updateRevenueTier(
        address[] calldata _walletList,
        uint256[] calldata _distribution,
        uint256 newLimit,
        uint256 tierNumber
    ) external isAllowed onlyOwner {
        if (tierNumber < currentTier || tierNumber > (revenueTiers.length - 1)) {
            revert IneligibileTierUpdate({ currentTier: currentTier, requestedTier: tierNumber });
        }

        if (newLimit < totalDistributed[tierNumber]) {
            revert LimitNotGreaterThanTotalDistributed({
                alreadyDistributed: totalDistributed[tierNumber],
                proposedNewLimit: newLimit
            });
        }

        if (_walletList.length != _distribution.length) {
            revert WalletAndDistributionCountMismatch({
                walletCount: _walletList.length,
                distributionCount: _distribution.length
            });
        }

        revenueTiers[tierNumber].limitAmount = (tierNumber == revenueTiers.length - 1) ? 0 : newLimit;

        uint256 listLength = _walletList.length;
        uint256 totalShares;
        for (uint256 i = 0; i < listLength;) {
            revenueProportion[tierNumber][_walletList[i]] = _distribution[i];
            totalShares += _distribution[i];
            unchecked {
                 i++;
            }
        }

        if (totalShares != BASE) {
            revert TotalShareNotHundred();
        }

        emit RevenueTiersUpdated(_walletList, _distribution, tierNumber, newLimit);
    }

    /** @notice Update ERC20 revenue distribution. Only for mutable revenue path
     * @param _walletList A list of member wallets
     * @param _distribution A list of distribution percentages
     */
    function updateErc20Distrbution(address[] calldata _walletList, uint256[] calldata _distribution)
        external
        isAllowed
        onlyOwner
    {
        if (_walletList.length != _distribution.length) {
            revert WalletAndDistributionCountMismatch({
                walletCount: _walletList.length,
                distributionCount: _distribution.length
            });
        }

        uint256 listLength = _walletList.length;
        uint256 totalShares;
        for (uint256 i = 0; i < listLength; ) {
            erc20RevenueShare[_walletList[i]] = _distribution[i];
            totalShares += _distribution[i];
            unchecked {
                i++;
            }
        }

        if (totalShares != BASE) {
            revert TotalShareNotHundred();
        }

        emit ERC20RevneuUpdated(_walletList, _distribution);
    }

    /** @notice Releases distributed ETH for the provided address
     * @param account The member's wallet address
     */
    function release(address payable account) external {
        if (ethRevenuePending[account] == 0) {
            revert InsufficientWithdrawalBalance();
        }

        if (feeAccumulated > 0) {
            uint256 value = feeAccumulated;
            feeAccumulated = 0;
            // would it not be useful to has totalFeeReleased as well?
            totalReleased += value;
            sendValue(payable(platformFeeWallet), value);
        }

        uint256 payment = ethRevenuePending[account];
        released[account] += payment;
        totalReleased += payment;
        ethRevenuePending[account] = 0;

        sendValue(account, payment);
        emit PaymentReleased(account, payment);
    }

    /** @notice Releases allocated ERC20 for the provided address
     * @param token The address of the ERC20 token
     * @param account The member's wallet address
     */
    function releaseERC20(address token, address account) external {
        if (erc20RevenueShare[account] == 0) {
            revert ZeroERC20Shares({ wallet: account });
        }

        uint256 totalReceived = IERC20(token).balanceOf(address(this)) + totalERC20Released[token];
        uint256 payment = ((totalReceived * erc20RevenueShare[account]) / BASE) - erc20Released[token][account];

        if (payment <= 0) {
            revert NoDueERC20Payment({ wallet: account, tokenAddress: token });
        }

        erc20Released[token][account] += payment;
        totalERC20Released[token] += payment;

        IERC20(token).transfer(account, payment);
        emit ERC20PaymentReleased(token, account, payment);
    }

    /** @notice Get the limit amoutn & wallet list for a given revenue tier
     * @param tierNumber the index of the tier for which list needs to be provided.
     */
    function getRevenueTier(uint256 tierNumber)
        external
        view
        returns (uint256 _limitAmount, address[] memory _walletList)
    {
        uint256 limit = revenueTiers[tierNumber].limitAmount;
        address[] memory listWallet = revenueTiers[tierNumber].walletList;
        return (limit, listWallet);
    }

    /** @notice Get the totalNumber of revenue tiers in the revenue path
     */
    function getTotalRevenueTiers() external view returns (uint256 total) {
        return revenueTiers.length;
    }

    /** @notice Get the current ongoing tier of revenue path
     */
    function getCurrentTier() external view returns (uint256 tierNumber) {
        return currentTier;
    }

    /** @notice Get the current ongoing tier of revenue path
     */
    function getFeeRequirementStatus() external view returns (bool required) {
        return feeRequired;
    }

    /** @notice Get the pending eth balance for given address
     */
    function getPendingEthBalance(address account) external view returns (uint256 pendingAmount) {
        return ethRevenuePending[account];
    }

    /** @notice Get the ETH revenue proportion for a given account at a given tier
     */
    function getRevenueProportion(uint256 tier, address account) external view returns (uint256 proportion) {
        return revenueProportion[tier][account];
    }

    /** @notice Get the amount of ETH distrbuted for a given tier
     */

    function getTierDistributedAmount(uint256 tier) external view returns (uint256 amount) {
        return totalDistributed[tier];
    }

    /** @notice Get the amount of ETH accumulated for fee collection
     */

    function getTotalFeeAccumulated() external view returns (uint256 amount) {
        return feeAccumulated;
    }

    /** @notice Get the amount of ETH accumulated for fee collection
     */

    function getERC20Released(address token, address account) external view returns (uint256 amount) {
        return erc20Released[token][account];
    }

    /** @notice Get the platform wallet address
     */
    function getPlatformWallet() external view returns (address) {
        return platformFeeWallet;
    }

    /** @notice Get the platform fee percentage
     */
    function getPlatformFee() external view returns (uint256) {
        return platformFee;
    }

    /** @notice Get the revenue path Immutability status
     */
    function getImmutabilityStatus() external view returns (bool) {
        return isImmutable;
    }

    /** @notice Get the total amount of eth withdrawn from revenue path
     */
    function getTotalEthReleased() external view returns (uint256) {
        return totalReleased;
    }

    /** @notice Get the revenue path name.
     */
    function getRevenuePathName() external view returns (string memory) {
        return name;
    }

    /** @notice Get the amount of total eth withdrawn by the account
     */
    function getEthWithdrawn(address account) external view returns (uint256) {
        return released[account];
    }

    /** @notice Get the erc20 revenue share percentage for given account
     */
    function getErc20WalletShare(address account) external view returns (uint256) {
        return erc20RevenueShare[account];
    }

    /** @notice Get the total erc2o released from the revenue path.
     */
    function getTotalErc20Released(address token) external view returns (uint256) {
        return totalERC20Released[token];
    }

    /** @notice Transfer handler for ETH
     * @param recipient The address of the receiver
     * @param amount The amount of ETH to be received
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        if (address(this).balance < amount) {
            revert InsufficentBalance({ contractBalance: address(this).balance, requiredAmount: amount });
        }

        (bool success, ) = recipient.call{ value: amount }("");
        require(success, "ETH_TRANSFER_FAILED");
    }

    /** @notice Distributes ETH based on the required conditions of the tier sequences
     * @param amount The amount of ETH to be distributed
     * @param presentTier The current tier for which distribution will take place.
     * I wouldn't mind an plain english explanation of the logic here
     * distribute to current tier the remaining available amount, and delegate the rest to the next tier
     *
     */

    function distributeHoldings(uint256 amount, uint256 presentTier) private {
        uint256 currentTierDistribution = amount;
        uint256 nextTierDistribution;

        if (
            totalDistributed[presentTier] + amount > revenueTiers[presentTier].limitAmount &&
            revenueTiers[presentTier].limitAmount > 0
        ) {
            currentTierDistribution = revenueTiers[presentTier].limitAmount - totalDistributed[presentTier];
            nextTierDistribution = amount - currentTierDistribution;
        }

        uint256 totalDistributionAmount = currentTierDistribution;

        if (platformFee > 0 && feeRequired) {
            uint256 feeDeduction = ((currentTierDistribution * platformFee) / BASE);
            feeAccumulated += feeDeduction;
            currentTierDistribution -= feeDeduction;
        }

        uint256 totalMembers = revenueTiers[presentTier].walletList.length;

        for (uint256 i = 0; i < totalMembers; ) {
            address wallet = revenueTiers[presentTier].walletList[i];
            ethRevenuePending[wallet] += ((currentTierDistribution * revenueProportion[presentTier][wallet]) / BASE);
            unchecked {
                i++;
            }
        }

        totalDistributed[presentTier] += totalDistributionAmount;

        emit EthDistributed(currentTierDistribution, presentTier, revenueTiers[presentTier].walletList);

        if (nextTierDistribution > 0) {
            currentTier += 1;
            return distributeHoldings(nextTierDistribution, currentTier);
        }
    }
}
