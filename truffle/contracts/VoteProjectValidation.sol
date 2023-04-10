// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./ProjectInfo.sol";

contract VoteProjectValidation is Ownable {
  
    //event ProjectToValidateAdded(uint projectId);

    event RegisterVotersOpen(uint _projectId);
    event RegisterVotersClose(uint _projectId);
    event VotingSessionOpen(uint _projectId);
    event VotingSessionClose(uint _projectId);
    event ProjectAccepted(uint _projectId);
    event ProjectRejected(uint _projectId);
    
    event RegisterEligibleVoterDone(uint _projectId, address _addr);
    
    event Voted(uint _projectId, address _addr);
 
    struct CountVotes {
        uint yesVotes;
        uint noVotes;
    }
    struct DaoVoter {
        bool hasGovernanceToken;
        bool hasVoted;
        bool decision;
    }

    IERC20 seedToken;
    ProjectInfo projectInfoContract;
    mapping(uint => CountVotes) projectCountVotes; // projectVoters[projectId][address].hasGovernanceToken / hasVoted/ ..
    mapping(uint => mapping (address => DaoVoter)) projectVoters; // projectVoters[projectId][address].hasGovernanceToken / hasVoted/ ..


    constructor(address _seedAddress, address _projectInfoContractAddress) {
        seedToken = IERC20(_seedAddress);
        projectInfoContract = ProjectInfo(_projectInfoContractAddress);
    }

    modifier isValidProjId(uint _projectId) {
        require(_projectId <= projectInfoContract.getNumProjects(), "ERROR : Invalid ProjectID");
        _;
    }

    function registerVotersOpening(uint _projectId) external onlyOwner  { // TODO isValidProjId(projectId)
        require(projectInfoContract.getVoteValidationStatus(_projectId) == ProjectInfo.VoteValidationStatus.RegisterVotersOpen, "Voters Registration not open !");
        emit RegisterVotersOpen(_projectId);
    }

    function registerVotersClosing(uint _projectId) external onlyOwner  { // TODO isValidProjId(projectId)
        require(projectInfoContract.getVoteValidationStatus(_projectId) == ProjectInfo.VoteValidationStatus.RegisterVotersOpen, "Voters Registration not open !");
        projectInfoContract.setVoteValidationStatus(_projectId, ProjectInfo.VoteValidationStatus.RegisterVotersClose);
        emit RegisterVotersClose(_projectId);
    }

    function VotingSessionOpening(uint _projectId) external onlyOwner  { // TODO isValidProjId(projectId)
        require(projectInfoContract.getVoteValidationStatus(_projectId) == ProjectInfo.VoteValidationStatus.RegisterVotersClose, "Voters Registration not open !");
        projectInfoContract.setVoteValidationStatus(_projectId, ProjectInfo.VoteValidationStatus.VotingSessionOpen);
        emit VotingSessionOpen(_projectId);
    }

    function VotingSessionClosing(uint _projectId) external onlyOwner  { // TODO isValidProjId(projectId)
        require(projectInfoContract.getVoteValidationStatus(_projectId) == ProjectInfo.VoteValidationStatus.VotingSessionOpen, "Voters Registration not open !");
        projectInfoContract.setVoteValidationStatus(_projectId, ProjectInfo.VoteValidationStatus.VotingSessionClose);
        emit VotingSessionClose(_projectId);
    }

    function registerEligibleVoters(uint _projectId) public // les voters s'enregistrent d'eux meme .. pas Admin qui ajoute
    {
        require(msg.sender != address(0), "invalid address ! ");
        require(msg.sender != projectInfoContract.getProjectOwner(_projectId), "ERROR : project owners are not allowed to vote");

        uint MinSeedBalance = 1000; // minimum SEED balance required to vote
        require(seedToken.balanceOf(msg.sender) >= MinSeedBalance, "ERROR : Insufficient SEED balance");
        
        projectVoters[_projectId][msg.sender].hasGovernanceToken = true;

        emit RegisterEligibleVoterDone(_projectId, msg.sender);
    }

    modifier onlyVoter(uint _projectId){
        require(projectVoters[_projectId][msg.sender].hasGovernanceToken, "ERROR : Not Eligible Voter !");
        _;
    }

    function setVote(uint _projectId, bool _decision) public  isValidProjId(_projectId) onlyVoter(_projectId)
    {
        require(projectInfoContract.getVoteValidationStatus(_projectId) == ProjectInfo.VoteValidationStatus.VotingSessionOpen, "Voting Session not open !");
        require(!projectVoters[_projectId][msg.sender].hasVoted , "ERROR : Has Already Voted!");

        projectVoters[_projectId][msg.sender].decision = _decision;
        projectVoters[_projectId][msg.sender].hasVoted = true;

        if(_decision) {
            projectCountVotes[_projectId].yesVotes +=1;
        }
        else {
            projectCountVotes[_projectId].noVotes +=1;
        }
        emit Voted(_projectId, msg.sender);
    }

    function tallyVote(uint _projectId) public onlyOwner isValidProjId(_projectId) 
    {
        require(projectInfoContract.getVoteValidationStatus(_projectId) == ProjectInfo.VoteValidationStatus.VotingSessionClose, "Voting Session not Closed yet !");

        uint totalVotes = projectCountVotes[_projectId].yesVotes + projectCountVotes[_projectId].noVotes; // TODO pondéré poids invest.
        // uint quorum = totalCommunity * 10 / 100; // quorum is 10% of the total number of voters possessing the governance token

        if (totalVotes == 0 ) {
            // No votes !
            // projet non validé 
            projectInfoContract.setVoteValidationStatus(_projectId, ProjectInfo.VoteValidationStatus.ProjectRejected);
            emit ProjectRejected(_projectId);
        }

        uint yesPercentage = (projectCountVotes[_projectId].yesVotes * 100) / totalVotes;
        if (yesPercentage > 66) 
        {
            // if(projectCountVotes[_projectId].yesVotes > quorum ) // TODO 
            // projet validé  ==> passe à l'étapde crowfunding 
            projectInfoContract.setVoteValidationStatus(_projectId, ProjectInfo.VoteValidationStatus.ProjectAccepted);
            emit ProjectAccepted(_projectId);
        }
        else {
            // projet non validé 
            projectInfoContract.setVoteValidationStatus(_projectId, ProjectInfo.VoteValidationStatus.ProjectRejected);
            emit ProjectRejected(_projectId);
        }
    }
}