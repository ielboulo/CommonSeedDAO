// SPDX-License-Identifier: MIT


/// @title  FundraisingProject
/// @author Ilham EL BOULOUMI
/// @dev   FundraisingProject : Smart contract la collecte des fonds

pragma solidity 0.8.19;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./ProjectInfo.sol";

contract FundraisingProject is Ownable {

    // Events - Begin = 
    event FundraisingPhaseOpen(uint _projectId);
    event FundraisingPhaseClosed(uint projectId);
    event FundraisingSuccessful(uint projectId);
    event FundraisingFailed(uint projectId);
    event WithdrawalPhaseOpen(uint projectId);
    event WithdrawalPhaseClosed(uint projectId);
    event Contribute(uint projectId, address investor, uint amount);
    event Withdraw(uint projectId, address _address, uint amount);
    event UnlockFundsSucessful(uint projectId, address _address, uint amount);
    // Events - End 

 
    IERC20 usdtToken; 
    ProjectInfo projectInfoContract;

    constructor(address _usdtAddress, address _projectInfoContractAddress) {   
        // address _tokenAddress in USDT          
        //address token_USDT_Polygon_address = 0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832;
        usdtToken = IERC20(_usdtAddress);
        projectInfoContract = ProjectInfo(_projectInfoContractAddress);

    }
    modifier isValidProjId(uint _projectId) {
        require(_projectId <= projectInfoContract.getNumProjects(), "ERROR : Invalid ProjectID");
        _;
    }
    function openFundraisingPhase(uint _projectId) external onlyOwner isValidProjId(_projectId) {
        require(projectInfoContract.getVoteValidationStatus(_projectId) == ProjectInfo.VoteValidationStatus.ProjectAccepted, "ERROR : Project Not Validated for Funraise!");
        require(projectInfoContract.getFundraisingStatus(_projectId) == ProjectInfo.FundraisingStatus.FundraisingPhaseOpen, "Fundraising phase not open !");
        emit FundraisingPhaseOpen(_projectId);
    }

    function closeFundraisingPhase(uint _projectId) external onlyOwner isValidProjId(_projectId) {
        require(projectInfoContract.getFundraisingStatus(_projectId) == ProjectInfo.FundraisingStatus.FundraisingPhaseOpen, "Fundraising phase not open !");
        projectInfoContract.setFundraisingStatus(_projectId, ProjectInfo.FundraisingStatus.FundraisingPhaseClosed);     
        emit FundraisingPhaseClosed(_projectId);
    }

    function openWithdrawalPhase(uint _projectId) external onlyOwner isValidProjId(_projectId)
    {
        require(projectInfoContract.getFundraisingStatus(_projectId) == ProjectInfo.FundraisingStatus.FundraisingFailed, "Fundraising phase not failed !");
        projectInfoContract.setFundraisingStatus(_projectId, ProjectInfo.FundraisingStatus.WithdrawalPhaseOpen);
        emit WithdrawalPhaseOpen(_projectId);
    }

    function closeWithdrawalPhase(uint _projectId) external onlyOwner isValidProjId(_projectId)
    {
        require(projectInfoContract.getFundraisingStatus(_projectId) == ProjectInfo.FundraisingStatus.WithdrawalPhaseOpen, "Withdrawal phase not open !");
        projectInfoContract.setFundraisingStatus(_projectId, ProjectInfo.FundraisingStatus.WithdrawalPhaseClosed);
        emit WithdrawalPhaseClosed(_projectId);
    }

    function contribute(uint _projectId, uint _amount) external isValidProjId(_projectId) {
        require(projectInfoContract.getFundraisingStatus(_projectId) == ProjectInfo.FundraisingStatus.FundraisingPhaseOpen, "Fundraising phase not open !"); 
        require(block.timestamp <= projectInfoContract.getFundraisingDeadline(_projectId), "Fundraise Deadline is finished !");
        require(_amount >= projectInfoContract.getMinContributionPerInvestor(_projectId), string("Minimum amount not respected"));
        
        uint allowance = usdtToken.allowance(msg.sender, address(this)); 
        require(allowance >= _amount, "allowance is not ok ");
    
        bool success = usdtToken.transferFrom(msg.sender, address(this), _amount);
        require(success, "transferFrom Failed");
        
        projectInfoContract.incrementContributions(_projectId, msg.sender, _amount);
        projectInfoContract.incrementTotalRaised(_projectId, _amount);
        // projectInfoContract.incrementNumInvestors(_projectId);
        emit Contribute(_projectId, msg.sender, _amount);
    }

    function checkFundraisingGoals(uint _projectId) external onlyOwner isValidProjId(_projectId) 
    {
        require(projectInfoContract.getFundraisingStatus(_projectId) == ProjectInfo.FundraisingStatus.FundraisingPhaseClosed, "Fundraising phase not closed yet !");
        if(projectInfoContract.getTotalRaised(_projectId) >= projectInfoContract.getGoalAmount(_projectId))
        {
            projectInfoContract.setFundraisingStatus(_projectId, ProjectInfo.FundraisingStatus.FundraisingSuccessful);
            projectInfoContract.calculatePercentageContribs(_projectId);
            emit FundraisingSuccessful(_projectId);
        }
        else {
            projectInfoContract.setFundraisingStatus(_projectId, ProjectInfo.FundraisingStatus.FundraisingFailed);
            emit FundraisingFailed(_projectId);
        }
    }

    function withdrawInvestor(uint _projectId) external isValidProjId(_projectId) 
    {
        require(projectInfoContract.getFundraisingStatus(_projectId) == ProjectInfo.FundraisingStatus.FundraisingPhaseClosed, "Fundraising phase not closed yet !");
        require(block.timestamp > projectInfoContract.getFundraisingDeadline(_projectId), "Funds collecting is not closed yet");

        require(projectInfoContract.getContributions(_projectId,msg.sender) >0 , "You have never contributed Or Already Withdrawn");

        uint invested_amount = projectInfoContract.getContributions(_projectId, msg.sender) ;
        
        bool success = usdtToken.transfer(msg.sender, invested_amount);
        require(success, "Transfer is failed");
        
        projectInfoContract.setContributions(_projectId, msg.sender, 0); 
        projectInfoContract.decrementTotalRaised(_projectId, invested_amount);

        emit Withdraw(_projectId, msg.sender,  invested_amount);
    }

    function unlockFunds(uint _projectId, uint256 _amoutToUnlock) external onlyOwner isValidProjId(_projectId)  returns(bool)
    {
        // check balance vs amount
        uint256 contractBalance = usdtToken.balanceOf(address(this));
        require(contractBalance >= _amoutToUnlock, "Not enough balance in the smart contract");
 
        address projectOwner = projectInfoContract.getProjectOwner(_projectId);
        bool success = usdtToken.transfer(projectOwner, _amoutToUnlock);
        require(success, "transfer to projectOwner Failed");

        emit UnlockFundsSucessful( _projectId,  projectOwner,  _amoutToUnlock);
        return success;
    }
}
