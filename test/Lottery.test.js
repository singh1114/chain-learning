const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { lottery } = require('../compile')


let accounts;
let lotteryContract;

beforeEach(async () => {
    // Get a list of all accounts.
    accounts = await web3.eth.getAccounts();

    // Use one of accounts to deploy to contract.
    lotteryContract = await new web3.eth.Contract(JSON.parse(lottery.interface))
      .deploy({ data: lottery.bytecode })
      .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery', () => {
    it('deploys stuff is successful', () => {
        assert.ok(lotteryContract.options.address);
    });

    it('entering the lottery works for 1 account', async () => {
        await lotteryContract.methods.enter()
            .send({
                from: accounts[0],
                value: web3.utils.toWei('0.02', 'ether')
            });

        const players = await lotteryContract.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.strictEqual(players.length, 1);
        assert.strictEqual(players[0], accounts[0]);
    });

    it('entering the lottery works for 2 accounts', async () => {
        await lotteryContract.methods.enter()
            .send({
                from: accounts[0],
                value: web3.utils.toWei('0.02', 'ether')
            });

        await lotteryContract.methods.enter()
            .send({
                from: accounts[1],
                value: web3.utils.toWei('0.04', 'ether')
            });

        await lotteryContract.methods.enter()
            .send({
                from: accounts[2],
                value: web3.utils.toWei('0.06', 'ether')
            });

        const players = await lotteryContract.methods.getPlayers().call({
            from: accounts[0]
        });

        const balance = await lotteryContract.methods.getCurrentBalance().call({
            from: accounts[0]
        });

        assert.strictEqual(players.length, 3);
        assert.strictEqual(players[0], accounts[0]);
        assert.strictEqual(players[1], accounts[1]);
        assert.strictEqual(players[2], accounts[2]);
        assert.strictEqual(balance, web3.utils.toWei('0.12', 'ether'));
    });

    it('entering fails when less ether passed', async () => {
        try {
            await lotteryContract.methods.enter()
                .send({
                    from: accounts[0],
                    value: 200
                });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('pickWinner fails if manager is calling the function', async () => {
        try {
            await lotteryContract.methods.pickWinner()
                .send({
                    from: accounts[1]
                });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('end to end test', async () => {
        await lotteryContract.methods.enter()
            .send({
                from: accounts[0],
                value: web3.utils.toWei('0.02', 'ether')
            });

        await lotteryContract.methods.enter()
            .send({
                from: accounts[0],
                value: web3.utils.toWei('0.02', 'ether')
            });

        let players = await lotteryContract.methods.getPlayers()
            .call({from: accounts[0]});
        let balance = await lotteryContract.methods.getCurrentBalance()
            .call({from: accounts[0]});
        const initBalance = await web3.eth.getBalance(accounts[0]);

        assert.notStrictEqual(balance, '0');
        assert.notStrictEqual(players.length, 0);

        await lotteryContract.methods.pickWinner()
            .send({
                from: accounts[0]
            });

        players = await lotteryContract.methods.getPlayers()
            .call({from: accounts[0]});
        balance = await lotteryContract.methods.getCurrentBalance()
            .call({from: accounts[0]});
        const finalBalance = await web3.eth.getBalance(accounts[0]);

        assert.strictEqual(players.length, 0);
        assert.strictEqual(balance, '0');
        const diff = finalBalance - initBalance;
        assert(diff > web3.utils.toWei('0.03', 'ether'));
        assert(diff < web3.utils.toWei('0.04', 'ether'));
    });
});