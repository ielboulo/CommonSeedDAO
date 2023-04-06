// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SeedToken is ERC20 {

    uint256 constant MIN_GOVERNANCE_TOKENS = 1000;
    uint256 public holdersCount;
    mapping(address => bool) private _holders; // TODO : if not needed, to remove


    constructor() ERC20("SEED", "SDC") {
        _mint(msg.sender, 1000000000 * 18 ** decimals()); // Mint 1 Billion of Seed tokens
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override 
    {
        require(amount > 0, "SEED Token: amount must be > 0 !");
        super._beforeTokenTransfer(from, to, amount);

        if (!_holders[from] && balanceOf(from) >= MIN_GOVERNANCE_TOKENS) 
        {
            _holders[from] = true;
            holdersCount++;
        } else if (_holders[from] && (balanceOf(from) - amount ) < MIN_GOVERNANCE_TOKENS) 
        {
            _holders[from] = false;
            holdersCount--;
        }

        if (!_holders[to] && (balanceOf(to) + amount) >= MIN_GOVERNANCE_TOKENS) 
        {
            _holders[to] = true;
            holdersCount++;
        } 
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(amount > 0, "SEED Token: amount must be > 0 !");
        super._afterTokenTransfer(from, to, amount);
    }
}

// contract SEED {
//     string public name;
//     string public symbol;
//     uint8 public decimals;
//     uint256 public totalSupply;

//     mapping (address => uint256) public balanceOf;
//     mapping (address => mapping (address => uint256)) public allowance;

//     event Transfer(address indexed from, address indexed to, uint256 value);
//     event Approval(address indexed owner, address indexed spender, uint256 value);

//     constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply) {
//         name = _name;
//         symbol = _symbol;
//         decimals = _decimals;
//         totalSupply = _totalSupply;
//         balanceOf[msg.sender] = _totalSupply;
//         emit Transfer(address(0), msg.sender, _totalSupply);
//     }

//     function transfer(address _to, uint256 _value) public returns (bool success) {
//         require(balanceOf[msg.sender] >= _value);
//         balanceOf[msg.sender] -= _value;
//         balanceOf[_to] += _value;
//         emit Transfer(msg.sender, _to, _value);
//         return true;
//     }

//     function approve(address _spender, uint256 _value) public returns (bool success) {
//         allowance[msg.sender][_spender] = _value;
//         emit Approval(msg.sender, _spender, _value);
//         return true;
//     }

//     function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
//         require(_value <= balanceOf[_from]);
//         require(_value <= allowance[_from][msg.sender]);
//         balanceOf[_from] -= _value;
//         balanceOf[_to] += _value;
//         allowance[_from][msg.sender] -= _value;
//         emit Transfer(_from, _to, _value);
//         return true;
//     }
// }
