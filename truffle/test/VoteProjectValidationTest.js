const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const SeedToken = artifacts.require('SeedToken');
const ProjectInfo = artifacts.require('ProjectInfo');
const VoteProjectValidation = artifacts.require('VoteProjectValidation');

contract('VoteProjectValidation', function (accounts) {
  const [owner, projectOwner, voter1, voter2, voter3, nonVoter] = accounts;
  const project_1 = 1; 
  beforeEach(async function () {
    this.seedToken = await SeedToken.new({ from: owner });
    this.projectInfo = await ProjectInfo.new({ from: owner });
    this.voteProjectValidation = await VoteProjectValidation.new(this.seedToken.address, this.projectInfo.address, { from: owner });
  
    //const project_1 =1;
    // Add a project
    await this.projectInfo.addProject(projectOwner, "Project Title", 1000, 3, 100000, 100, { from: owner });
  
    // Owner transfers Seed Tokens to voters
    await this.seedToken.transfer(voter1, 1000, { from: owner });
    const investor1Balance = await this.seedToken.balanceOf(voter1);
    //console.log('voter1 balance after transfer:', investor1Balance.toString());

    await this.seedToken.transfer(voter2, 2000, { from: owner });
    await this.seedToken.transfer(voter3, 3000, { from: owner });
  
    // Investors approve tokens for the VoteProjectValidation contract
    await this.seedToken.approve(this.voteProjectValidation.address, 1000, { from: voter1 });
    await this.seedToken.approve(this.voteProjectValidation.address, 2000, { from: voter2 });
    await this.seedToken.approve(this.voteProjectValidation.address, 3000, { from: voter3 });

    // open registration phase 
    await this.voteProjectValidation.registerVotersOpening(project_1, { from: owner });
     // register eligible voters :
    await this.voteProjectValidation.registerEligibleVoters(project_1, { from: voter1 });
    await this.voteProjectValidation.registerEligibleVoters(project_1, { from: voter2 });
    await this.voteProjectValidation.registerEligibleVoters(project_1, { from: voter3 });
    // close registration phase
   // await this.voteProjectValidation.registerVotersClosing(project_1, { from: owner });
  });
  
  it('should not allow projectOwner to vote for project validation', async function () {
    await expectRevert(this.voteProjectValidation.registerEligibleVoters(project_1, { from: projectOwner }), 
    "ERROR : project owners are not allowed to vote");
  });

  it('should allow voters to vote for project validation', async function () {
    await this.voteProjectValidation.registerVotersClosing(project_1, { from: owner });
    await this.voteProjectValidation.VotingSessionOpening(project_1, { from: owner });

    await this.voteProjectValidation.setVote(project_1, true, { from: voter1 });
    await this.voteProjectValidation.setVote(project_1, true, { from: voter2 });
    await this.voteProjectValidation.setVote(project_1, true, { from: voter3 });

    await this.voteProjectValidation.VotingSessionClosing(project_1, { from: owner });

    await this.voteProjectValidation.tallyVote(project_1, { from: owner });

    const validationStatus = await this.projectInfo.getVoteValidationStatus(project_1);
    expect(validationStatus.toString()).to.equal("4"); // 4 represents ProjectAccepted
  });

  it('should allow voters to vote against project validation', async function () {
    await this.voteProjectValidation.registerVotersClosing(project_1, { from: owner });
    await this.voteProjectValidation.VotingSessionOpening(project_1, { from: owner });

    await this.voteProjectValidation.setVote(project_1, true, { from: voter1 });
    await this.voteProjectValidation.setVote(project_1, false, { from: voter2 });
    await this.voteProjectValidation.setVote(project_1, false, { from: voter3 });


    await this.voteProjectValidation.VotingSessionClosing(project_1, { from: owner });

    await this.voteProjectValidation.tallyVote(project_1, { from: owner });

    const validationStatus = await this.projectInfo.getVoteValidationStatus(project_1);
    expect(validationStatus.toString()).to.equal("5"); // 5 represents ProjectRejected
  });

  it('should not allow non-voters to vote', async function () {
    await this.voteProjectValidation.registerVotersClosing(project_1, { from: owner });
    await this.voteProjectValidation.VotingSessionOpening(project_1, { from: owner });

    await expectRevert(
      this.voteProjectValidation.setVote(project_1, true, { from: nonVoter }),
      "ERROR : Not Eligible Voter !"
    );
  });

    it('should not allow voting for a non-existing project', async function () {
    await this.voteProjectValidation.registerVotersClosing(project_1, { from: owner });
    await this.voteProjectValidation.VotingSessionOpening(project_1, { from: owner });
    
    await expectRevert(
        this.voteProjectValidation.setVote(2, true, { from: voter1 }),
        "ERROR : Invalid ProjectID"
      );
    });
  
    it('should not allow voters to vote multiple times', async function () {
        await this.voteProjectValidation.registerVotersClosing(project_1, { from: owner });
        await this.voteProjectValidation.VotingSessionOpening(project_1, { from: owner });
        
      await this.voteProjectValidation.setVote(1, true, { from: voter1 });
  
      await expectRevert(
        this.voteProjectValidation.setVote(1, false, { from: voter1 }),
        "ERROR : Has Already Voted!"
      );
    });
  
    it('should emit an event when a project is accepted', async function () {
        await this.voteProjectValidation.registerVotersClosing(project_1, { from: owner });
        await this.voteProjectValidation.VotingSessionOpening(project_1, { from: owner });
        
        await this.voteProjectValidation.setVote(1, true, { from: voter1 });
        await this.voteProjectValidation.setVote(1, true, { from: voter2 });
  
        await this.voteProjectValidation.setVote(1, true, { from: voter3 });

        await this.voteProjectValidation.VotingSessionClosing(project_1, { from: owner });
        const receipt =  await this.voteProjectValidation.tallyVote(project_1, { from: owner });

        const validationStatus = await this.projectInfo.getVoteValidationStatus(project_1);
        expect(validationStatus.toString()).to.equal("4"); // 4 represents ProjectAccepted
  
      expectEvent(receipt, 'ProjectAccepted', {
        _projectId: new BN(1)
          });
    });
  
    it('should emit an event when a project is rejected', async function () {
    
        await this.voteProjectValidation.registerVotersClosing(project_1, { from: owner });
        await this.voteProjectValidation.VotingSessionOpening(project_1, { from: owner });

        await this.voteProjectValidation.setVote(1, true, { from: voter1 });
        await this.voteProjectValidation.setVote(1, false, { from: voter2 });

        await this.voteProjectValidation.VotingSessionClosing(project_1, { from: owner });
        const receipt =  await this.voteProjectValidation.tallyVote(project_1, { from: owner });

        expectEvent(receipt, 'ProjectRejected', {
        _projectId: new BN(1)
        });
    });
  
    it.skip('should revert if the project is already validated or rejected', async function () {
      await this.voteProjectValidation.setVote(1, true, { from: voter1 });
      await this.voteProjectValidation.setVote(1, true, { from: voter2 });
      await this.voteProjectValidation.setVote(1, true, { from: voter3 });
  
      await expectRevert(
        this.voteProjectValidation.setVote(1, true, { from: voter1 }),
        "Project already validated or rejected"
      );
    });

    // test ERROR : Insufficient SEED balance 

    // test emit RegisterEligibleVoterDone

    // test already validated ? 

    // test project reject if total vote = 0

    // test project rejected if less than 66 votes 
  });
  