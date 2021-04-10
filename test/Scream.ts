import { ethers, network } from "hardhat";
import { expect } from "chai";
import { hrtime } from "process";

// Contracts
const SushiBarABI = require('../abis/SushiBar.json');
const SushiTokenABI = require('../abis/SushiToken.json');
const crXSUSHIABI = require('../abis/crXSUSHI.json');

const multisig = "0xe94B5EEC1fA96CEecbD33EF5Baa8d00E4493F4f3"

describe("Scream", function () {
  // Deployed instances
  let sushiBar;
  let sushiToken;
  let crXSUSHI;
  let scream;

  let wallets;
  let wallet1, wallet2, wallet3;

  before(async function() {
    // Set up wallets
    wallets = await ethers.getSigners();
    [wallet1, wallet2, wallet3] = wallets;

    // Load contracts
    sushiBar = await ethers.getContractAt(
      SushiBarABI,
      "0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272"
    );

    sushiToken = await ethers.getContractAt(
      SushiTokenABI,
      "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"  
    );

    crXSUSHI = await ethers.getContractAt(
      crXSUSHIABI,
      "0x228619CCa194Fbe3Ebeb2f835eC1eA5080DaFbb2"
    )

    // Deploy Scream
    scream = await (await ethers.getContractFactory("Scream")).deploy();

    // Steal some Sushi from the treasury
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [multisig]
    });
    const sushiOwner = ethers.provider.getSigner(multisig);
    sushiToken = sushiToken.connect(sushiOwner);

    await wallet1.sendTransaction({
      to: multisig,
      value: ethers.utils.parseEther("1")
    });

    await sushiToken.transfer(wallet1.address, BigInt(1e20));
    await sushiToken.transfer(wallet2.address, BigInt(1e20));
  })
  
  it("Should fail if not approved", async function () {
    await expect(scream.scream(BigInt(1e20)))
      .to.be.revertedWith('ERC20: transfer amount exceeds allowance')
  });

  it("Should give me crXSUSHI if all is good", async function () {
    sushiToken = sushiToken.connect(wallet1);

    await sushiToken.approve(scream.address, BigInt(1e20))

    await scream.scream(BigInt(1e20))

    expect(await crXSUSHI.balanceOf(wallet1.address))
      .to.be.gt(0)
  });

  it("Should give a guy crXSUSHI if all is good", async function () {
    sushiToken = sushiToken.connect(wallet2);
    scream = scream.connect(wallet2);

    await sushiToken.approve(scream.address, BigInt(1e20))

    await scream.screamAt(wallet3.address, BigInt(1e20))

    expect(await crXSUSHI.balanceOf(wallet3.address))
      .to.be.gt(0)
  });
});
