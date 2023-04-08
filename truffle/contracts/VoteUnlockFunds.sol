// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../node_modules/@openzeppelin/contracts/utils/Strings.sol";


import "./FundraisingProject.sol";
import "./ProjectInfo.sol";


contract VoteUnlockFunds  is Ownable {
    
    ProjectInfo         projectInfoContract;
    FundraisingProject  fundraisingProjects;


    // Structure pour stocker les résultats du vote pour une proposition de déblocage de fonds
    struct UnlockProposal {
        uint amountToUnlockPercentage;
        uint deadline; // in days 
        uint yesVotes;
        uint noVotes;
        bool isAccepted;
        bool executed;
    }

    struct InvestorVoter {
        bool isEligible;
        bool hasVoted;
        bool decision;
    }
    mapping(uint => mapping(uint => UnlockProposal)) public unlockProposals;
    // unlockProposals[projectId][phase] = proposal;

    mapping(uint => mapping(uint => mapping(address => InvestorVoter))) public investorVoters; 
    // investorVoters[projectId][phase][addr_investor].isEligible = true / false;

/// events 
        event UnlockProposalOpen(uint _projectId, uint _phase);
        event UnlockProposalAdded(uint _projectId, uint _phase);
        event UnlockProposalClose(uint _projectId, uint _phase);
        event VotingSessionOpen(uint _projectId, uint _phase);
        event VotingSessionClose(uint _projectId, uint _phase);
        event Voted(uint _projectId, uint _phase, address _addr, bool _decision);
        event UnlockAccepted(uint _projectId, uint _phase);
        event UnlockRejected(uint _projectId, uint _phase);
        event UnlockExecuted(uint _projectId, uint _phase, uint256 _amount);

//// 
    
    constructor(address _projectInfoContractAddress, address _fundraisingProjectsAddress) {   
        projectInfoContract = ProjectInfo(_projectInfoContractAddress);
        fundraisingProjects = FundraisingProject(_fundraisingProjectsAddress);
    }

    modifier isValidProject(uint _projectId, uint _phase) {
        require(_projectId <= projectInfoContract.getNumProjects(), "ERROR : Invalid ProjectID");
        require(projectInfoContract.getFundraisingStatus(_projectId) == ProjectInfo.FundraisingStatus.FundraisingSuccessful, "ERROR : Project Not Funded Successfully!");
        
        uint currentPhase = projectInfoContract.getProjectCurrentPhase(_projectId); 

        string memory errorMessage = string(abi.encodePacked(
            "ERROR: Invalid Phase Id! currentPhase: ",
            Strings.toString(currentPhase),
            " _phase: ",
            Strings.toString(_phase)
        ));
        require(currentPhase == _phase, errorMessage);
        //require( currentPhase !=  _phase, "ERROR : Invalid Phase Id !");
        // require( currentPhase !=  _phase,
        // string(abi.encodePacked(
        // "ERROR: Invalid Phase Id! currentPhase: ", currentPhase, " _phase: ", _phase)));
        _;
    }

    modifier onlyAdminOrProjectOwner(uint _projectId) {
        require(projectInfoContract.getProjectOwner(_projectId) == msg.sender || owner() == msg.sender , "Only project Owner or Admin is Allowed");
        _;
    }

    function unlockProposalOpening(uint _projectId, uint _phase) external onlyOwner  { // TODO isValidProjId(projectId)
        require(projectInfoContract.getVoteUnlockStatus(_projectId, _phase) == ProjectInfo.VoteUnlockStatus.UnlockProposalOpen, "UnlockProposal not open !");
        emit UnlockProposalOpen(_projectId, _phase);
    }

    function UnlockProposalClosing(uint _projectId, uint _phase) external onlyOwner  { // TODO isValidProjId(projectId)
        require(projectInfoContract.getVoteUnlockStatus(_projectId, _phase) == ProjectInfo.VoteUnlockStatus.UnlockProposalOpen, "UnlockProposal not open !");
        projectInfoContract.setVoteUnlockStatus(_projectId, _phase, ProjectInfo.VoteUnlockStatus.UnlockProposalClose);
        emit UnlockProposalClose(_projectId, _phase);
    }

    function VotingSessionOpening(uint _projectId, uint _phase) external onlyOwner  { // TODO isValidProjId(projectId)
        require(projectInfoContract.getVoteUnlockStatus(_projectId, _phase) == ProjectInfo.VoteUnlockStatus.UnlockProposalClose, "UnlockProposal not closed !");
        projectInfoContract.setVoteUnlockStatus(_projectId, _phase, ProjectInfo.VoteUnlockStatus.VotingSessionOpen);
        emit VotingSessionOpen(_projectId, _phase);
    }

    function VotingSessionClosing(uint _projectId, uint _phase) external onlyOwner  { // TODO isValidProjId(projectId)
        require(projectInfoContract.getVoteUnlockStatus(_projectId, _phase) == ProjectInfo.VoteUnlockStatus.VotingSessionOpen, "Voting Session not open !");
        projectInfoContract.setVoteUnlockStatus(_projectId, _phase, ProjectInfo.VoteUnlockStatus.VotingSessionClose);
        emit VotingSessionClose(_projectId, _phase);
    }

    // Phase d'ajout de proposal
    function addUnlockProposal(uint _projectId, uint _phase, uint _amountToUnlockPercentage, uint _deadline) onlyAdminOrProjectOwner(_projectId) isValidProject(_projectId, _phase) public {
        require(projectInfoContract.getVoteUnlockStatus(_projectId, _phase) == ProjectInfo.VoteUnlockStatus.UnlockProposalOpen, "Unlock Proposal  not open !");
        require(projectInfoContract.getProjectCurrentPhase(_projectId) == _phase, "ERROR : Invalid Phase ID !");
        require(!unlockProposals[_projectId][_phase].executed, "Unlock proposal already executed");

        unlockProposals[_projectId][_phase] = UnlockProposal(_amountToUnlockPercentage, _deadline, 0, 0, false, false);
        emit UnlockProposalAdded(_projectId, _phase);
    }

    // Phase de Vote

    function setIfEligibleVoter(uint _projectId, uint _phase, address _addr) public isValidProject(_projectId, _phase)
    {
        require(projectInfoContract.hasContributed(_projectId, _addr) && projectInfoContract.getProjectOwner(_projectId) != _addr, "Address not Eligible for vote");
        investorVoters[_projectId][_phase][_addr].isEligible = true; 
    }

    function getIfEligibleVoter(uint _projectId, uint _phase, address _addr) external view  onlyOwner isValidProject(_projectId, _phase) returns(bool)
    {
        return investorVoters[_projectId][_phase][_addr].isEligible; 
    }

    modifier onlyInvestorVoters(uint _projectId, uint _phase)
    {
        require(investorVoters[_projectId][_phase][msg.sender].isEligible, "Not Allowed to participate");
        _;
    }
    // onlyInvestorVoters(_projectId, _phase) : no list voters , when clicking on button, check if eligible or not 
    function setVote(uint _projectId, uint _phase, bool _decision) isValidProject(_projectId, _phase) public 
    {
        setIfEligibleVoter(_projectId, _phase, msg.sender); // TODO : to refactor 
        require(projectInfoContract.getVoteUnlockStatus(_projectId, _phase) == ProjectInfo.VoteUnlockStatus.VotingSessionOpen, "Voting Session not open !");
        require(!investorVoters[_projectId][_phase][msg.sender].hasVoted, "You have Already Voted !");

        investorVoters[_projectId][_phase][msg.sender].decision = _decision;
        investorVoters[_projectId][_phase][msg.sender].hasVoted = true;

        if(_decision) {
            unlockProposals[_projectId][_phase].yesVotes +=1;
        }
        else {
            unlockProposals[_projectId][_phase].noVotes +=1;         
        }
        emit Voted(_projectId, _phase, msg.sender, _decision);
    }

    function tallyVotes(uint _projectId, uint _phase) public onlyOwner 
    {
        require(projectInfoContract.getVoteUnlockStatus(_projectId, _phase) == ProjectInfo.VoteUnlockStatus.VotingSessionClose, "Voting Session not Closed !");

        UnlockProposal storage proposal = unlockProposals[_projectId][_phase];
        uint totalVotesWeighted;
        // Calculate the total weighted votes for this proposal
        for (uint i = 0; i < projectInfoContract.getNumInvestors(_projectId); i++) 
        {
            address investor = projectInfoContract.getContributor(_projectId, i);
            if(investorVoters[_projectId][_phase][investor].hasVoted)
            {
                uint256 voteWeight = projectInfoContract.getVoteWeight(_projectId, investor);
                totalVotesWeighted += investorVoters[_projectId][_phase][investor].decision == true ? voteWeight : 0;
            }
        }
        uint MinYesVotesToValidate = 66; //minimum de 66% des fonds doivent voter ok  
        if (totalVotesWeighted == 0) {
            // No votes!
            proposal.isAccepted = false;
            emit UnlockRejected( _projectId, _phase);
        } else if (totalVotesWeighted >= MinYesVotesToValidate) {
                proposal.isAccepted = true;
                emit UnlockAccepted( _projectId,  _phase);
        }
        else {
                proposal.isAccepted = false;
                emit UnlockRejected( _projectId, _phase);

        }
        projectInfoContract.setPhaseUnlockAccepted(_projectId, _phase, proposal.isAccepted);

    }

    using SafeMath for uint256;
    function calculateAmountToUnblock(uint256 totalRaised, uint256 amountToUnblockInPer) public pure returns (uint256) 
    {
        // TODO verify in which unit it is : wei or token unit
        uint256 amountToUnblock = totalRaised.mul(amountToUnblockInPer).div(100);
        return amountToUnblock;
    }
    function unblockFunds(uint _projectId, uint _phase) external onlyOwner isValidProject(_projectId,  _phase) 
    {
        require(projectInfoContract.getPhaseUnlockAccepted(_projectId, _phase), "Unlock Not Accepted !");
        require(!projectInfoContract.getPhaseUnlockExecuted(_projectId, _phase), "Unlock Already Executed !");

        UnlockProposal storage proposal = unlockProposals[_projectId][_phase];

        uint amountToUnlock = calculateAmountToUnblock(projectInfoContract.getTotalRaised(_projectId), proposal.amountToUnlockPercentage);

        // total to unlock < remainingFunds 
        require(amountToUnlock <= projectInfoContract.getRemainingFunds(_projectId), "Insufficient remaining funds");

        projectInfoContract.setPhaseAmoutToUnlock(_projectId, _phase, amountToUnlock);
        projectInfoContract.decrementRemainingFunds(_projectId, amountToUnlock);
        projectInfoContract.incrementTotalUnlocked(_projectId, amountToUnlock);
        proposal.executed = true;

        // TODO: call the escrow contract to unlock the funds
        bool result = fundraisingProjects.unlockFunds(_projectId, amountToUnlock);
        require(result, "Unlock Funds : Transfer to ProjectOwner Failed !");

        projectInfoContract.incrementProjectCurrentPhase(_projectId); // currentphase is validated & unblocked => move to the next phase

        emit UnlockExecuted(_projectId,  _phase,  amountToUnlock);
    }
}
