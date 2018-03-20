# The Button



### Design Assumptions & Considerations
* The creator of the contract will send payment upon creation. This will:
	* set the value that must be included with each call to `pressButton`
	* act as the first "press" of the button
* There is no limit to the number of times an individual address can press the button. 
* As written, once the `claimTreasure` has been called successfully, the contract will self-destruct.
* A *helper* contract was created to facilitate development & testing.  Specifically, for creating additional blocks so that `claimTreasure` could be called sucessfully.
	
		
### Manual Testing Procedure

Caveat: for ease the contract was tested in Remix

1. Compile the contracts
1. *Create* **TheButton** by sending 1 ether from address: `0x583031d1113ad414f02576bd6afabfb302140225`
1. Call `pressButton` with 1 ether from address: `0x583031d1113ad414f02576bd6afabfb302140225`
1. Call `pressButton` with 1 ether from address: `0xdd870fa1b7c4700f2bd7f44238821c26f7392148`
1. Call `pressButton` with 1 ether from address: `0x583031d1113ad414f02576bd6afabfb302140225`
1. Call `claimTreasure` from address: `0x583031d1113ad414f02576bd6afabfb302140225`

 > Expected Result: "The transaction has been reverted to the initial state."
1. *Create* **TestTheButtonHelper** using any available address
2. On **TestTheButtonHelper**, call `getBlockNumber` 
3. On **TheButton** , call `claimPossibleBlockNumber` 

 > Expected Result: The block number for these two will be the same.

1.  On **TestTheButtonHelper**, call `incrementBlock` three (3) times
1.  Call `claimTreasure` from address: `0xdd870fa1b7c4700f2bd7f44238821c26f7392148` 

 > Expected Result: "The transaction has been reverted to the initial state."
1. Call `claimTreasure` from address: `0x583031d1113ad414f02576bd6afabfb302140225` 

 > Expected Result: ether for this address increases by 4 

### Unit Tests 
to run, use: `truffle test`

1. a new contract should have the expected initial balance 
1. a new contract will not be created if not funded with an initial balance
1. a new, pressed contract will have the correct balance 
1. a new, pressed contract (with the wrong stakes) will have the correct balance 
1. a new, pressed contract, can only be claimed by the last pressor, after three blocks have been mined 