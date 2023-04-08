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
    // function setProjectOwner(address _projectOwner) public onlyOwner { // TODO : if not needed , to remove 
    //     require(_projectOwner != address(0), "Invalid address");
    //     projectOwnersMap[_projectOwner] = true;
    // }
    function getProjectOwner(uint _projectId) external view isValidProjId(_projectId) returns(address){
        return projectsGI[_projectId].projectOwner;
    }
///// Add Project 

    // remove if not needed TODO 
    // modifier onlyAdminOrProjectOwner() {
    //     require(msg.sender == owner() , "Unauthorized access"); // || projectOwnersMap[msg.sender]
    //     _;
    // }

    function addProject(address _projectOwner, string memory _projectTitle, uint _goalAmount, 
                     uint _totalPhases, uint256 _fundraisingDeadline, uint _minContribution) external onlyOwner 
   
    {
        numProjects += 1;
        ProjectGeneralInfo storage newProject = projectsGI[numProjects];
        
        newProject.projectOwner     = _projectOwner;
        newProject.projectTitle     = _projectTitle;
        newProject.goalAmount       = _goalAmount;
        newProject.totalPhases      = _totalPhases;
        newProject.fundraisingDeadline        = _fundraisingDeadline; // Stack too deep
        newProject.minContributionPerInvestor = _minContribution; // Stack too deep
        //newProject.maxContributionPerInvestor = _maxContribution; // Stack too deep
        //newProject.projectDeadline            = _projectDeadline; // Stack too deep
        //newProject.startDate                  = _startDate; // Stack too deep
        //newProject.endDate                    = _endDate; // Stack too deep
        //newProject.whitepaperLink             = _whitepaperLink; // Stack too deep

        //[_projectTitle]       = numProjects;
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

    // function getProjectIdByTitle(string memory _projectTitle) public view returns (uint) {
    //     return projectTitleToID[_projectTitle];
    // }

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
        //            mapping(uint => PhaseInfo) phasesInfo;  
            // phasesInfo[phaseId]. isUnlockSubmittedToVote / isUnlockAccepted / isUnlockExecuted / amountToUnlock
    
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
    // function getProjectIndexByOwner(address _projectOwner) public view returns (uint) {
    //     return projectOwnerToIndex[_projectOwner];
    // }

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

   // Stack too deep
    function getFundraisingDeadline(uint _projectId)  external view returns (uint256) {
        return projectsGI[_projectId].fundraisingDeadline;
    }
    function setFundraisingDeadline(uint _projectId, uint256 deadline)  external {
        projectsGI[_projectId].fundraisingDeadline = deadline;
   }

   // Stack too deep
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

    function IncrementNumProjects() external { // TODO to remove if not used 
                numProjects += 1;
    }
 

//////////////

 }
