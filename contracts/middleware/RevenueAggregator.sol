// SPDX-License-Identifier: SPWPL

pragma solidity 0.8.9;

contract RevenueAggregator {
    /** @notice Emits when a withdrawal takes place
     * @param path The address of the revenue path
     * @param status Whether the withdrawal suceeded
     */
    event WithdrawStatus(address indexed path, bool indexed status, bytes result);

    /** @notice Batch withdrawal request for ETH across revenue paths
     * @param paths List of revenue paths
     * @param targetWallet The wallet for which the withdrawal is being made
     */
    function withdrawPathEth(address[] calldata paths, address targetWallet) external {
        uint256 pathLength = paths.length;

        for (uint256 i = 0; i < pathLength; ) {
            require(paths[i] != address(0), "ZERO_ADDRESS_CAN_NOT_BE_CONTRACT");
            (bool status, bytes memory result) = address(paths[i]).call(
                abi.encodeWithSignature("release(address)", targetWallet)
            );
            
            emit WithdrawStatus(paths[i], status, result);
            unchecked{i++;}
        }
    }

    /** @notice Batch withdrawal request for ERC20 across revenue paths
     * @param paths List of revenue paths
     * @param targetWallet The wallet for which the withdrawal is being made
     * @param tokenAddress The ERC20 token for which the request is being made.
     */
    function withdrawPathErc20(
        address[] calldata paths,
        address targetWallet,
        address tokenAddress
    ) external {
        uint256 pathLength = paths.length;

        for (uint256 i = 0; i < pathLength; ) {
            require(paths[i] != address(0), "ZERO_ADDRESS_CAN_NOT_BE_CONTRACT");
            (bool status, bytes memory result) = address(paths[i]).call(
                abi.encodeWithSignature("releaseERC20(address,address)", tokenAddress, targetWallet)
            );
            
            emit WithdrawStatus(paths[i], status, result);
            unchecked{i++;}
            
        }
    }
}
