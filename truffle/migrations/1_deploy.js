const SeedToken = artifacts.require("SeedToken");
const Voting = artifacts.require("Voting");
 
module.exports = async function(deployer, _network, accounts) {
	await deployer.deploy(SeedToken);
	const seedToken = await SeedToken.deployed();

	await deployer.deploy(Voting, seedToken.address);
	
	//const voting = await Voting.deployed();

};
