// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./voting.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract FundRelease {
    address public projectOwner;
    uint public totalFunds;
    uint public remainingFunds;
    uint public currentPhase;
    uint public totalPhases;
    address public usdtContractAddress;

    mapping(uint => uint) public phaseFunds;
    mapping(uint => bool) public phaseReleased;
    mapping(uint => uint) public phaseVotes;

    constructor(address _projectOwner, uint _totalFunds, uint _totalPhases, address _usdtContractAddress) {
        projectOwner = _projectOwner;
        totalFunds = _totalFunds;
        remainingFunds = _totalFunds;
        totalPhases = _totalPhases;
        usdtContractAddress = _usdtContractAddress;
    }

    function releaseFunds() public {
        require(currentPhase < totalPhases, "All phases have already been released");

        // Check if previous phase has been released
        if (currentPhase > 0) {
            require(phaseReleased[currentPhase - 1], "Previous phase has not been released");
        }

        // Check if enough votes were cast in previous phase
        if (currentPhase > 0 && phaseVotes[currentPhase - 1] > 0) {
            Voting votingContract = Voting(votingContractAddress);
            uint yesVotes = votingContract.getYesVotes(phaseVotes[currentPhase - 1]);
            uint noVotes = votingContract.getNoVotes(phaseVotes[currentPhase - 1]);
            require(yesVotes > noVotes, "Not enough yes votes to release funds");
        }

        // Calculate funds to release
        uint fundsToRelease = totalFunds / totalPhases;
        phaseFunds[currentPhase] = fundsToRelease;
        phaseReleased[currentPhase] = true;
        currentPhase++;
        remainingFunds -= fundsToRelease;

        // Transfer USDT to project owner
        IERC20 usdt = IERC20(usdtContractAddress);
        usdt.transfer(projectOwner, fundsToRelease);
    }

    function setVotes(uint _phase, uint _votes) public {
        require(msg.sender == projectOwner, "Only project owner can set votes");
        require(_phase < totalPhases, "Invalid phase");

        phaseVotes[_phase] = _votes;
    }
}
