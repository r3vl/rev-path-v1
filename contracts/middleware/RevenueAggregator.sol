// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract RevenueAggregator {
    event WithdrawStatus(address indexed path, bool indexed status, bytes result);

    // constructor() {}

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

    function withdrawPathErc20(address[] calldata paths, address targetWallet, address tokenAddress) external {
        uint256 pathLength = paths.length;

        for (uint256 i = 0; i < pathLength; i++) {
            require(paths[i] != address(0), "ZERO_ADDRESS_CAN_NOT_BE_CONTRACT");
            (bool status, bytes memory result) = address(paths[i]).call(
                abi.encodeWithSignature("release(address,address)",tokenAddress, targetWallet)
            );
            emit WithdrawStatus(paths[i], status, result);
        }
    }
}
