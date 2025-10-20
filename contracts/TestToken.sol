// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * Test ERC20 Token for IntelliQuant Demo
 * Deploy this to Monad testnet for portfolio tracking
 */
contract TestToken is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply * 10**decimals());
    }
    
    // Allow anyone to mint for testing
    function mint(address to, uint256 amount) public {
        _mint(to, amount * 10**decimals());
    }
    
    // Burn function
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
