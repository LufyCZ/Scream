// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

/// @dev brief interface for entering SUSHI bar (xSUSHI).
interface ISushiBarEnter { 
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function enter(uint256 amount) external;
}

/// @dev brief interface for depositing into CREAM lending pool.
interface ICream {
    function mint(uint256 mintAmount) external;
    function transfer(address dst, uint256 amount) external;
    function balanceOf(address owner) external returns (uint256 amount);
}

/// @dev contract that batches SUSHI staking into CREAM xSUSHI (crXSUSHI).
contract Scream {
     // SUSHI token contract
    ISushiBarEnter constant sushiToken = ISushiBarEnter(0x6B3595068778DD592e39A122f4f5a5cF09C90fE2);
     // xSUSHI staking contract for SUSHI
    ISushiBarEnter constant sushiBar = ISushiBarEnter(0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272);
     // CREAM lending pool contract for xSUSHI staking into crXSUSHI
    ICream constant crXSUSHI = ICream(0x228619CCa194Fbe3Ebeb2f835eC1eA5080DaFbb2);

    constructor() public {
         // max approve `sushiBar` spender to stake SUSHI into xSUSHI from this contract
        sushiToken.approve(address(sushiBar), type(uint256).max);
         // max approve `cream` spender to stake xSUSHI into crXSUSHI from this contract
        sushiBar.approve(address(crXSUSHI), type(uint256).max);
    }
    
    /// @dev stake `amount` SUSHI into crXSUSHI by batching calls to `sushiBar` and `cream` lending pool.
    function scream(uint256 amount) external {
        sushiToken.transferFrom(msg.sender, address(this), amount); // deposit caller SUSHI `amount` into this contract
        sushiBar.enter(amount); // stake deposited SUSHI `amount` into xSUSHI
        crXSUSHI.mint(sushiBar.balanceOf(address(this))); // stake resulting xSUSHI into crXSUSHI
        crXSUSHI.transfer(msg.sender, crXSUSHI.balanceOf(address(this))); // send to caller
    }
    
    /// @dev stake `amount` SUSHI into crXSUSHI for benefit of `to` by batching calls to `sushiBar` and 'cream' lending pool.
    function screamAt(address to, uint256 amount) external {
        sushiToken.transferFrom(msg.sender, address(this), amount); // deposit caller SUSHI `amount` into this contract
        sushiBar.enter(amount); // stake deposited SUSHI `amount` into xSUSHI
        crXSUSHI.mint(sushiBar.balanceOf(address(this))); // stake resulting xSUSHI into crXSUSHI
        crXSUSHI.transfer(to, crXSUSHI.balanceOf(address(this))); // send to dest
    }
}