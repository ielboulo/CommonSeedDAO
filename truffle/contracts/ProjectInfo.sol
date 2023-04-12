// SPDX-License-Identifier: MIT

/// @title  ProjectInfo
/// @author Ilham EL BOULOUMI
/// @dev   ProjectInfo : Smart contract de type "eternal storage" qui stocke les infos des projets de crowdfunding.
///        Smart contract partagé par tous les smart contracts de vote et de gestion de fonds

pragma solidity 0.8.19;
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";


contract ProjectInfo  is Ownable {

        enum  FundraisingStatus {
            FundraisingPhaseOpen,
            FundraisingPhaseClosed,
            FundraisingSuccessful,
            FundraisingFailed,
            WithdrawalPhaseOpen,
            WithdrawalPhaseClosed
        }

        enum VoteValidationStatus
        {
            RegisterVotersOpen, // 0
            RegisterVotersClose,
            VotingSessionOpen,
            VotingSessionClose,
            ProjectAccepted, // 4
            ProjectRejected // 5
        }

        enum  VoteUnlockStatus {
            UnlockProposalOpen,
            UnlockProposalClose,
            VotingSessionOpen,
            VotingSessionClose,
            UnlockAccepted,
            UnlockRejected
        }
        struct PhaseInfo {
            bool             isUnlockSubmittedToVote;
            bool             isUnlockAccepted;
            bool             isUnlockExecuted;
            uint256          amountToUnlock;
            VoteUnlockStatus voteUnlockStatus; 
        }

        struct Contributions {
            uint256 amountInvested;
            uint256 amountInvestedInPercentage;
        }
    struct ProjectProgressInfo { // validation fundraising // validation phase unlock
            bool        isValidated;
            uint256     totalRaised;
            uint256     totalUnlocked;
            uint256     remainingFunds;

            VoteValidationStatus                      voteValidationStatus;
            FundraisingStatus                         fundraisingStatus;

            uint                                       numberOfInvestors; 
            address []                                 addressContributions;
            mapping(address => Contributions)          contributions; // contributions[msg.sender] = amountInvested / amountInvestedInPercentage
            
            mapping(uint => PhaseInfo)                 phasesInfo; 
    } 

    struct ProjectGeneralInfo {     
            address  projectOwner; // payable
            string   projectTitle;
            uint256  goalAmount;
            uint     currentPhase;
            uint     totalPhases;
            uint     fundraisingDeadline;
            uint     minContributionPerInvestor;
            string   whitepaperLink;
    }

    uint numProjects;
    mapping(uint => ProjectGeneralInfo)  public projectsGI;
    mapping(uint => ProjectProgressInfo) public projectsPI;


//////// Set projectOwner :
    modifier isValidProjId(uint _projectId) {
        require(_projectId <= numProjects, "Invalid ProjectID");
        _;
    }

    function getProjectOwner(uint _projectId) external view isValidProjId(_projectId) returns(address){
        return projectsGI[_projectId].projectOwner;
    }
///// Add Project 
    function addProject(address _projectOwner, string memory _projectTitle, uint _goalAmount, 
                     uint _totalPhases, uint256 _fundraisingDeadline, uint _minContribution, string memory _whitepaperLink) external onlyOwner 
   
    {
        numProjects += 1;
        ProjectGeneralInfo storage newProject = projectsGI[numProjects];
        
        newProject.projectOwner     = _projectOwner;
        newProject.projectTitle     = _projectTitle;
        newProject.goalAmount       = _goalAmount;
        newProject.totalPhases      = _totalPhases;
        newProject.fundraisingDeadline        = _fundraisingDeadline; 
        newProject.minContributionPerInvestor = _minContribution; 
        newProject.whitepaperLink = _whitepaperLink; 
    }

//////// GETTERS & SETTERS 

    function getProjectIndexByTitle_2(string memory _projectTitle) public view returns (uint) {
        for (uint i = 0; i < numProjects; i++) {
            if (keccak256(bytes(projectsGI[i].projectTitle)) == keccak256(bytes(_projectTitle))) {
                return i;
            }
        }
        return 0; // if index = 0 ==> project not found 
    }

    function getLastProjectId() external view returns(uint)
    {
        return numProjects; 
    }
    function getProjectCurrentPhase(uint _projectId) external view returns(uint) {
        return projectsGI[_projectId].currentPhase;
    }
    function incrementProjectCurrentPhase(uint _projectId) external  {
        projectsGI[_projectId].currentPhase +=1;
    }
    function getProjectPhaseInfo(uint _projectId, uint _phaseId) external view returns(PhaseInfo memory) {
        return projectsPI[_projectId].phasesInfo[_phaseId];
    }
    function getUnlockSubmittedToVote(uint _projectId, uint _phaseId) external view returns(bool) {
        return projectsPI[_projectId].phasesInfo[_phaseId].isUnlockSubmittedToVote;
    }
    function setUnlockSubmittedToVote(uint _projectId, uint _phaseId, bool _decision) external {
        projectsPI[_projectId].phasesInfo[_phaseId].isUnlockSubmittedToVote = _decision;
    }
    function getPhaseUnlockAccepted(uint _projectId, uint _phaseId) external view returns(bool) {
        return projectsPI[_projectId].phasesInfo[_phaseId].isUnlockAccepted;
    }
    function setPhaseUnlockAccepted(uint _projectId, uint _phaseId, bool _decision) external {
        projectsPI[_projectId].phasesInfo[_phaseId].isUnlockAccepted = _decision;
    }
    function getPhaseUnlockExecuted(uint _projectId, uint _phaseId) external view returns(bool) {
        return projectsPI[_projectId].phasesInfo[_phaseId].isUnlockExecuted;
    }
    function setPhaseUnlockExecuted(uint _projectId, uint _phaseId, bool _decision) external {
        projectsPI[_projectId].phasesInfo[_phaseId].isUnlockExecuted = _decision;
    }
    function getPhaseAmoutToUnlock(uint _projectId, uint _phaseId) external view returns(uint256) {
        return projectsPI[_projectId].phasesInfo[_phaseId].amountToUnlock;
    }
    function setPhaseAmoutToUnlock(uint _projectId, uint _phaseId, uint256 _amount) external {
        projectsPI[_projectId].phasesInfo[_phaseId].amountToUnlock = _amount;
    }
    function getProjectTotalPhases(uint _projectId) external view returns(uint) {
        return projectsGI[_projectId].totalPhases;
    }

    function getNumProjects() public view returns(uint)
    {
        return numProjects;
    }

    function getVoteValidationStatus(uint _projectId) public view isValidProjId(_projectId) returns (VoteValidationStatus) {
        return projectsPI[_projectId].voteValidationStatus;
    }

    function setVoteValidationStatus(uint _projectId, VoteValidationStatus _newStatus) public isValidProjId(_projectId) 
    {
        projectsPI[_projectId].voteValidationStatus = _newStatus;
    }  
    function getVoteUnlockStatus(uint _projectId, uint _phase) public view isValidProjId(_projectId) returns (VoteUnlockStatus) {
        return projectsPI[_projectId].phasesInfo[_phase].voteUnlockStatus; 
    }

    function setVoteUnlockStatus(uint _projectId, uint _phase, VoteUnlockStatus _newStatus) public isValidProjId(_projectId){
        projectsPI[_projectId].phasesInfo[_phase].voteUnlockStatus = _newStatus; 
    }   

    function getTotalRaised(uint _projectId) view external  returns(uint256) {
        return projectsPI[_projectId].totalRaised;
    }

    function incrementTotalRaised(uint _projectId, uint256 _amount) external   {
        projectsPI[_projectId].totalRaised += _amount;
    }

    function decrementTotalRaised(uint _projectId, uint256 _amount) external   {
        projectsPI[_projectId].totalRaised -= _amount;
    }
    

    function getContributions(uint _projectId,  address _addr) view public  returns(uint256) {
        return projectsPI[_projectId].contributions[_addr].amountInvested;
    }

    function incrementContributions(uint _projectId, address _addr, uint256 _amount) external   {
        if(projectsPI[_projectId].contributions[_addr].amountInvested == 0)
        {
            projectsPI[_projectId].numberOfInvestors ++; 
            projectsPI[_projectId].addressContributions.push(_addr);
        }
        projectsPI[_projectId].contributions[_addr].amountInvested += _amount;
    }

    function getNumInvestors(uint _projectId) external view returns(uint) {
        return projectsPI[_projectId].numberOfInvestors;
    }
    function incrementNumInvestors(uint _projectId) public {
        projectsPI[_projectId].numberOfInvestors +=1;
    }
    function decrementNumInvestors(uint _projectId) public {
        projectsPI[_projectId].numberOfInvestors -=1;
    }

    function hasContributed(uint _projectId, address _investor) external view returns (bool) 
    {
        return getContributions(_projectId, _investor) > 0;
    }

    function setContributions(uint _projectId,  address _addr,  uint256 _amount) public {
        projectsPI[_projectId].contributions[_addr].amountInvested = _amount;
    }

    function getContributor(uint _projectId, uint index) external view returns(address) {
        return projectsPI[_projectId].addressContributions[index];
    }
    function calculatePercentageContribs(uint _projectId) external 
    {
        // Calculate the percentage of each investor's contribution
        for (uint i = 0; i < projectsPI[_projectId].numberOfInvestors; i++) {
            address investor = projectsPI[_projectId].addressContributions[i];
            if(projectsPI[_projectId].totalRaised != 0)
            {
                uint256 contributionPercentage = (projectsPI[_projectId].contributions[investor].amountInvested * 100) / projectsPI[_projectId].totalRaised;
                projectsPI[_projectId].contributions[investor].amountInvestedInPercentage = contributionPercentage;
            }
        }
    }
    function getVoteWeight(uint _projectId,  address _addr) external view returns(uint256) 
    {
        return projectsPI[_projectId].contributions[_addr].amountInvestedInPercentage;
    }
    
    function getGoalAmount(uint _projectId) view external  returns(uint256) {
        return projectsGI[_projectId].goalAmount;
    }

    function getFundraisingStatus (uint _projectId) external view returns(FundraisingStatus){
        return projectsPI[_projectId].fundraisingStatus;
    }

    function setFundraisingStatus (uint _projectId, FundraisingStatus _newStatus) external {
        projectsPI[_projectId].fundraisingStatus = _newStatus;
    }

    function getFundraisingDeadline(uint _projectId)  external view returns (uint256) {
        return projectsGI[_projectId].fundraisingDeadline;
    }
    function setFundraisingDeadline(uint _projectId, uint256 deadline)  external {
        projectsGI[_projectId].fundraisingDeadline = deadline;
   }

   function getMinContributionPerInvestor(uint _projectId) external view returns (uint256) {
       return projectsGI[_projectId].minContributionPerInvestor; 
   }

    function getRemainingFunds(uint _projectId) external view returns(uint256){
        return projectsPI[_projectId].remainingFunds;     
    }

    function getTotalUnlocked(uint _projectId) external view returns(uint256){
        return projectsPI[_projectId].totalUnlocked;     
    }

    function decrementRemainingFunds(uint _projectId, uint256 _amount) external {
        projectsPI[_projectId].remainingFunds -= _amount;     
    }
    function incrementTotalUnlocked(uint _projectId, uint256 _amount) external  {
        projectsPI[_projectId].totalUnlocked += _amount;     
    }

    function IncrementNumProjects() external { 
                numProjects += 1;
    }
//////////////

 }
