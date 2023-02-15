import React, { Component } from 'react';

//import smart_contract from '../abis/Migrations.json';
import JamToken from '../abis/JamToken.json';
import StellartToken from '../abis/StellartToken.json'
import TokenFarm from '../abis/TokenFarm.json'

import Web3 from 'web3';
import logo from '../logo.png';

import Navigation from './Navbar';
import MyCarousel from './Carousel';
import Main from './Main';

class App extends Component {

  async componentDidMount() {
    // 1. Carga de Web3
    await this.loadWeb3()
    // 2. Carga de datos de la Blockchain
    await this.loadBlockchainData()
  }

  // 1. Carga de Web3
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Accounts: ', accounts)
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('¡Deberías considerar usar Metamask!')
    }
  }

  // 2. Carga de datos de la Blockchain
  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Ganache -> 5777, Rinkeby -> 4, BSC -> 97
    const networkId = await web3.eth.net.getId() 
    console.log('networkid:', networkId)

    //Carga del JamToken
    const jamTokenData = JamToken.networks[networkId]
    //console.log(jamTokenData)

    if(jamTokenData){
      const jamToken = new web3.eth.Contract(JamToken.abi, jamTokenData.address)
      this.setState({jamToken: jamToken})
      let jamTokenBalance = await jamToken.methods.balanceOf(this.state.account).call()
      this.setState({jamTokenBalance: jamTokenBalance.toString()})
      //console.log(jamTokenBalance)
    } else{
      window.alert('El JamToken no se ha podido desplegar')
    }

    //Carga de Stellar
    const stellartTokenData = StellartToken.networks[networkId]
    //console.log(stellartTokenData)

    if(stellartTokenData){
      const stellartToken = new web3.eth.Contract(StellartToken.abi, stellartTokenData.address)
      this.setState({stellartToken: stellartToken})
      let stellartTokenBalance = await stellartToken.methods.balanceOf(this.state.account).call()
      this.setState({stellartTokenBalance: stellartTokenBalance.toString()})
      //console.log(stellartTokenBalance)
    } else{
      window.alert('El stellartToken no se ha podido desplegar')
    }

    //Carga FarmToken
    const tokenFarmData = TokenFarm.networks[networkId]

    if(tokenFarmData){
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({tokenFarm: tokenFarm})
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance })
    } else{
      window.alert('El TokenFarm no se ha podido desplegar')
    }

    this.setState({loading: false})
    //
    /* const networkData = smart_contract.networks[networkId]
    console.log('NetworkData:', networkData)

    if (networkData) {
      const abi = smart_contract.abi
      console.log('abi', abi)
      const address = networkData.address
      console.log('address:', address)
      const contract = new web3.eth.Contract(abi, address)
      this.setState({ contract })
    } else {
      window.alert('¡El Smart Contract no se ha desplegado en la red!')
    } */
  }

  stakeTokens = (amount) => {
    this.setState({loading: true})
    this.state.jamToken.methods.approve(this.state.tokenFarm._address, amount)
    .send({from: this.state.account})
    .on('transactionHash', (hash) =>{
      this.state.tokenFarm.methods.stakeTokens(amount).send({from: this.state.account})
      .on('transactionHash', (hash) => {
        this.setState({loading: false})
      })
    })
    //el .on es para esperar que se realicee la accion, una vez retornado el hash se realiza la siguiente accion 
    //lo mandamos al TokenFarm
  }

  unstakeTokens = (amount) => {
    //el amount esta indicado pero no funcion ya que no esta definido en el FarmToken
    this.setState({loading: true})
    this.state.tokenFarm.methods.unstakeTokens()
    .send({from: this.state.account})
    .om('transactionHash', (hash) => {
      this.setState({loading: false})
    }) 
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      loading: true,
      //llamando a state, uno puede acceder a los atos colocados en este conrstructor
      jamToken: {},
      jamTokenBalance: '0',
      stellartToken: {},
      stellartTokenBalance: '0',
      tokenFarm: {},
      stakingBalance: '0',

    }
  }

  render() {

    let content
    if (this.state.loading){
      content = <p id="loader" className='text-center'>
        Loading...
      </p>
    }else{
      content = <Main
        jamTokenBalance = {this.state.jamTokenBalance}
        stellartTokenBalance = {this.state.stellartTokenBalance}
        stakeTokens = {this.stakeTokens}
        unstakeTokens = {this.unstakeTokens}
        stakingBalance = {this.state.stakingBalance}
      />
    }
    return (
      <div>
        <Navigation account={this.state.account} />
        <MyCarousel />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">

                { content }

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
