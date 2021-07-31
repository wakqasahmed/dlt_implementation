/*
• i) Requires passing in of the username of who is using the software application (e.g. the node application will act
as the wallet or interface allowing for a user to interact with the Blockchain). The username should be the initials
of the user (max 2 characters).
• ii) Only 1 SBB can be sent at a time -- therefore a transaction will not require to specify the amount of SBB being
sent. A transaction will consist of:
<transactionNumber, timestamp, fromUsername, toUsername>
• iii) When there are two transactions with the same number, a node will drop the transaction with the most recent
timestamp and keep the older transaction
• iv) Upon startup:
• 1) a node will ask neighbours for the highest transactionNumber. If a higher number is returned than a node
should ask its peers for each transaction until it is synchronised. A node will be considered to be
synchronised when all it and all its peers have the same highest transaction number.
• 2) a node will issue 10 new transactions -- which will give to the user 10 SBB.
• v) A user can send an amount of their SBB to another user by inserting the other user’s username. The node
software should not send out the transaction if the user does not have enough balance. If the user has enough
balance, the transaction should be added to the ledger and send out to all other nodes
• vi) Upon receiving a transaction a node should ensure that iii) holds.
• vii) Each node should also ask every neighbour for the highest transactionNumber within its ledger to determine
whether it needs to pull a newer transaction every 5 seconds.
• viii) All communication is broadcast to all nodes
*/

const args = process.argv.slice(2);

import miner from './miner';
import state from './state';
import peers from './peers';
import chain from './chain';
//import util from './util';
import * as secp from 'noble-secp256k1';

const patternPort = new RegExp('^[0-9]{4}$');

import prompt from 'prompt';

/*
• iv) Upon startup:
• 1) a node will ask neighbours for the highest transactionNumber. If a higher number is returned than a node
should ask its peers for each transaction until it is synchronised. A node will be considered to be
synchronised when all it and all its peers have the same highest transaction number.
• 2) a node will issue 10 new transactions -- which will give to the user 10 SBB.
*/
const init = async function (user_args) {
  console.log(peers);

  // await peers.initPeers(user_args);

  //TODO: lecture 04 - wallet creation
  (async () => {
    // You pass either a hex string, or Uint8Array
    const privateKey = secp.utils.randomPrivateKey(); // 32-byte Uint8Array or string.
    const privateKeyHex = Buffer.from(privateKey).toString('hex');

    // const messageHash =
    //   'a33321f98e4ff1c283c76998f14f57447545d339b3db534c6d886decb4209f28';
    const publicKey = secp.getPublicKey(privateKey);
    const publicKeyHex = Buffer.from(publicKey).toString('hex');
    // const signature = await secp.sign(messageHash, privateKeyHex);
    // const isSigned = secp.verify(signature, messageHash, publicKeyHex);
    // console.log('Private Key: ', privateKeyHex);
    // console.log('Public Key: ', publicKeyHex);
    // console.log('Signature: ', signature);
    // console.log('isSigned: ', isSigned);

    state.privateKey = privateKeyHex;
    state.publicKey = publicKeyHex;

    // console.log('Node Private Key: ', state.privateKey);
    console.log('Node Public Key: ', state.publicKey);

    await peers.initPeers(user_args);
    //TODO: halt the user input until synchronization completes
    await state.synchronize();

    scheduleNextMessage();
    handleUserActions();
    // handleUserActions();
  })();
};

const scheduleNextMessage = function () {
  setInterval(() => {
    peers.broadcastMessage('a');
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
        `You (${state.publicKey}) have ${state.checkBalance(
          state.publicKey
        )} SBB tokens.`
      );
    } else if (command[0] === 'ledger') {
      console.log(chain.blocks);
    } else if (command[0] === 'pending') {
      console.log(state.pendingTransactions(state.userInitials));
    } else if (command[0] === 'approve') {
      state.approveTransaction(command[1]);
      console.log(state.transactions);
    } else if (command[0] === 'send') {
      //&& patternUsername.test(command[1])) {
      const receiverWalletAddress = command[1];
      miner.sendSBB(receiverWalletAddress);
    } else {
      console.log(`Invalid command.\n\n
      Valid commands are\n
      1) balance\n
      2) ledger\n
      3) send <publicKey> e.g. send 04440a759412d9ee76b11d60422439473ef97a5232292456017ecac653cd454a46f5fe1714a98fac29d8f3424b9cd391d526ce4af83dfe16cc57855b8da643d0fb\n`);
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
  // !args[1] ||
  !patternPort.test(args[0]) //||
  // !patternUsername.test(args[1])
) {
  console.log(`command syntax: node index.js 8001`);
  // return;
} else {
  init(args);
}
