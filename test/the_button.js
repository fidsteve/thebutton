const TheButton = artifacts.require("./TheButton.sol");
const TestTheButtonHelper = artifacts.require("./TestTheButtonHelper.sol");

contract('TheButton', (accounts) => {
  describe('Given that I have a TheButton Contract', () => {
    it('a new contract should have the expected initial balance', async () => {
      const the_button = await TheButton.new({ from: accounts[0], value:web3.toWei(1, "ether") });

      value = await the_button.buttonStakes.call();

      assert(value == web3.toWei(1, "ether"));

    });

    it('a new contract will not be created if not funded with an initial balance', () => {
      TheButton.new({ from: accounts[0], value:0 }).then( (returnValue) => {
              assert(false, "contract new was supposed to throw but didn't.");
         }).catch(function(error) {
          if(error.toString().indexOf("revert") != -1) {
             // console.log("We were expecting a Solidity throw (aka an revert exception), we got one. Test succeeded.");
             assert(true);
           } else {
             // if the error is something else (e.g., the assert from previous promise), then we fail the test
             assert(false, error.toString());
           }
         });

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

      try {
        await the_button.pressButton({ from: accounts[1], value:web3.toWei(2, "ether"), gas:500000 });
        assert(false, "contract new was supposed to throw but didn't.");
       }
      catch(error)
        {
          if(error.toString().indexOf("revert") != -1) {
            // console.log("We were expecting a Solidity throw (aka an revert exception), we got one. Test succeeded.");
          } else {
             // if the error is something else (e.g., the assert from previous promise), then we fail the test
             console.log("some other error");
             assert(false, error.toString());
           }
         };

      const bal2 = await the_button.contract._eth.getBalance(the_button.address);
      assert(bal2.toNumber() == web3.toWei(1, "ether"));

    });

    // to make this code more maintainable, there are two negation tests and one affirmation  test
    it('a new, pressed contract, can only be claimed by the last pressor, after three blocks have been mined', async () => {
      const the_button = await TheButton.new({ from: accounts[0], value:web3.toWei(1, "ether") });
      const the_button_helper = await TestTheButtonHelper.new({ from: accounts[0]});

      the_button.pressButton({ from: accounts[1], value:web3.toWei(1, "ether"), gas:500000 });

      await the_button.pressButton({ from: accounts[1], value:web3.toWei(1, "ether"), gas:500000 });
      await the_button.pressButton({ from: accounts[2], value:web3.toWei(1, "ether"), gas:500000 });
      await the_button_helper.incrementBlock(); // block 1
      await the_button_helper.incrementBlock(); // block 2

      // TEST 1: claim before three additional blocks will fail
      try {
        await the_button.claimTreasure({ from: accounts[2]});
        assert(false); // error message below
      }
      catch (error) {
        if(error.toString().indexOf("revert") != -1) {
          // console.log("We were expecting a Solidity throw (aka an revert exception), we got one. Test succeeded.");
        } else {
           if (error.name === 'AssertionError') {
              assert(false, "claimTreasure (after only two additional blocks mined) did not fail");
             }
           else {
             // if the error is something else (e.g., the assert from previous promise), then we fail the test
             console.log("some other error - only two blocks mined test");
             assert(false, error.toString());
          };
        }
      };

      await the_button_helper.incrementBlock(); // block 3


      // TEST 2 : an address other than last pressor will not be able to claim
      try {
        await the_button.claimTreasure({ from: accounts[1]});
        assert(false); // error message below
      }
      catch (error) {
        if(error.toString().indexOf("revert") != -1) {
          // console.log("We were expecting a Solidity throw (aka an revert exception), we got one. Test succeeded.");
        } else {
           if (error.name === 'AssertionError') {
             assert(false, "claimTreasure (by the incorrect address; after 3 blocks mined) did not fail");
             }
           else {
              // if the error is something else (e.g., the assert from previous promise), then we fail the test
              console.log("some other error - incorrect address test");
              assert(false, error.toString());
            };
        }
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
