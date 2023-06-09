// SPDX-License-Identifier= MIT

pragma solidity 0.8.19;
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CollateralVault {
    address public admin;
    address public collateralAddress;
    uint256 public totalCollateral;
    mapping(address => uint256) public balances;
    mapping(address => bool) public voted;
    uint256 public threshold;
    bool public canWithdraw;

    event CollateralDeposited(address depositor, uint256 amount);
    event WithdrawalPermissionGranted();
    event WithdrawalPermissionRevoked();
    event CollateralWithdrawn(address recipient, uint256 amount);

    constructor(address _admin, address _collateralAddress, uint256 _threshold) {
        admin = _admin;
        collateralAddress = _collateralAddress;
        threshold = _threshold;
    }

    function deposit(uint256 amount) public {
        require(amount > 0, "Amount must be greater than zero");
        require(IERC20(collateralAddress).transferFrom(msg.sender, address(this), amount), "Collateral transfer failed");

        balances[msg.sender] += amount;
        totalCollateral += amount;

        emit CollateralDeposited(msg.sender, amount);
    }

    function grantWithdrawalPermission() public {
        require(msg.sender == admin, "Only the admin can grant withdrawal permission");
        require(!canWithdraw, "Withdrawal permission already granted");

        canWithdraw = true;
        emit WithdrawalPermissionGranted();
    }

    function revokeWithdrawalPermission() public {
        require(msg.sender == admin, "Only the admin can revoke withdrawal permission");
        require(canWithdraw, "Withdrawal permission already revoked");

        canWithdraw = false;
        emit WithdrawalPermissionRevoked();
    }


    function withdraw(uint256 amount) public {
        require(canWithdraw, "Withdrawal permission not granted");
        require(amount > 0 && amount <= totalCollateral, "Invalid withdrawal amount");

        IERC20 collateralToken = IERC20(collateralAddress);
        require(collateralToken.transfer(msg.sender, amount), "Collateral transfer failed");

        balances[msg.sender] -= amount;
        totalCollateral -= amount;

        emit CollateralWithdrawn(msg.sender, amount);
    }
}
