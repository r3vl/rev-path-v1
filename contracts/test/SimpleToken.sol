// SPDX-License-Identifier: SPWPL
pragma solidity ^0.8.9;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

/**
 * @title Dummy token for testing purposes
 */
contract SimpleToken is ERC20 {
    uint8 public constant DECIMALS = 18;
    uint256 public constant INITIAL_SUPPLY = 100000000000000 * (10**uint256(DECIMALS));

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor() ERC20("SimpleToken", "SIM") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}
