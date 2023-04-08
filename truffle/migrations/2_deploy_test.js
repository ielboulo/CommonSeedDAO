// 3_test_deploy_contracts.js

const MockToken = artifacts.require("MockToken");
const FundraisingProject = artifacts.require("FundraisingProject");

const SeedToken = artifacts.require("SeedToken");
const ProjectInfo = artifacts.require("ProjectInfo");
const VoteProjectValidation = artifacts.require("VoteProjectValidation");
const FundraisingProjects = artifacts.require("FundraisingProject");
const VoteUnlockFunds = artifacts.require("VoteUnlockFunds");


module.exports = async function(deployer, _network, accounts) {

	await deployer.deploy(SeedToken);
	const seedTokenInstance = await SeedToken.deployed();

	// Get supply and holders count from SeedToken contract
	const supply = await seedTokenInstance.totalSupply();
	const holdersCount = await seedTokenInstance.holdersCount();

	console.log("Seed Token Supply:", supply.toString());
	console.log("Number of Holders:", holdersCount.toString());


	// Deploy ProjectInfo contract
	await deployer.deploy(ProjectInfo);
	const projectInfoInstance = await ProjectInfo.deployed();

	// Deploy VoteProjectValidation contract with SeedToken and ProjectInfo addresses as constructor arguments
	await deployer.deploy(VoteProjectValidation, seedTokenInstance.address, projectInfoInstance.address);
	const voteProjectValidationInstance = await VoteProjectValidation.deployed();

	//// ----------
	// FundraisingProject Test 
    await deployer.deploy(MockToken);
    const mockToken = await MockToken.deployed();

	await deployer.deploy(FundraisingProjects, mockToken.address, projectInfoInstance.address);
	const fundraisingProjectsInstance = await FundraisingProjects.deployed();
  

	// Transfer 10.000 mUSDT to the first 6 accounts
	// const amount = web3.utils.toWei("10000", "ether"); // Convert 10.000 mUSDT to its smallest unit
	// for (let i = 0; i < 6; i++) {
	// 	await mockToken.transfer(accounts[i], amount);
	// }

	// for (let i = 0; i < 6; i++) {
	// 	console.log("balance investor = accounts[i] ", accounts[i] , " balance = ", mockToken.balanceOf(accounts[i]));
	// }

	console.log("mUSDT is here ! ");

	// --------------
	// Vote For Unlock Funds 
	  // Deploy VoteUnlockFunds contract with SeedToken, ProjectInfo, and FundraisingProjects addresses as constructor arguments
	await deployer.deploy(VoteUnlockFunds, projectInfoInstance.address, fundraisingProjectsInstance.address);
	const voteUnlockFundsInstance = await VoteUnlockFunds.deployed();
};
