const TokenSale = artifacts.require("MyTokenSale");
const Token = artifacts.require("MyToken");
const KycContract = artifacts.require("KycContract");
const BN = web3.utils.BN;
const chai = require("./setupchai");
const expect = chai.expect;

require("dotenv").config({ path: "../.env" });

contract("TokenSale Test", async (accounts) => {
  const [deployerAccount, recipient, anotherAccount] = accounts;
  it("Should not have my tokens in my deploy in my deloperAccount", async () => {
    let instance = await Token.deployed();
    return expect(
      instance.balanceOf(deployerAccount)
    ).to.eventually.be.a.bignumber.equal(new BN(0));
  });

  it("All tokens should be in the TokenSale Starmat contract by default", async () => {
    let instance = await Token.deployed();
    let balanceOfTokenSaleSmartContract = await instance.balanceOf(
      TokenSale.address
    );
    let totalSupply = await instance.totalSupply();
    expect(balanceOfTokenSaleSmartContract).to.be.a.bignumber.equal(
      totalSupply
    );
  });

  it("Should be possible to buy tokens", async () => {
    let tokenInstance = await Token.deployed();
    let tokenSaleInstance = await TokenSale.deployed();
    let kycInstance = await KycContract.deployed();

    let balanceBefore = await tokenInstance.balanceOf(deployerAccount);
    await kycInstance.setKycCompleted(deployerAccount, {
      from: deployerAccount,
    });
    expect(
      tokenSaleInstance.sendTransaction({
        from: deployerAccount,
        value: web3.utils.toWei("1", "wei"),
      })
    ).to.be.fulfilled;
    balanceBefore = balanceBefore.add(new BN(1));
    return expect(
      tokenInstance.balanceOf(deployerAccount)
    ).to.eventually.be.a.bignumber.equal(balanceBefore);
  });
});
