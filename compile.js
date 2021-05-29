const path = require('path');
const fs = require('fs');
const solc = require('solc');

const inboxPath = path.resolve(__dirname, 'contracts', 'Inbox.sol');
const inboxSource = fs.readFileSync(inboxPath, 'utf-8');

const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');
const lotterySource = fs.readFileSync(lotteryPath, 'utf-8');

module.exports = {
    'inbox': solc.compile(inboxSource, 1).contracts[':Inbox'],
    'lottery': solc.compile(lotterySource, 1).contracts[':Lottery']
};