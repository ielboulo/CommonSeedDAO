
//////////// REMBOURSEMENT SI ECHEC COLLECTE :

pragma solidity ^0.8.0;
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract USDTCrowdsale {
    address public admin;
    address public usdtAddress;
    uint256 public goal;
    uint256 public raised;
    bool public closed;
    mapping(address => uint256) public contributions;
    mapping(address => bool) public claimedRefund;

    event GoalReached(uint256 amountRaised);
    event FundTransfer(address backer, uint256 amount, bool isContribution);
    event RefundClaimed(address backer, uint256 amount);

    constructor(address _admin, address _usdtAddress, uint256 _goal) {
        admin = _admin;
        usdtAddress = _usdtAddress;
        goal = _goal;
    }

    function contribute(uint256 amount) public {
        require(!closed, "Crowdsale is closed");
        IERC20 usdtToken = IERC20(usdtAddress);
        uint256 balanceBefore = usdtToken.balanceOf(address(this));
        require(usdtToken.transferFrom(msg.sender, address(this), amount), "USDT transfer failed");
        uint256 balanceAfter = usdtToken.balanceOf(address(this));
        uint256 contribution = balanceAfter - balanceBefore;
        contributions[msg.sender] += contribution;
        raised += contribution;
        emit FundTransfer(msg.sender, contribution, true);

        if (raised >= goal) {
            closed = true;
            emit GoalReached(raised);
        }
    }

    function withdraw() public {
        require(closed, "Crowdsale is not closed yet");
        require(msg.sender == admin, "Only the admin can withdraw funds");

        IERC20 usdtToken = IERC20(usdtAddress);
        uint256 balanceBefore = usdtToken.balanceOf(address(this));
        require(usdtToken.transfer(admin, balanceBefore), "USDT transfer failed");
        uint256 balanceAfter = usdtToken.balanceOf(address(this));
        uint256 withdrawAmount = balanceAfter - balanceBefore;
        emit FundTransfer(admin, withdrawAmount, false);
    }

    function claimRefund() public {
        require(closed, "Crowdsale is not closed yet");
        require(raised < goal, "Crowdsale was successful, no refunds available");
        require(contributions[msg.sender] > 0, "You have not contributed to this crowdsale");
        require(!claimedRefund[msg.sender], "Refund already claimed");

        IERC20 usdtToken = IERC20(usdtAddress);
        uint256 contribution = contributions[msg.sender];
        contributions[msg.sender] = 0;
        claimedRefund[msg.sender] = true;
        require(usdtToken.transfer(msg.sender, contribution), "USDT transfer failed");
        emit RefundClaimed(msg.sender, contribution);
    }
}
