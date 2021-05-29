const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { inbox } = require('../compile')


let accounts;
let inboxContract;

beforeEach(async () => {
    // Get a list of all accounts.
    accounts = await web3.eth.getAccounts();

    // Use one of accounts to deploy to contract.
    inboxContract = await new web3.eth.Contract(JSON.parse(inbox.interface))
      .deploy({ data: inbox.bytecode, arguments: ['Hi there!'] })
      .send({ from: accounts[0], gas: '1000000' });
});

describe('Inbox', () => {
    it('deploys stuff is successful', () => {
        assert.ok(inboxContract.options.address);
    });

    it('has default message', async () => {
        assert.strictEqual(await inboxContract.methods.message().call(), 'Hi there!');
    });

    it('is able to set message', async () => {
        await inboxContract.methods.setMessage('Bye there').send({ from: accounts[0] });
        assert.strictEqual(await inboxContract.methods.message().call(), 'Bye there');
    });
});