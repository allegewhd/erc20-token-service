
pragma solidity ^0.4.11;


import './StandardToken.sol';


contract FixedCapSampleCoin is StandardToken {

    // metadata
    string  public constant name     = "Fixed Cap Sample Coin";
    string  public constant symbol   = "FCSC";
    string  public constant version  = "1.0";
    uint8   public constant decimals = 3;
    bool    public constant isFixed  = true;
    uint256 public constant tokenCap =  42 * (10**9) * (10**decimals);

    // contract owner(deployer)
    address public owner;

    // constructor
    function FixedCapSampleCoin() {
        owner = msg.sender;
        totalSupply = tokenCap;
        balances[owner] = totalSupply;
    }

}