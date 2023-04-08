const { expect } = require('chai');
const { BN, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const FundraisingProject = artifacts.require('FundraisingProject');
const ProjectInfo = artifacts.require('ProjectInfo');
const MockToken = artifacts.require('MockToken');
const SeedToken = artifacts.require('SeedToken');

contract('FundraisingProject', function (accounts) {
  const [owner, investor1, investor2, investor3, projectOwner] = accounts;
  const project_1 = 1; 

  //const [owner, projectOwner, voter1, voter2, voter3, nonVoter] = accounts;
  beforeEach(async function () {
    this.seedToken = await SeedToken.new({ from: owner });
    this.projectInfo = await ProjectInfo.new({ from: owner });
    
    this.mockToken = await MockToken.new({ from: owner });
    this.fundraisingProject = await FundraisingProject.new(this.mockToken.address, this.projectInfo.address, { from: owner });

    // Add a project
    const _goalAmount = web3.utils.toWei("5000", "ether");
    const _minContribution = web3.utils.toWei("100", "ether");
    await this.projectInfo.addProject(projectOwner, "DAO SEED", _goalAmount, 3, 100000, _minContribution, { from: owner });  
    await this.projectInfo.setVoteValidationStatus( project_1,  ProjectInfo.VoteValidationStatus.ProjectAccepted);

    //(address _projectOwner, string memory _projectTitle, uint _goalAmount, 
   //uint _totalPhases, uint256 _fundraisingDeadline, uint _minContribution) external onlyOwner 

  // const amount = web3.utils.toWei("10000", "ether"); // Convert 10.000 mUSDT to its smallest unit
	// for (let i = 0; i < 6; i++) {
	// 	await mockToken.transfer(accounts[i], amount);
	// }

    // investors have 10.000 mUSDT in their wallets :
    const amount_investor1 = web3.utils.toWei("10000", "ether"); // Convert 10.000 mUSDT to its smallest unit
    await this.mockToken.transfer(investor1, amount_investor1);

    const amount_investor2 = web3.utils.toWei("10000", "ether"); // Convert 10.000 mUSDT to its smallest unit
    await this.mockToken.transfer(investor2, amount_investor2);

    const amount_investor3 = web3.utils.toWei("10000", "ether"); // Convert 10.000 mUSDT to its smallest unit
    await this.mockToken.transfer(investor3, amount_investor3);

    // set fundraising deadline :
    const now = await web3.eth.getBlock('latest').then(block => block.timestamp);
    const days = 7 * 24 * 60 * 60; // 7 days in seconds
    const _now = now + days;
    await this.projectInfo.setFundraisingDeadline(project_1, _now);
  });

      
  it('should contribute successfully ', async function () {
    // Test initial state of the contract
    await this.fundraisingProject.openFundraisingPhase(project_1);
    // FundraisingPhaseOpen
    const  currentFundraisingStatus = await this.projectInfo.getFundraisingStatus(project_1);
    expect(currentFundraisingStatus.toString()).to.equal("0");


    const amount_1 = web3.utils.toWei("100", "ether");
    // Approve the allowance
    await this.mockToken.approve(this.fundraisingProject.address, web3.utils.toWei(amount_1.toString(), "ether"), { from: investor1 });

    const receipt =  await this.fundraisingProject.contribute(project_1, amount_1, { from: investor1 });
    expectEvent(receipt, 'Contribute', { 
      projectId: new BN(1),
      investor : investor1,
      amount : amount_1
        });

  });

      
  it('should revert if minimum amount of contribution is not respected ', async function () {
    // Test initial state of the contract
    await this.fundraisingProject.openFundraisingPhase(project_1);
    // FundraisingPhaseOpen
    const  currentFundraisingStatus = await this.projectInfo.getFundraisingStatus(project_1);
    expect(currentFundraisingStatus.toString()).to.equal("0");
  
    const amount_1 = web3.utils.toWei("10", "ether");
    // Approve the allowance
    await this.mockToken.approve(this.fundraisingProject.address, web3.utils.toWei(amount_1.toString(), "ether"), { from: investor1 });
    await expectRevert(this.fundraisingProject.contribute(project_1, amount_1, { from: investor1 }), "Minimum amount not respected");

  });

  it('should revert if Fundraising Phase not open ', async function () {
    // Test initial state of the contract
    await this.fundraisingProject.closeFundraisingPhase(project_1);
    // FundraisingPhaseOpen
    const  currentFundraisingStatus = await this.projectInfo.getFundraisingStatus(project_1);
    expect(currentFundraisingStatus.toString()).to.equal("1");

    const amount_1 = web3.utils.toWei("10", "ether");
    await expectRevert(this.fundraisingProject.contribute(project_1, amount_1, { from: investor1 }), "Fundraising phase not open !");

  });

  it('checkFundraisingGoals - fundraise failed' , async function () {

    await this.fundraisingProject.openFundraisingPhase(project_1);
    const total_raised = await this.projectInfo.getTotalRaised(project_1);
    console.log( " total_raised = ", total_raised.toString());
    
    // contribution investor1
    const amount_1 = web3.utils.toWei("1500", "ether");
    await this.mockToken.approve(this.fundraisingProject.address, web3.utils.toWei(amount_1.toString(), "ether"), { from: investor1 });
    const receipt =  await this.fundraisingProject.contribute(project_1, amount_1, { from: investor1 });
    expectEvent(receipt, 'Contribute', { projectId: new BN(1), investor : investor1, amount : amount_1});

    // total raised :
    const total_raised_2 = await this.projectInfo.getTotalRaised(project_1);
    console.log( " total_raised 2 = ", total_raised_2.toString());

    // contribution investor2
    const amount_2 = web3.utils.toWei("1000", "ether");
    await this.mockToken.approve(this.fundraisingProject.address, web3.utils.toWei(amount_2.toString(), "ether"), { from: investor2 });
    const receipt_2 =  await this.fundraisingProject.contribute(project_1, amount_2, { from: investor2 });
    expectEvent(receipt_2, 'Contribute', { projectId: new BN(1), investor : investor2, amount : amount_2});

    // total raised :
    const total_raised_3 = await this.projectInfo.getTotalRaised(project_1);
    console.log( " total_raised 3 = ", total_raised_3.toString());
    
    // Goal
    const goal = await this.projectInfo.getGoalAmount(project_1);
    console.log( " goal  = ", goal.toString());

    // Close funding phase
    await this.fundraisingProject.closeFundraisingPhase(project_1);
    const  currentFundraisingStatus = await this.projectInfo.getFundraisingStatus(project_1);
    expect(currentFundraisingStatus.toString()).to.equal("1");

    // checkFundraisingGoals
    const receipt_check = await this.fundraisingProject.checkFundraisingGoals(project_1);
    expectEvent(receipt_check, 'FundraisingFailed', { projectId: new BN(1)});
  });

  it('checkFundraisingGoals - fundraise successful' , async function () {

    await this.fundraisingProject.openFundraisingPhase(project_1);

    // contribution investor1
    const amount_1 = web3.utils.toWei("1500", "ether");
    await this.mockToken.approve(this.fundraisingProject.address, web3.utils.toWei(amount_1.toString(), "ether"), { from: investor1 });
    const receipt =  await this.fundraisingProject.contribute(project_1, amount_1, { from: investor1 });
    expectEvent(receipt, 'Contribute', { projectId: new BN(1), investor : investor1, amount : amount_1});

    // contribution investor2
    const amount_2 = web3.utils.toWei("1000", "ether");
    await this.mockToken.approve(this.fundraisingProject.address, web3.utils.toWei(amount_2.toString(), "ether"), { from: investor2 });
    const receipt_2 =  await this.fundraisingProject.contribute(project_1, amount_2, { from: investor2 });
    expectEvent(receipt_2, 'Contribute', { projectId: new BN(1), investor : investor2, amount : amount_2});

    // contribution investor3
    const amount_3 = web3.utils.toWei("2500", "ether");
    await this.mockToken.approve(this.fundraisingProject.address, web3.utils.toWei(amount_3.toString(), "ether"), { from: investor3 });
    const receipt_3 =  await this.fundraisingProject.contribute(project_1, amount_3, { from: investor3 });
    expectEvent(receipt_3, 'Contribute', { projectId: new BN(1), investor : investor3, amount : amount_3});
    
    // Close funding phase
    await this.fundraisingProject.closeFundraisingPhase(project_1);
    const  currentFundraisingStatus = await this.projectInfo.getFundraisingStatus(project_1);
    expect(currentFundraisingStatus.toString()).to.equal("1");

    // checkFundraisingGoals
    const receipt_check = await this.fundraisingProject.checkFundraisingGoals(project_1);
    expectEvent(receipt_check, 'FundraisingSuccessful', { projectId: new BN(1)});
  });

  it.only('unlockFunds -  successful' , async function () {

    await this.fundraisingProject.openFundraisingPhase(project_1);

    // contribution investor1
    const amount_1 = web3.utils.toWei("5000", "ether");
    await this.mockToken.approve(this.fundraisingProject.address, web3.utils.toWei(amount_1.toString(), "ether"), { from: investor1 });
    const receipt =  await this.fundraisingProject.contribute(project_1, amount_1, { from: investor1 });
    expectEvent(receipt, 'Contribute', { projectId: new BN(1), investor : investor1, amount : amount_1});
    // Close funding phase
    await this.fundraisingProject.closeFundraisingPhase(project_1);

    // check balance before
    const balance_1 = await this.mockToken.balanceOf(this.fundraisingProject.address);

    // unlock amount 
    const amountToUnlock = web3.utils.toWei("1000", "ether");
    const receipt_check  = await this.fundraisingProject.unlockFunds(project_1, amountToUnlock, { from: owner });
    expectEvent(receipt_check, 'UnlockFundsSucessful', 
      { projectId: new BN(1),
        _address : projectOwner,
        amount: amountToUnlock });

    // check balance after
    const balance_2 = await this.mockToken.balanceOf(this.fundraisingProject.address);

    const expected_balance = balance_1.sub(new BN(amountToUnlock));
    assert.equal(balance_2.toString(), expected_balance.toString(), 'Balances should be equal');
  });

  it.only('unlockFunds -  Failed - not enough balance' , async function () {

    await this.fundraisingProject.openFundraisingPhase(project_1);

    // contribution investor1
    const amount_1 = web3.utils.toWei("5000", "ether");
    await this.mockToken.approve(this.fundraisingProject.address, web3.utils.toWei(amount_1.toString(), "ether"), { from: investor1 });
    const receipt =  await this.fundraisingProject.contribute(project_1, amount_1, { from: investor1 });
    expectEvent(receipt, 'Contribute', { projectId: new BN(1), investor : investor1, amount : amount_1});
    // Close funding phase
    await this.fundraisingProject.closeFundraisingPhase(project_1);

    // check balance before
    const balance_1 = await this.mockToken.balanceOf(this.fundraisingProject.address);

    // unlock amount 
    const amountToUnlock = web3.utils.toWei("6000", "ether");
    await expectRevert(this.fundraisingProject.unlockFunds(project_1, amountToUnlock, { from: owner }),
                      "Not enough balance in the smart contract");
    
    const balance_2 = await this.mockToken.balanceOf(this.fundraisingProject.address);
    assert.equal(balance_1.toString(), balance_2.toString(), 'Balance should be not changed');
  });

  // describe('Deployment and initialization', function () {
  //   beforeEach(async function () {
  //     //const [owner, projectOwner, voter1, voter2, voter3, nonVoter] = accounts;
  //     beforeEach(async function () {
  //       this.seedToken = await SeedToken.new({ from: owner });
  //       this.projectInfo = await ProjectInfo.new({ from: owner });
        
  //       this.mockToken = await MockToken.new({ from: owner });
  //       this.fundraisingProject = await FundraisingProject.new(this.mockToken.address, this.projectInfo.address, { from: owner });
  
  //       // Add a project
  //       await this.projectInfo.addProject(projectOwner, "Project Title", 1000, 3, 100000, 100, { from: owner });
      
  //     });
  //   });

  //   it('should deploy the contract with correct initial state', async function () {
  //     // Test initial state of the contract
  //     //await this.fundraisingProject.
  //     const  currentFundraisingStatus = await this.projectInfo.getFundraisingStatus(project_1);
  //     expect(currentFundraisingStatus == ProjectInfo.FundraisingStatus.FundraisingPhaseOpen, "Fundraising phase not open !");
  //   });
  // });

  // describe('Contribution', function () {
  //   it('should allow an investor to contribute', async function () {
  //     // Test contribution
  //   });

  //   it('should reject a contribution below the minimum', async function () {
  //     // Test minimum contribution
  //   });

  //   it('should reject a contribution after the deadline', async function () {
  //     // Test contribution after deadline
  //   });
  // });

  // describe('Withdrawal', function () {
  //   it('should allow an investor to withdraw', async function () {
  //     // Test withdrawal
  //   });

  //   it('should reject a withdrawal before the deadline', async function () {
  //     // Test withdrawal before deadline
  //   });

  //   it('should reject a withdrawal for a non-contributor', async function () {
  //     // Test withdrawal for non-contributor
  //   });
  // });

  // describe('Unlocking funds', function () {
  //   it('should allow the owner to unlock funds', async function () {
  //     // Test unlocking funds
  //   });

  //   it('should reject unlocking funds by non-owner', async function () {
  //     // Test non-owner unlocking funds
  //   });
  // });

  // Add more test cases as needed
});
