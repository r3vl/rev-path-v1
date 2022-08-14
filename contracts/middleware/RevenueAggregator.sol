// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

contract RevenueAggregator {
    // can we not have a function that withdraws for both ETH and ERC20s?

    /** @notice Emits when a withdrawal takes place
     * @param path The address of the revenue path
     * @param status Whether the withdrawal suceeded
     */
    // should we not stick to ReleaseStatus? also, status is an arg, what about simply Released?
    // (although i see how a failed Release should not be a released. maybe then 2 events, Released and ReleasedFailed?)
    // also, add the ERC20 address and amount to the event so that we can track these specifically? (not sure about this tbh)
    event WithdrawStatus(address indexed path, bool indexed status, bytes result);

    /** @notice Batch withdrawal request for ETH across revenue paths
     * @param paths List of revenue paths
     * @param targetWallet The wallet for which the withdrawal is being made
     */
    function withdrawPathEth(address[] calldata paths, address targetWallet) external {
        uint256 pathLength = paths.length;

        for (uint256 i = 0; i < pathLength; i++) {
            require(paths[i] != address(0), "ZERO_ADDRESS_CAN_NOT_BE_CONTRACT");
            (bool status, bytes memory result) = address(paths[i]).call(
                abi.encodeWithSignature("release(address)", targetWallet)
            );
            emit WithdrawStatus(paths[i], status, result);
        }
    }

    /** @notice Batch withdrawal request for ERC20 across revenue paths
     * @param paths List of revenue paths
     * @param targetWallet The wallet for which the withdrawal is being made
     * @param tokenAddress The ERC20 token for which the request is being made.
     */
    function withdrawPathErc20(address[] calldata paths, address targetWallet, address tokenAddress) external {
        uint256 pathLength = paths.length;

        for (uint256 i = 0; i < pathLength; i++) {
            require(paths[i] != address(0), "ZERO_ADDRESS_CAN_NOT_BE_CONTRACT");
            (bool status, bytes memory result) = address(paths[i]).call(
                abi.encodeWithSignature("releaseERC20(address,address)",tokenAddress, targetWallet)
            );
            // so, we allow partial withdrawal? This is nice as you can pass a path
            // that doesn't have funding currently, but i'd argue that the result should be predictable
            // and that everything should fail if one fails
            emit WithdrawStatus(paths[i], status, result);
        }
    }
}
