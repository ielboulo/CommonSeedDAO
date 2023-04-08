const { expect } = require('chai');
const { BN, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const FundraisingProject = artifacts.require('FundraisingProject');
const ProjectInfo = artifacts.require('ProjectInfo');
const SeedToken = artifacts.require('SeedToken');
const MockToken = artifacts.require("MockToken");

const VoteUnlockFunds = artifacts.require("VoteUnlockFunds");

contract('VoteUnlockFunds', function (accounts) {
  const [owner, investor1, investor2, investor3, investor4, projectOwner] = accounts;
  const project_1 = 1; 

  beforeEach(async function () {
    this.seedToken = await SeedToken.new({ from: owner });
    this.mockToken = await MockToken.new({ from: owner });

    this.projectInfo = await ProjectInfo.new({ from: owner });
    this.fundraisingProject = await FundraisingProject.new(this.mockToken.address, this.projectInfo.address, { from: owner });
    this.voteUnlockFunds = await VoteUnlockFunds.new(this.projectInfo.address, this.fundraisingProject.address,{ from: owner });


    // Add a project
    const _goalAmount = web3.utils.toWei("5000", "ether");
    const _minContribution = web3.utils.toWei("100", "ether");
    await this.projectInfo.addProject(projectOwner, "DAO SEED", _goalAmount, 3, 100000, _minContribution, { from: owner });  
    await this.projectInfo.setVoteValidationStatus( project_1,  ProjectInfo.VoteValidationStatus.ProjectAccepted);
    // configure Fundraise Deadline
    const now = await web3.eth.getBlock('latest').then(block => block.timestamp);
    const days = 7 * 24 * 60 * 60; // 7 days in seconds
    const deadline = now + days;
    await this.projectInfo.setFundraisingDeadline(project_1, deadline);
    
    // Add investors and fundraise OK 
    // investor1:
    const amount_investor1 = web3.utils.toWei("10000", "ether"); // Convert 10.000 mUSDT to its smallest unit
    await this.mockToken.transfer(investor1, amount_investor1);
    await this.fundraisingProject.openFundraisingPhase(project_1, { from: owner });
    // contribute to the project investor1
    const amount_1 = web3.utils.toWei("1500", "ether");
    await this.mockToken.approve(this.fundraisingProject.address, web3.utils.toWei(amount_1.toString(), "ether"), { from: investor1 });
    await this.fundraisingProject.contribute(project_1, amount_1, { from: investor1 });

    // investor2:
    const amount_investor2 = web3.utils.toWei("10000", "ether"); // Convert 10.000 mUSDT to its smallest unit
    await this.mockToken.transfer(investor2, amount_investor2);
    await this.fundraisingProject.openFundraisingPhase(project_1, { from: owner });
    // contribute to the project investor2
    const amount_2 = web3.utils.toWei("1000", "ether");
    await this.mockToken.approve(this.fundraisingProject.address, web3.utils.toWei(amount_1.toString(), "ether"), { from: investor2});
    await this.fundraisingProject.contribute(project_1, amount_2, { from: investor2 });

    // investor3:
    const amount_investor3 = web3.utils.toWei("10000", "ether"); // Convert 10.000 mUSDT to its smallest unit
    await this.mockToken.transfer(investor3, amount_investor3);
    await this.fundraisingProject.openFundraisingPhase(project_1, { from: owner });
    // contribute to the project investor3
    const amount_3 = web3.utils.toWei("2500", "ether");
    await this.mockToken.approve(this.fundraisingProject.address, web3.utils.toWei(amount_1.toString(), "ether"), { from: investor3});
    await this.fundraisingProject.contribute(project_1, amount_3, { from: investor3 });

    // close fundraising
    await this.fundraisingProject.closeFundraisingPhase(project_1, { from: owner });
    //fundraising successful
    const receipt_check = await this.fundraisingProject.checkFundraisingGoals(project_1);
    expectEvent(receipt_check, 'FundraisingSuccessful', { projectId: new BN(1)});

  });

   
it('should check if eligible Voter ', async function () {

  const current_phase = await this.projectInfo.getProjectCurrentPhase(project_1);
  console.log("current_phase = ", current_phase.toNumber()); 

  const isEligible_res_1 = await this.voteUnlockFunds.getIfEligibleVoter(project_1, current_phase.toNumber() , investor1);
  console.log("isEligible_res ", isEligible_res_1);

  await this.voteUnlockFunds.setIfEligibleVoter(project_1, current_phase.toNumber() , investor1);

  const isEligible_res_2 = await this.voteUnlockFunds.getIfEligibleVoter(project_1, current_phase.toNumber() , investor1);
  console.log("isEligible_res ", isEligible_res_2);
});

   
it('should  investor1 eligible to vote', async function () {
  const current_phase = await this.projectInfo.getProjectCurrentPhase(project_1);

  await this.projectInfo.setVoteUnlockStatus(project_1, current_phase, ProjectInfo.VoteUnlockStatus.VotingSessionOpen, { from: owner });

  const receipt = await this.voteUnlockFunds.setVote(project_1, current_phase.toNumber() , true, { from: investor1 });
  expectEvent(receipt, 'Voted', { 
    _projectId: new BN(1),
    _phase : new BN(0),
    _addr : investor1,
    _decision : true
      });

});

it('should  investor4 NOT eligible to vote', async function () {
  const current_phase = await this.projectInfo.getProjectCurrentPhase(project_1);

  await this.projectInfo.setVoteUnlockStatus(project_1, current_phase, ProjectInfo.VoteUnlockStatus.VotingSessionOpen, { from: owner });

  await expectRevert(this.voteUnlockFunds.setVote(project_1, current_phase.toNumber() , true, { from: investor4 }), "Address not Eligible for vote");


});

it('should  Tally vote : 0 vote => Unlock rejected ', async function () {
  const current_phase = await this.projectInfo.getProjectCurrentPhase(project_1);

  await this.projectInfo.setVoteUnlockStatus(project_1, current_phase, ProjectInfo.VoteUnlockStatus.VotingSessionOpen, { from: owner });

  await expectRevert(this.voteUnlockFunds.setVote(project_1, current_phase.toNumber() , true, { from: investor4 }), "Address not Eligible for vote");
  
  await this.projectInfo.setVoteUnlockStatus(project_1, current_phase, ProjectInfo.VoteUnlockStatus.VotingSessionClose, { from: owner });

  await this.voteUnlockFunds.tallyVotes(project_1, current_phase, { from: owner });
  //            emit UnlockRejected( _projectId, _phase);
  const receipt = await this.voteUnlockFunds.tallyVotes(project_1, current_phase, { from: owner });
  expectEvent(receipt, 'UnlockRejected', { 
    _projectId: new BN(1),
    _phase : new BN(0)
      });

});

it('should  Tally vote : Unlock Accepted by vote ', async function () {
  const current_phase = await this.projectInfo.getProjectCurrentPhase(project_1);

  await this.projectInfo.setVoteUnlockStatus(project_1, current_phase, ProjectInfo.VoteUnlockStatus.VotingSessionOpen, { from: owner });

  const receipt = await this.voteUnlockFunds.setVote(project_1, current_phase.toNumber() , true, { from: investor1 });
  expectEvent(receipt, 'Voted', { 
    _projectId: new BN(1),
    _phase : new BN(0),
    _addr : investor1,
    _decision : true
      });
  const receipt2 = await this.voteUnlockFunds.setVote(project_1, current_phase.toNumber() , true, { from: investor2 });
  expectEvent(receipt2, 'Voted', { 
    _projectId: new BN(1),
    _phase : new BN(0),
    _addr : investor2,
    _decision : true
      });
  const receipt3 = await this.voteUnlockFunds.setVote(project_1, current_phase.toNumber() , true, { from: investor3 });
  expectEvent(receipt3, 'Voted', { 
    _projectId: new BN(1),
    _phase : new BN(0),
    _addr : investor3,
    _decision : true
      });
    
    // close voting session
    await this.projectInfo.setVoteUnlockStatus(project_1, current_phase, ProjectInfo.VoteUnlockStatus.VotingSessionClose, { from: owner });

    const receiptV = await this.voteUnlockFunds.tallyVotes(project_1, current_phase, { from: owner });
    expectEvent(receiptV, 'UnlockAccepted', { 
      _projectId: new BN(1),
      _phase : new BN(0)
        });
});

it('should  Tally vote : Unlock Rejected by vote ', async function () {  const current_phase = await this.projectInfo.getProjectCurrentPhase(project_1);

  await this.projectInfo.setVoteUnlockStatus(project_1, current_phase, ProjectInfo.VoteUnlockStatus.VotingSessionOpen, { from: owner });

  const receipt = await this.voteUnlockFunds.setVote(project_1, current_phase.toNumber() , true, { from: investor1 });
  expectEvent(receipt, 'Voted', { 
    _projectId: new BN(1),
    _phase : new BN(0),
    _addr : investor1,
    _decision : true
      });
  //investor 2 is against the unlock
  const receipt2 = await this.voteUnlockFunds.setVote(project_1, current_phase.toNumber() , false, { from: investor2 });
  expectEvent(receipt2, 'Voted', { 
    _projectId: new BN(1),
    _phase : new BN(0),
    _addr : investor2,
    _decision : false
      });
  //investor 3 is against the unlock
  const receipt3 = await this.voteUnlockFunds.setVote(project_1, current_phase.toNumber() , false, { from: investor3 });
  expectEvent(receipt3, 'Voted', { 
    _projectId: new BN(1),
    _phase : new BN(0),
    _addr : investor3,
    _decision : false
      });

  // close voting session
  await this.projectInfo.setVoteUnlockStatus(project_1, current_phase, ProjectInfo.VoteUnlockStatus.VotingSessionClose, { from: owner });

  const receiptV = await this.voteUnlockFunds.tallyVotes(project_1, current_phase, { from: owner });
  expectEvent(receiptV, 'UnlockRejected', { 
    _projectId: new BN(1),
    _phase : new BN(0)
      });
});


  // it("should allow an investor to vote", async () => {
  //   const phase = 1;
  //   const decision = true;
  //   await voteUnlockFunds.setVote(projectId, phase, decision, { from: investor });
  
  //   const investorVoter = await voteUnlockFunds.investorVoters(projectId, phase, investor);
  //   assert.isTrue(investorVoter.hasVoted, "Investor should have voted");
  //   assert.equal(investorVoter.decision, decision, "Investor vote decision should match");
  // });
  
  // it("should tally votes correctly", async () => {
  //   const projectId = 1;
  //   const phase = 1;
  //   const { accounts, voteUnlockFunds } = setup();
  
  //   // Vote from different investors
  //   await voteUnlockFunds.setVote(projectId, phase, true, { from: accounts[1] });
  //   await voteUnlockFunds.setVote(projectId, phase, true, { from: accounts[2] });
  //   await voteUnlockFunds.setVote(projectId, phase, false, { from: accounts[3] });
  
  //   // Close the voting session
  //   await voteUnlockFunds.VotingSessionClosing(projectId, phase);
  
  //   // Tally votes
  //   await voteUnlockFunds.tallyVotes(projectId, phase);
  
  //   const unlockProposal = await voteUnlockFunds.unlockProposals(projectId, phase);
  //   assert.equal(unlockProposal.yesVotes, 2, "Yes votes should be 2");
  //   assert.equal(unlockProposal.noVotes, 1, "No votes should be 1");
  // });

  // it("should unblock funds successfully", async () => {
  //   const projectId = 1;
  //   const phase = 1;
  //   const { accounts, voteUnlockFunds, projectInfo } = setup();
  
  //   // Assume the unlock proposal is accepted
  //   await projectInfo.setPhaseUnlockAccepted(projectId, phase, true);
  
  //   const totalRaisedBefore = await projectInfo.getTotalRaised(projectId);
  //   const remainingFundsBefore = await projectInfo.getRemainingFunds(projectId);
  
  //   // Unblock funds
  //   await voteUnlockFunds.unblockFunds(projectId, phase);
  
  //   const remainingFundsAfter = await projectInfo.getRemainingFunds(projectId);
  //   const totalUnlocked = await projectInfo.getTotalUnlocked(projectId);
  
  //   assert.isTrue(remainingFundsBefore.gt(remainingFundsAfter), "Remaining funds should decrease after unblocking");
  //   assert.isTrue(totalRaisedBefore.gt(totalUnlocked), "Total unlocked should be less than total raised");
  // });
  
});