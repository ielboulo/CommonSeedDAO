// const SimpleStorage = artifacts.require("SimpleStorage");

// module.exports = function (deployer) {
//   deployer.deploy(SimpleStorage);
// };

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
	
	  // Deploy FundraisingProjects contract with SeedToken and ProjectInfo addresses as constructor arguments
	  const  token_USDT_Polygon_address = "0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832";
	  const token_USDT_Goerli_address = "0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49";
	  const token_DAI_Goerli_address = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60";

	  await deployer.deploy(FundraisingProjects, token_DAI_Goerli_address, projectInfoInstance.address);
	  const fundraisingProjectsInstance = await FundraisingProjects.deployed();
	
	  // Deploy VoteUnlockFunds contract with SeedToken, ProjectInfo, and FundraisingProjects addresses as constructor arguments
	  await deployer.deploy(VoteUnlockFunds, projectInfoInstance.address, fundraisingProjectsInstance.address);
	  const voteUnlockFundsInstance = await VoteUnlockFunds.deployed();
	
	//await deployer.deploy(VoteProjectValidation, seedToken.address);
	
	//const voteProjectValidation = await VoteProjectValidation.deployed();

};
