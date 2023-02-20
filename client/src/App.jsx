import React, { Component } from "react";
import MyToken from "./contracts/MyToken.json";
import KycContract from "./contracts/KycContract.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import Web3 from "web3";
import "./App.css";

class App extends Component {
  state = { loaded: false, kycAddress: "0x233...", tokenSaleAddress: null, userTokens: 0 };
  web3;
  componentDidMount = async () => {
    try {
      this.web3 = new Web3(Web3.givenProvider);
      this.accounts = await this.web3.eth.getAccounts();
      console.log(this.accounts)
      this.netWorkId = await this.web3.eth.net.getId();
      this.tokenInstance = new this.web3.eth.Contract(MyToken.abi, MyToken.networks[this.netWorkId] && MyToken.networks[this.netWorkId].address)
      this.tokenSaleInstance = new this.web3.eth.Contract(MyTokenSale.abi, MyTokenSale.networks[this.netWorkId] && MyTokenSale.networks[this.netWorkId].address)
      this.kycInstance = new this.web3.eth.Contract(KycContract.abi, KycContract.networks[this.netWorkId] && KycContract.networks[this.netWorkId].address)
      this.listenTokenTransfer();
      this.setState({ loaded: true, tokenSaleAddress: MyTokenSale.networks[this.netWorkId].address }, this.updateUserTokens)
    } catch (error) {
      alert("Failed to load web3, accounts, contract. Check console for details");
      console.log(error)
    }
  }

  updateUserTokens = async () => {
    let userTokens = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call();
    this.setState({ userTokens })
  }

  listenTokenTransfer = () => {

    this.tokenInstance.events.Transfer({ to: this.accounts[0] }).on("data", this.updateUserTokens)
  }

  handleBuyTokens = async () => {
    await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({ from: this.accounts[0], value: this.web3.utils.toWei("1", "wei") })
  }

  handleInputChange = (e) => {
    const target = e.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    })
  }

  handleKycWhiteListing = async () => {
    await this.kycInstance.methods.setKycCompleted(this.state.kycAddress).send({ from: this.accounts[0] });

    alert("KYC for " + this.state.kycAddress + " is completed")
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, contract...</div>
    }
    return (
      <div className="App" style={{textAlign: "center"}}>
      <br/>
      <br/>
        <h1>Campucino Token Sale!</h1>
        <p>Get your Token day</p>
        <h2>Kyc Whitelisting</h2>
        <br/><br/><br/>
        <form>
          Address to allow: <input type="text" name="kycAddress" value={this.state.kycAddress} onChange={this.handleInputChange}></input>

          <button type="button" onClick={this.handleKycWhiteListing}>Add to Whitelist</button>  
          <br/><br/><br/>
          <h2>Buy Token</h2>
          <p>If you want to buy token, send wei to this address: {this.state.tokenSaleAddress}</p>
          <p>You currently have: {this.state.userTokens} CAPPU Tokens</p>
          <button type="button" onClick={this.handleBuyTokens}>Buy more tokens</button>
        </form>
      </div>
    )
  }
}

export default App;
