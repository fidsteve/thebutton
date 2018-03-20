const TheButton = artifacts.require("./TheButton.sol");
const TestTheButtonHelper = artifacts.require("./TestTheButtonHelper.sol");


async function catchErrorString (fn, fn_arg, pass_string, failure_message) {
      try {
        await fn(fn_arg);
        assert(false);
       }
      catch(error)
        {
          if(error.toString().indexOf(pass_string) != -1) {
            // console.log("We were expecting a Solidity throw (aka an revert exception), we got one. Test succeeded.");
              return({assertFalseFlag: 0, message: ""});
          } else {
            if (error.name === 'AssertionError') {
              // console.log("AssertionError found - " + failure_message);
              return({assertFalseFlag: 1, message: failure_message});
            }
            else {
              // if the error is something else (e.g., the assert from previous promise), then we fail the test
              // console.log("some other error - " + failure_message);
              return({assertFalseFlag: 1, message: "During ("+failure_message+")  Error:"+error.toString()});
            };

          };
       };
}

contract('TheButton', (accounts) => {
  describe('Given that I have a TheButton Contract', () => {
    it('a new contract should have the expected initial balance', async () => {
      const the_button = await TheButton.new({ from: accounts[0], value:web3.toWei(1, "ether") });

      value = await the_button.buttonStakes.call();

      assert(value == web3.toWei(1, "ether"));

    });

    it('a new contract will not be created if not funded with an initial balance', async () => {

      let {assertFalseFlag, message} =
        await catchErrorString ( TheButton.new,
                                 { from: accounts[0], value:0 },
                                 "revert" ,
                                 "contract new with value 0 supposed to cause revert, but did not." );

      if (assertFalseFlag == 1) {
        assert(false, message);
      }
      else {
        assert(true);
      };

    });

    it('a new, pressed contract will have the correct balance', async () => {
      const the_button = await TheButton.new({ from: accounts[0], value:web3.toWei(1, "ether") });

      await the_button.pressButton({ from: accounts[1], value:web3.toWei(1, "ether"), gas:500000 });
      await the_button.pressButton({ from: accounts[1], value:web3.toWei(1, "ether"), gas:500000 });
      await the_button.pressButton({ from: accounts[2], value:web3.toWei(1, "ether"), gas:500000 });
      const bal2 = await the_button.contract._eth.getBalance(the_button.address);

      assert(bal2.toNumber() == web3.toWei(4, "ether"));

    });

    it('a new, pressed contract (with the wrong stakes) will have the correct balance', async () => {
      const the_button = await TheButton.new({ from: accounts[0], value:web3.toWei(1, "ether") });

      let {assertFalseFlag, message} =
        await catchErrorString ( the_button.pressButton,
                                 { from: accounts[1], value:web3.toWei(2, "ether"), gas:500000 },
                                 "revert" ,
                                 "press with invalid stakes was supposed to cause revert, but did not." );

      if (assertFalseFlag == 1) {
        assert(false, message);
      };

      const bal2 = await the_button.contract._eth.getBalance(the_button.address);
      assert(bal2.toNumber() == web3.toWei(1, "ether"));

    });

    // to make this code more maintainable, there are two negation tests and one affirmation  test
    it('a new, pressed contract, can only be claimed by the last pressor, after three blocks have been mined', async () => {
      const the_button = await TheButton.new({ from: accounts[0], value:web3.toWei(1, "ether") }); //treasure = 1
      const the_button_helper = await TestTheButtonHelper.new({ from: accounts[0]});

      await the_button.pressButton({ from: accounts[1], value:web3.toWei(1, "ether"), gas:500000 }); //treasure = 2
      await the_button.pressButton({ from: accounts[1], value:web3.toWei(1, "ether"), gas:500000 }); //treasure = 3
      await the_button.pressButton({ from: accounts[2], value:web3.toWei(1, "ether"), gas:500000 }); //treasure = 4

      await the_button_helper.incrementBlock(); // block 1
      await the_button_helper.incrementBlock(); // block 2

      // TEST 1: claim before three additional blocks will fail
      var {assertFalseFlag, message} =
        await catchErrorString ( the_button.claimTreasure,
                                 { from: accounts[2]},
                                 "revert" ,
                                 "claimTreasure (after only two additional blocks mined) did not fail");

      if (assertFalseFlag == 1) {
        assert(false, message);
      };

      await the_button_helper.incrementBlock(); // block 3

      // TEST 2 : even after three blocks, an address other than last pressor will not be able to claim
      var {assertFalseFlag, message} =
        await catchErrorString ( the_button.claimTreasure,
                                 { from: accounts[1]},
                                 "revert" ,
                                 "claimTreasure (by the incorrect address; after 3 blocks mined) did not fail");

      if (assertFalseFlag == 1) {
        assert(false, message);
      };

      // TEST 3 : only the last pressor can claim successfully
      balance_before_claim = web3.eth.getBalance(accounts[2]).toNumber();
      await the_button.claimTreasure({ from: accounts[2]});
      balance_after_claim = web3.eth.getBalance(accounts[2]).toNumber();
      treasure_value = web3.fromWei(balance_after_claim-balance_before_claim,'ether');
      // since some wei is used to pay transaction fee, the treausure will be less than 4, but greater than 3 ether
      assert(treasure_value > 3 && treasure_value < 4);

    });

  });
});
