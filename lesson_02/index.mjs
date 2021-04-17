/*
• i) Requires passing in of the username of who is using the software application (e.g. the node application will act
as the wallet or interface allowing for a user to interact with the Blockchain). The username should be the initials
of the user (max 2 characters).
• ii) Only 1 WBE can be sent at a time -- therefore a transaction will not require to specify the amount of WBE being
sent. A transaction will consist of:
<transactionNumber, timestamp, fromUsername, toUsername>
• iii) When there are two transactions with the same number, a node will drop the transaction with the most recent
timestamp and keep the older transaction
• iv) Upon startup:
• 1) a node will ask neighbours for the highest transactionNumber. If a higher number is returned than a node
should ask its peers for each transaction until it is synchronised. A node will be considered to be
synchronised when all it and all its peers have the same highest transaction number.
• 2) a node will issue 10 new transactions -- which will give to the user 10 WBE.
• v) A user can send an amount of their WBE to another user by inserting the other user’s username. The node
software should not send out the transaction if the user does not have enough balance. If the user has enough
balance, the transaction should be added to the ledger and send out to all other nodes
• vi) Upon receiving a transaction a node should ensure that iii) holds.
• vii) Each node should also ask every neighbour for the highest transactionNumber within its ledger to determine
whether it needs to pull a newer transaction every 5 seconds.
• viii) All communication is broadcast to all nodes
*/

const args = process.argv.slice(2);

import state from './state';
import peers from './peers';
import util from './util';

const patternUsername = new RegExp('^[a-z]{2}$', 'i');
const patternPort = new RegExp('^[0-9]{4}$');

import prompt from 'prompt';

/*
• iv) Upon startup:
• 1) a node will ask neighbours for the highest transactionNumber. If a higher number is returned than a node
should ask its peers for each transaction until it is synchronised. A node will be considered to be
synchronised when all it and all its peers have the same highest transaction number.
• 2) a node will issue 10 new transactions -- which will give to the user 10 WBE.
*/
const init = async function (user_args) {
  console.log(peers);
  /*
  for (let i = 0; i < 10; i++) {
    const txnNumberBE = util.NumberToBigEndian(i, 16);
    console.log('\n\nTxn Number BE: ', txnNumberBE);
    const txnNumber = util.BigEndianToNumber(txnNumberBE, 16);
    console.log('Txn Number: ', txnNumber);

    const timestamp = Math.floor(new Date().getTime());
    console.log('Timestamp: ', timestamp);

    const txnTimeBE = util.NumberToBigEndian(Math.floor(timestamp / 1000), 32);
    console.log('Txn Time BE: ', txnTimeBE);

    const txnTime = util.BigEndianToNumber(txnTimeBE, 32);
    console.log('Txn Time: ', txnTime);
  }
*/

  await peers.initPeers(user_args);
  await state.synchronize();
  scheduleNextMessage();
  handleUserActions();
};

const scheduleNextMessage = function () {
  setInterval(() => {
    peers.broadcastMessage('h');
  }, 5000);
};

const handleUserActions = function () {
  const properties = [
    {
      name: 'command',
      // validator: /^[a-zA-Z\s\-]+$/,
      // warning: 'Username must be only letters, spaces, or dashes',
    },
  ];

  prompt.delimiter = '>';
  prompt.start();

  prompt.get(properties, function (err, result) {
    if (err) {
      return onErr(err);
    }

    const command = result.command.split(' ');

    if (command[0] === 'balance') {
      console.log(
        `You (${state.userInitials}) have ${state.checkBalance(
          state.userInitials
        )} WBE tokens.`
      );
    } else if (command[0] === 'ledger') {
      console.log(state.transactions);
    } else if (command[0] === 'send' && patternUsername.test(command[1])) {
      const receiverInitials = command[1];
      state.sendWBE(receiverInitials);
    } else {
      console.log(`Invalid command.\n\n
      Valid commands are\n
      1) balance\n
      2) send <username> e.g. send wa\n`);
    }

    handleUserActions();
  });
};

const onErr = function (err) {
  console.log(err);
  return 1;
};

if (
  !args ||
  !args[0] ||
  !args[1] ||
  !patternPort.test(args[0]) ||
  !patternUsername.test(args[1])
) {
  console.log(`command syntax: node index.js 8001 wa`);
  // return;
} else {
  init(args);
}
