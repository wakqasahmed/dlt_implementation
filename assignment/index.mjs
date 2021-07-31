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
import wallet from './wallet';
//import util from './util';
import * as secp from 'noble-secp256k1';
import colors from 'colors/safe';

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

    wallet.privateKey = privateKeyHex;
    wallet.publicKey = publicKeyHex;

    // console.log('Node Private Key: ', wallet.privateKey);
    console.log('Node Public Key: ', wallet.publicKey);

    await peers.initPeers(user_args);

    //TODO 2: Configurable Blockchain
    // (i) Proof-of-Work or Proof-of-Turn;
    // (ii) Account or UTXO model; and
    // (iii) JSON or a Welldefined byte encoding.
    await configureNode();
  })();
};

const configureNode = async () => {
  console.log(`Please choose the options to configure your node.\n`);

  var schema = {
    properties: {
      consensusAlgo: {
        description: colors.green(
          'Consensus Algorithm:\n1) PoW (Proof of Work)\n2) PoT (Proof of Turn)\n'
        ),
        pattern: /^[1|2]/,
        message: 'Type either 1 or 2',
        required: true,
      },
      model: {
        description: colors.green('Model:\n1) Account\n2) UTXO\n'),
        pattern: /^[1|2]/,
        message: 'Type either 1 or 2',
        required: true,
      },
      encoding: {
        description: colors.green('Encoding:\n1) JSON\n2) Byte\n'),
        pattern: /^[1|2]/,
        message: 'Type either 1 or 2',
        required: true,
      },
    },
  };

  prompt.delimiter = colors.green('>');
  // prompt.delimiter = '>';
  prompt.start();

  prompt.get(schema, async function (err, result) {
    if (err) {
      return onErr(err);
    }

    // console.log('Command-line input received:');
    // console.log('  Consensus Algorithm: ' + result.consensusAlgo);
    // console.log('  Model: ' + result.model);
    // console.log('  Encoding: ' + result.encoding);

    miner.consensusAlgo = result.consensusAlgo == 1 ? 'PoW' : 'PoT';
    miner.model = result.model == 1 ? 'Account' : 'UTXO';
    miner.encoding = result.encoding == 1 ? 'JSON' : 'Byte';

    // console.log('Values set:');
    // console.log('  Consensus Algorithm: ' + miner.consensusAlgo);
    // console.log('  Model: ' + miner.model);
    // console.log('  Encoding: ' + miner.encoding);

    peers.nodePublicKeys.push(wallet.publicKey);
    console.log('Configured successfully');

    // halt the user input until synchronization completes
    await state.synchronize();

    scheduleNextMessage();
    handleUserActions();
  });
};

const scheduleNextMessage = function () {
  setInterval(() => {
    peers.broadcastMessage('a');
  }, 5000);

  // setInterval(() => {
  //   peers.broadcastMessage('p');
  // }, 60000); //peer discovery every 1 min
};

const handleUserActions = function () {
  const properties = [
    {
      name: 'command',
      description: colors.green(
        'Command:\n1) b OR balance\n2) l OR ledger\n3) s <publicKey> OR send <publicKey> e.g. send 04440a759412d...\n'
      ),
      // validator: /^[a-zA-Z\s\-]+$/,
      // warning: 'Username must be only letters, spaces, or dashes',
    },
  ];

  prompt.delimiter = colors.green('>');
  prompt.start();

  prompt.get(properties, async function (err, result) {
    if (err) {
      return onErr(err);
    }

    const command = result.command.split(' ');

    if (command[0] === 'b' || command[0] === 'balance') {
      state.checkBalance(wallet.publicKey);
      console.log(
        `You (${wallet.publicKey}) have ${wallet.balance} SBB tokens.`
      );
    } else if (command[0] === 'l' || command[0] === 'ledger') {
      console.log(chain.blocks);
    } else if (command[0] === 'pending') {
      console.log(state.pendingTransactions(state.userInitials));
    } else if (command[0] === 'approve') {
      state.approveTransaction(command[1]);
      console.log(state.transactions);
    } else if (command[0] === 's' || command[0] === 'send') {
      //&& patternUsername.test(command[1])) {
      const receiverWalletAddress = command[1];
      miner.sendSBB(receiverWalletAddress);
    } else {
      console.log(`Invalid command.\n\n
      Valid commands are\n
      1) b OR balance\n
      2) l OR ledger\n
      3) s <publicKey> OR send <publicKey> e.g. send 04440a759412d...\n`);
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
