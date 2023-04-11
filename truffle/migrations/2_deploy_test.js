// 3_test_deploy_contracts.js

const MockToken = artifacts.require("MockToken");

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

	// --------------
	// Vote For Unlock Funds 
	  // Deploy VoteUnlockFunds contract with SeedToken, ProjectInfo, and FundraisingProjects addresses as constructor arguments
	await deployer.deploy(VoteUnlockFunds, projectInfoInstance.address, fundraisingProjectsInstance.address);
	const voteUnlockFundsInstance = await VoteUnlockFunds.deployed();
};
