var Migrations = artifacts.require("./Migrations.sol");
var TheButton = artifacts.require("./TheButton.sol");
var TestTheButtonHelper = artifacts.require("./TestTheButtonHelper.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
//   deployer.deploy(TheButton);
//   deployer.deploy(TestTheButtonHelper);
};
