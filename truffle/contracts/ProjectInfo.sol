// SPDX-License-Identifier: MIT

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
            RegisterVotersOpen,
            RegisterVotersClose,
            VotingSessionOpen,
            VotingSessionClose,
            ProjectAccepted,
            ProjectRejected
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

        struct Project {     
            address  projectOwner; // payable
            string   projectTitle;
            uint     goalAmount;
            uint     currentPhase;
            uint     totalPhases;
            bool     isValidated;

            uint     minContributionPerInvestor;
            uint     maxContributionPerInvestor;
            uint     totalRaised;
            uint     totalUnlocked;
            uint     remainingFunds;

            uint     fundraisingDeadline;
            uint     projectDeadline;
            
            uint256  startDate;
            uint256  endDate;

            string   whitepaperLink; // sur ipfs

            VoteValidationStatus                      voteValidationStatus;
            FundraisingStatus                         fundraisingStatus;

            //mapping(address => uint)                  contributions_; // contributions[msg.sender] = amountInvested / amountInvestedInPercentage
            uint numberOfInvestors; 
            mapping(address => Contributions)          contributions; // contributions[msg.sender] = amountInvested / amountInvestedInPercentage
            address [] addressContributions;
           
            mapping(uint => PhaseInfo) phasesInfo;  
            // phasesInfo[phaseId]. isUnlockSubmittedToVote / isUnlockAccepted / isUnlockExecuted / amountToUnlock
            mapping(address => mapping(uint => bool)) investorVotes; // investorVotes[msg.sender][currentPhase] = hasVotedPhase;

    }

    uint numProjects;
    mapping(uint => Project) public projects;
    mapping(string => uint) public projectTitleToID;
    mapping(address => bool) projectOwnersMap;

//////// Set projectOwner :
    modifier isValidProjId(uint _projectId) {
        require(_projectId <= numProjects, "Invalid ProjectID");
        _;
    }
    function setProjectOwner(address _projectOwner) public onlyOwner { // TODO : if not needed , to remove 
        require(_projectOwner != address(0), "Invalid address");
        projectOwnersMap[_projectOwner] = true;
    }
    function getProjectOwner(uint _projectId) external view isValidProjId(_projectId) returns(address){
        return projects[_projectId].projectOwner;
    }
///// Add Project 

    modifier onlyAdminOrProjectOwner() {
        require(msg.sender == owner() || projectOwnersMap[msg.sender], "Unauthorized access");
        _;
    }
    function addProject(address _projectOwner, string memory _projectTitle, uint _goalAmount, 
                     uint _totalPhases, uint256 _projectDeadline, uint256 _fundraisingDeadline, 
                     uint _minContribution, uint _maxContribution,
                    uint256 _startDate, uint256 _endDate, string memory _whitepaperLink) external onlyAdminOrProjectOwner
    {
        numProjects += 1;
        Project storage newProject = projects[numProjects];
        
        newProject.projectOwner     = _projectOwner;
        newProject.projectTitle     = _projectTitle;
        newProject.goalAmount       = _goalAmount;
        newProject.totalPhases      = _totalPhases;

        newProject.minContributionPerInvestor = _minContribution;
        newProject.maxContributionPerInvestor = _maxContribution;
        newProject.projectDeadline            = _projectDeadline;
        newProject.fundraisingDeadline        = _fundraisingDeadline;
        newProject.startDate                  = _startDate;
        newProject.endDate                    = _endDate;
        newProject.whitepaperLink             = _whitepaperLink;

        projectTitleToID[_projectTitle]       = numProjects;
    }

//////// GETTERS & SETTERS 

    function getProjectIndexByTitle_2(string memory _projectTitle) public view returns (uint) {
        for (uint i = 0; i < numProjects; i++) {
            if (keccak256(bytes(projects[i].projectTitle)) == keccak256(bytes(_projectTitle))) {
                return i;
            }
        }
        return 0; // if index = 0 ==> project not found 
    }

    function getProjectIdByTitle(string memory _projectTitle) public view returns (uint) {
        return projectTitleToID[_projectTitle];
    }

    function getLastProjectId() external view returns(uint)
    {
        return numProjects; 
    }
    function getProjectCurrentPhase(uint _projectId) external view returns(uint) {
        return projects[_projectId].currentPhase;
    }
    function incrementProjectCurrentPhase(uint _projectId) external  {
        projects[_projectId].currentPhase +=1;
    }
    function getProjectPhaseInfo(uint _projectId, uint _phaseId) external view returns(PhaseInfo memory) {
        return projects[_projectId].phasesInfo[_phaseId];
        //            mapping(uint => PhaseInfo) phasesInfo;  
            // phasesInfo[phaseId]. isUnlockSubmittedToVote / isUnlockAccepted / isUnlockExecuted / amountToUnlock
    
    }
    function getUnlockSubmittedToVote(uint _projectId, uint _phaseId) external view returns(bool) {
        return projects[_projectId].phasesInfo[_phaseId].isUnlockSubmittedToVote;
    }
    function setUnlockSubmittedToVote(uint _projectId, uint _phaseId, bool _decision) external {
        projects[_projectId].phasesInfo[_phaseId].isUnlockSubmittedToVote = _decision;
    }
    function getPhaseUnlockAccepted(uint _projectId, uint _phaseId) external view returns(bool) {
        return projects[_projectId].phasesInfo[_phaseId].isUnlockAccepted;
    }
    function setPhaseUnlockAccepted(uint _projectId, uint _phaseId, bool _decision) external {
        projects[_projectId].phasesInfo[_phaseId].isUnlockAccepted = _decision;
    }
    function getPhaseUnlockExecuted(uint _projectId, uint _phaseId) external view returns(bool) {
        return projects[_projectId].phasesInfo[_phaseId].isUnlockExecuted;
    }
    function setPhaseUnlockExecuted(uint _projectId, uint _phaseId, bool _decision) external {
        projects[_projectId].phasesInfo[_phaseId].isUnlockExecuted = _decision;
    }
    function getPhaseAmoutToUnlock(uint _projectId, uint _phaseId) external view returns(uint256) {
        return projects[_projectId].phasesInfo[_phaseId].amountToUnlock;
    }
    function setPhaseAmoutToUnlock(uint _projectId, uint _phaseId, uint256 _amount) external {
        projects[_projectId].phasesInfo[_phaseId].amountToUnlock = _amount;
    }
    function getProjectTotalPhases(uint _projectId) external view returns(uint) {
        return projects[_projectId].totalPhases;
    }
    // function getProjectIndexByOwner(address _projectOwner) public view returns (uint) {
    //     return projectOwnerToIndex[_projectOwner];
    // }

    function getNumProjects() public view returns(uint)
    {
        return numProjects;
    }



    function getVoteValidationStatus(uint _projectId) public view isValidProjId(_projectId) returns (VoteValidationStatus) {
        return projects[_projectId].voteValidationStatus;
    }

    function setVoteValidationStatus(uint _projectId, VoteValidationStatus _newStatus) public isValidProjId(_projectId) 
    {
        projects[_projectId].voteValidationStatus = _newStatus;
    }  
    function getVoteUnlockStatus(uint _projectId, uint _phase) public view isValidProjId(_projectId) returns (VoteUnlockStatus) {
        return projects[_projectId].phasesInfo[_phase].voteUnlockStatus; 
    }
    function setVoteUnlockStatus(uint _projectId, uint _phase, VoteUnlockStatus _newStatus) public isValidProjId(_projectId){
        projects[_projectId].phasesInfo[_phase].voteUnlockStatus = _newStatus; 
    }   

    function getTotalRaised(uint _projectId) view external  returns(uint256) {
        return projects[_projectId].totalRaised;
    }

    function incrementTotalRaised(uint _projectId, uint256 _amount) external   {
        projects[_projectId].totalRaised += _amount;
    }

    function decrementTotalRaised(uint _projectId, uint256 _amount) external   {
        projects[_projectId].totalRaised -= _amount;
    }
    

    function getContributions(uint _projectId,  address _addr) view public  returns(uint256) {
        return projects[_projectId].contributions[_addr].amountInvested;
    }

    function incrementContributions(uint _projectId, address _addr, uint256 _amount) external   {
        if(projects[_projectId].contributions[_addr].amountInvested == 0)
        {
            projects[_projectId].numberOfInvestors ++; 
            projects[_projectId].addressContributions.push(_addr);
        }
        projects[_projectId].contributions[_addr].amountInvested += _amount;
    }

    function getNumInvestors(uint _projectId) external view returns(uint) {
        return projects[_projectId].numberOfInvestors;
    }

    function hasContributed(uint _projectId, address _investor) external view returns (bool) 
    {
        return getContributions(_projectId, _investor) > 0;
    }

    function setContributions(uint _projectId,  address _addr,  uint256 _amount) public {
        projects[_projectId].contributions[_addr].amountInvested = _amount;
    }

    function getContributor(uint _projectId, uint index) external view returns(address) {
        return projects[_projectId].addressContributions[index];
    }
    function calculatePercentageContribs(uint _projectId) external 
    {
        // Calculate the percentage of each investor's contribution
        for (uint i = 0; i < projects[_projectId].numberOfInvestors; i++) {
            address investor = projects[_projectId].addressContributions[i];
            if(projects[_projectId].totalRaised != 0)
            {
                uint256 contributionPercentage = (projects[_projectId].contributions[investor].amountInvested * 100) / projects[_projectId].totalRaised;
                projects[_projectId].contributions[investor].amountInvestedInPercentage = contributionPercentage;
            }
        }
    }
    function getVoteWeight(uint _projectId,  address _addr) external view returns(uint256) 
    {
        return projects[_projectId].contributions[_addr].amountInvestedInPercentage;
    }
    
    function getGoalAmount(uint _projectId) view external  returns(uint256) {
        return projects[_projectId].goalAmount;
    }

    function getFundraisingStatus (uint _projectId) external view returns(FundraisingStatus){
        return projects[_projectId].fundraisingStatus;
    }

    function setFundraisingStatus (uint _projectId, FundraisingStatus _newStatus) external {
        projects[_projectId].fundraisingStatus = _newStatus;
    }

    function getFundraisingDeadline(uint _projectId)  external view returns (uint256) {
        return projects[_projectId].fundraisingDeadline;
    }

    function getMinContributionPerInvestor(uint _projectId) external view returns (uint256) {
        return projects[_projectId].minContributionPerInvestor; 
    }

    function getRemainingFunds(uint _projectId) external view returns(uint256){
        return projects[_projectId].remainingFunds;     
    }

    function getTotalUnlocked(uint _projectId) external view returns(uint256){
        return projects[_projectId].totalUnlocked;     
    }

    function decrementRemainingFunds(uint _projectId, uint256 _amount) external {
        projects[_projectId].remainingFunds -= _amount;     
    }
    function incrementTotalUnlocked(uint _projectId, uint256 _amount) external  {
        projects[_projectId].totalUnlocked += _amount;     
    }

    function IncrementNumProjects() external { // TODO to remove if not used 
                numProjects += 1;
    }
 

//////////////

}
