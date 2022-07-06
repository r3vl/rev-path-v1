// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
//#TODO: hardlock compiler version
//#TODO: Add Error() - unit test evaluation phase
//#TODO: Add Intializable
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
// import "openzeppelin-solidity/contracts/proxy/utils/Initializable.sol";
 

/**
 * @title Revenue Path V1   
 */

contract RevenuePath is  Ownable  {

    struct Revenue {
        uint256 limitAmount;
        address[] walletList;
    }

    Revenue [] public revenueTiers;
    uint256 platformFee;
    uint256 currentTier;
    bool feeRequired;
    uint256 feeAccumulated;
    uint256 totalDistributed;
    uint256 totalReleased;
    address platformFeeWallet;
    mapping(address => uint256) ethRevenuePending;
    mapping(uint256 => mapping(address => uint256)) revenueProportion;
    mapping(address => uint256) released;
    //ERC20
    mapping(address => uint256) erc20RevenueShare;
    mapping(address => mapping (address => uint256)) erc20Released; //erc20Released[token][wallet]
    mapping (address => uint256) totalERC20Released;

    /********************************
    *           EVENTS              *
    ********************************/

    event EthDistrbuted(uint256 indexed amount, uint256 indexed distributionTier, address[] walletList);
    event PaymentReleased(address indexed account, uint256 indexed payment);
    event ERC20PaymentReleased(address indexed token, address indexed account, uint256 indexed payment);


    /********************************
    *           FUNCTIONS           *
    ********************************/
    function initialize(
        address[] memory _walletList,
        uint256[] memory _distribution,
        uint256 _platformFee,
        address _platformFeeWallet


    ) public {

        require(_walletList.length == _distribution.length, "WALLET_DISTRIBUTION_LIST_MUST_BE_EQUAL");
        require(_platformFeeWallet != address(0), "ZERO_ADDRESS_NOT_ALLOWED");

        Revenue memory tier;

         
        uint256 listLength = _walletList.length;
        tier.walletList = _walletList;

        for(uint256 i=0; i<listLength;i++){
            revenueProportion[currentTier][_walletList[i]] = _distribution[i];
            erc20RevenueShare[_walletList[i]] = _distribution[i];
        }
        
        revenueTiers.push(tier);

        platformFeeWallet = _platformFeeWallet;
        platformFee = _platformFee;
    }

    function addRevenueTier(
        address[] calldata _walletList,
        uint256[] calldata _distribution,
        uint256 previousTierLimit ) external onlyOwner{

        require(_walletList.length == _distribution.length, "WALLET_DISTRIBUTION_LIST_MUST_BE_EQUAL");

        Revenue memory tier;
        revenueTiers[revenueTiers.length-1].limitAmount = previousTierLimit;
        revenueTiers[revenueTiers.length-1].walletList = _walletList;
         
        uint256 listLength = _walletList.length;

        for(uint256 i=0; i<listLength;i++){
            revenueProportion[currentTier][_walletList[i]] = _distribution[i];
        }
        
        revenueTiers.push(tier);


    }

    function updateRevenueTier(
        address[] calldata _walletList,
        uint256[] calldata _distribution,
        uint256 newLimit,
        uint256 tierNumber ) external onlyOwner{
        
        require(_walletList.length == _distribution.length, "WALLET_DISTRIBUTION_LIST_MUST_BE_EQUAL");

        
        revenueTiers[tierNumber].limitAmount = newLimit;
        revenueTiers[tierNumber].walletList = _walletList;
         
         
        uint256 listLength = _walletList.length;

        for(uint256 i=0; i<listLength;i++){
           revenueProportion[tierNumber][_walletList[i]] = _distribution[i];
        }
        
        


    }


    function updateErc20Distrbution(
        address[] calldata _walletList,
        uint256[] calldata _distribution
    ) external onlyOwner {

        require(_walletList.length == _distribution.length, "WALLET_DISTRIBUTION_LIST_MUST_BE_EQUAL");

        uint256 listLength = _walletList.length;

        for(uint256 i=0; i<listLength;i++){
            erc20RevenueShare[_walletList[i]] = _distribution[i];
        }


    }


     receive() external payable {

        distributeHoldings(msg.value);

    }


    function release(address payable account) external  {
        require(ethRevenuePending[account] > 0, "NO_SUFFICIENT_WITHDRAWAL_BALANCE");
        
        if(feeAccumulated > 0){
            uint256 value = feeAccumulated;
            feeAccumulated = 0;
            totalReleased+=value;
            sendValue(payable(platformFeeWallet),value);
        }

        uint256 payment = ethRevenuePending[account];
        released[account] += payment;
        totalReleased += payment;

        sendValue(account, payment);
        emit PaymentReleased(account, payment);
    }

    function release(address token, address account) external {
        require(erc20RevenueShare[account] > 0, "ACCOUNT_HAS_NO_SHARES");

        uint256 totalReceived = IERC20(token).balanceOf(address(this)) + totalERC20Released[token];
        uint256 payment = ((totalReceived * erc20RevenueShare[account]) / 100) - erc20Released[token][account];

        require(payment != 0, "ACCOUNT_HAS_NO_DUE_PAYMENT");

        erc20Released[token][account] += payment;
        totalERC20Released[token] += payment;

        // IERC20.transfer(token, account, payment);
        IERC20(token).transfer(account,payment);
        emit ERC20PaymentReleased(token, account, payment);
    }


    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "INSUFFICIENT_BALANCE");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "ETH_TRANSFER_FAILED");
    }


    function distributeHoldings(uint256 amount) private {

        uint256 currentTierDistribution = amount;
        uint256 nextTierDistribution;
        //check distribution that needs to be done in this tier
        if(totalDistributed + amount >revenueTiers[currentTier].limitAmount || revenueTiers[currentTier].limitAmount > 0){
            currentTierDistribution = totalDistributed + amount - revenueTiers[currentTier].limitAmount;
            nextTierDistribution = amount - currentTierDistribution;

        }
        
        //deduct platform fee if applicable
        if(platformFee > 0 && feeRequired){
            uint256 feeDeduction =  (currentTierDistribution*platformFee/100);
            feeAccumulated+= feeDeduction;
            currentTierDistribution-=feeDeduction;
        }
        
        uint256 totalMembers = revenueTiers[currentTier].walletList.length;

        for(uint256 i = 0; i < totalMembers ; i++){

            address wallet = revenueTiers[currentTier].walletList[i];
            ethRevenuePending[wallet] += (currentTierDistribution*revenueProportion[currentTier][wallet]/100);

        }

        totalDistributed+=currentTierDistribution;

        emit EthDistrbuted(currentTierDistribution,currentTier,revenueTiers[currentTier].walletList);

        if(nextTierDistribution > 0 ){
        currentTier+=1;
        return distributeHoldings(nextTierDistribution);
        }


        
     }


}