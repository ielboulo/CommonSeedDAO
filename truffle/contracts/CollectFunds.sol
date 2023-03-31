// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract CollectFunds {
    address public admin;
    address public tokenAddress;
    uint public minAmount;
    uint public endTime;
    uint public totalRaised;

    mapping(address => uint) contributions;
    mapping(address => bool)  ended_investor;

    bool public ended;

    event Contribution(address contributor, uint amount);
    event Withdraw(address  admin, uint amount);

// _tokenAddress of USDT  0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832 
// source : https://mumbai.polygonscan.com/token/0xa02f6adc7926efebbd59fd43a84f4e0c0c91e832?a=0xe84d601e5d945031129a83e5602be0cc7f182cf3
    constructor(address _admin, address _tokenAddress, uint _minAmount, uint _endTime) {
        admin = _admin;
        tokenAddress = _tokenAddress;
        minAmount = _minAmount;
        endTime = _endTime;
    }

    function contribute(uint _amount) external {
        require(block.timestamp <= endTime, "Fund Collecting is finished !");
        require(_amount >= minAmount, string(abi.encodePacked("Minimum amount to participate is ", minAmount)));

        IERC20 token = IERC20(tokenAddress);
        uint allowance = token.allowance(msg.sender, address(this)); 
        require(allowance >= _amount, "allowance is not ok ");
        
        bool success = token.transferFrom(msg.sender, address(this), _amount);
        require(success, "transferFrom Failed");
        
        contributions[msg.sender] += _amount;
        totalRaised += _amount;
        emit Contribution(msg.sender, _amount);
    }


    function withdraw_all_admin() external {
        require(msg.sender == admin, "You're Not Admin");
        require(block.timestamp > endTime, "Funds collecting is not closed yet");
        
        IERC20 token = IERC20(tokenAddress);
        uint balance = token.balanceOf(address(this));
        require(balance > 0, "Not Engough Balance");
        
        bool success = token.transfer(admin, balance);
        require(success, "Transfer is failed");
            
        emit Withdraw(admin,  balance);
        ended = true;
    }


    function withdraw_investor() external {
        require(block.timestamp > endTime, "Funds collecting is not closed yet");
        require(!ended_investor[msg.sender], string(abi.encodePacked("Funds Already Withdrawn for : ", msg.sender)));
        require(contributions[msg.sender] >0 , string(abi.encodePacked("You have never contributed : ", msg.sender)));

        IERC20 token = IERC20(tokenAddress);

        uint invested_amount = contributions[msg.sender];
        
        bool success = token.transfer(msg.sender, invested_amount);
        require(success, "Transfer is failed");
            
        emit Withdraw(msg.sender,  invested_amount);
        ended_investor[msg.sender] = true;
    }
}
