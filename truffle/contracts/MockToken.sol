// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor() ERC20("Mock USDT", "mUSDT") {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Mint initial supply
    }
}
