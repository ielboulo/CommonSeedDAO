// SPDX-License-Identifier: MIT

/// @title  SeedToken
/// @author Ilham EL BOULOUMI
/// @dev    SeedToken : Smart Contract qui mint les tokens de gouvernance de la DAO.

pragma solidity 0.8.19;
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract SeedToken is ERC20, Ownable {

    uint256 constant MIN_GOVERNANCE_TOKENS = 1000;
    uint256 public holdersCount;
    mapping(address => bool) private _holders;


    constructor() ERC20("SEED", "SDC") {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Mint 1 Billion of Seed tokens | 10^18 
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override 
    {
        require(amount > 0, "SEED Token: amount must be > 0 !");
        super._beforeTokenTransfer(from, to, amount);
        
        // check unity : decimals / unité TODO 
        if (!_holders[from] && balanceOf(from) >= MIN_GOVERNANCE_TOKENS)  // TODO : remove restriction 
        {
            _holders[from] = true;
            holdersCount++;
        } else if (_holders[from] && (balanceOf(from) - amount ) < MIN_GOVERNANCE_TOKENS) 
        {
            _holders[from] = false;
            holdersCount--;
        }

        if (!_holders[to] && (balanceOf(to) + amount) >= MIN_GOVERNANCE_TOKENS) 
        {
            _holders[to] = true;
            holdersCount++;
        } 
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(amount > 0, "SEED Token: amount must be > 0 !");
        super._afterTokenTransfer(from, to, amount);
    }
}