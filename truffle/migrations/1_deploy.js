
/// @title  Script of deployment
/// @author Ilham EL BOULOUMI
/// @dev    Déploiment de 5 smart contracts :
/// 		1- SeedToken : Smart Contract qui mint les tokens de gouvernance de la DAO.
///		2- ProjectInfo : Smart contract de type "eternal storage" qui stocke les infos des projets de crowdfunding. Smart contract partagé par tous les smart contracts suivants
///             3- VoteProjectValidation : Smart contract de la gestion de vote par la communauté DAO sur la validité d'un projet
///		4- FundraisingProject : smart contract de collecte de fonds en stable coin (usdt /dai/ ..etc)
///		5- VoteUnlockFunds : smart contract qui gère le vote et le déblocage de fonds par phase.

const SeedToken = artifacts.require("SeedToken");
const ProjectInfo = artifacts.require("ProjectInfo");
const VoteProjectValidation = artifacts.require("VoteProjectValidation");
const FundraisingProjects = artifacts.require("FundraisingProject");
const VoteUnlockFunds = artifacts.require("VoteUnlockFunds");
 
module.exports = async function(deployer, _network, accounts) {

	var  Web3  =  require('web3');
    require('dotenv').config();
    const HDWalletProvider = require('@truffle/hdwallet-provider');
    
    provider = new HDWalletProvider(`${process.env.MNEMONIC}`, `https://goerli.infura.io/v3/${process.env.INFURA_ID}`)
    web3 = new Web3(provider);
   

	await deployer.deploy(SeedToken);
	const seedTokenInstance = await SeedToken.deployed();

	// Get supply and holders count from SeedToken contract
	const supply = await seedTokenInstance.totalSupply();
	const holdersCount = await seedTokenInstance.holdersCount();

	console.log("Seed Token Supply:", supply.toString());
	console.log("Number of Holders:", holdersCount.toString());

	/// Get the balance in Ethers  for the account_0 
	const balance = await web3.eth.getBalance(accounts[0]);
	console.log("Eth. Balance:", web3.utils.fromWei(balance));

	/// Get the balance of the token SEED for the account_0
	const seedBalance_0 = await seedTokenInstance.balanceOf(accounts[0]);
	console.log('SEED Balance of account_0:', seedBalance_0.toString());

	/// Transfer Seed Tokens to Account_1 in 2 steps : 
	const amount = web3.utils.toWei('34567', 'ether');

	/// 1- Approve the transfer from the sender account
	await seedTokenInstance.approve(accounts[1] , amount, { from: accounts[0] });

	/// 2- Transfer the tokens to the receiver account
	await seedTokenInstance.transfer(accounts[1], amount, { from: accounts[0] });
	const seedBalance_1 = await seedTokenInstance.balanceOf(accounts[1]);
	console.log('SEED Balance of account_1:', seedBalance_1.toString());

	const holdersCount_2 = await seedTokenInstance.holdersCount();
	console.log("Update - Number of Holders:", holdersCount_2.toString());


	/// Continue to deploy following contracts
	/// Order is important ; in order to manager dependencies between the smart contracts
	// Deploy ProjectInfo contract
	await deployer.deploy(ProjectInfo);
	const projectInfoInstance = await ProjectInfo.deployed();

	// Deploy VoteProjectValidation contract with SeedToken and ProjectInfo addresses as constructor arguments
	await deployer.deploy(VoteProjectValidation, seedTokenInstance.address, projectInfoInstance.address);
	const voteProjectValidationInstance = await VoteProjectValidation.deployed();

	// Deploy FundraisingProjects contract with SeedToken and ProjectInfo addresses as constructor arguments
	const token_USDT_Goerli_address = "0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49";
	const token_DAI_Goerli_address = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60";
	const token_DAI_Mumbai_address = "0xb973D2876c4F161439AD05f1dAe184dbD594e04E";
	
	await deployer.deploy(FundraisingProjects, token_DAI_Mumbai_address, projectInfoInstance.address);
	const fundraisingProjectsInstance = await FundraisingProjects.deployed();

	// Deploy VoteUnlockFunds contract with SeedToken, ProjectInfo, and FundraisingProjects addresses as constructor arguments
	await deployer.deploy(VoteUnlockFunds, projectInfoInstance.address, fundraisingProjectsInstance.address);
	const voteUnlockFundsInstance = await VoteUnlockFunds.deployed();
};


/**
 * Logs From a previous deployment :
 * 
 * Seed Token Supply: 1000000000000000000000000000
 * Number of Holders: 1
 * Eth. Balance: 0
 * SEED Balance of account_0: 1000000000000000000000000000
 * SEED Balance of account_1: 34567000000000000000000
 * Update - Number of Holders: 2
 */
