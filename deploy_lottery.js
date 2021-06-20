const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { lottery } = require('./compile');

const provider = new HDWalletProvider(process.env.MY_MNEMONIC,
    "https://rinkeby.infura.io/v3/a4fb92ee51b94aa083dfa08767c4c4b2");

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account', accounts[0]);
    const result_contract = await new web3.eth.Contract(JSON.parse(lottery.interface))
        .deploy({ data: lottery.bytecode })
        .send({ gas: '1000000', from: accounts[0] })
    console.log(lottery.interface);
    console.log('contract address', result_contract.options.address);
}

deploy();