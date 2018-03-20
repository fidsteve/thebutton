pragma solidity ^0.4.19;

contract TheButton {

    address public addrPressedMostRecent; // the most recent address used to "press"
    uint public buttonStakes; // assuming the button stake value is variable and
                              // set by the creator (i.e. msg.sender)
    uint public claimPossibleBlockNumber; // the block after which claim is possible

    uint constant waitBlocksBeforeValidClaim = 3;
    uint constant weiButtonPressFeeFloor = 0;

    function pressButton() public payable {
        require(msg.value == buttonStakes);
        addrPressedMostRecent = msg.sender;
        claimPossibleBlockNumber = block.number + waitBlocksBeforeValidClaim;
    }

    function TheButton() public payable {
        // msg.sender is the caller of the contract caller
        require(msg.value > weiButtonPressFeeFloor);
        buttonStakes = msg.value;
        pressButton();
    }

    function claimTreasure() public {
        require(msg.sender == addrPressedMostRecent);
        require(block.number > claimPossibleBlockNumber);
        selfdestruct(msg.sender);

        // alternately, if, after claim, contract instance
        //                  can be reused for more pressing:

        // msg.sender.transfer(this.balance);
    }

}

contract TestTheButtonHelper {

        uint public x;

        function incrementBlock() public {
            x+=1;
        }

        function getBlockNumber() public constant returns (uint ret) {
            return block.number;
        }

    }
