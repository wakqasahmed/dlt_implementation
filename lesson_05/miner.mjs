let transactions = [];
let difficulty = 4; // number of zeros required at front of hash
let maximumNonce = 500000; // limit the nonce to this so we don't mine too long
let pattern = '';
// let isMining = false;
//let isSynchronized = false;

import block from './block';
import chain from './chain';
import state from './state';
import CryptoJS from 'crypto-js';
import peers from './peers.mjs';
import protocol from './protocol.mjs';

const init = function (args) {
  console.log('Mining has been started');
  // isMining = true;
  state.currentState = state.stateEnum.MINING;
  for (let x = 0; x < difficulty; x++) {
    pattern += '0';
  }
  block.init();
  this.run();
};

const run = async function () {
  if (state.currentState !== state.stateEnum.MINING) {
    console.log('state is not MINING');
    return;
  }

  await block.calculateHash();

  if (block.hash.substr(0, difficulty) === pattern) {
    console.log('block found', [block.hash]);
    // console.log('block content', [block.hashedContent]);

    let new_block = {
      hashedContent: block.hashedContent,
      hash: block.hash,
    };

    chain.addBlock(new_block);

    peers.broadcastMessage(`z {"block": ${JSON.stringify(new_block)}}`);

    // peers.broadcastMessage(`z {"block": ${new_block}`);

    // transactions = [];
    block.init();
    // console.log('Waiting to mine next block');
    setTimeout(() => {
      console.log('Next block mining starts');
      this.run();
    }, 10000); //10 sec
  } else {
    if (block.hashedContent.nonce >= maximumNonce) {
      console.log('mining stopped due to maximum nonce reached');
      return;
    }

    block.increaseNonce();
    this.run();
  }
};

const addTransaction = function (_fromAccount, _toAccount) {
  let _txnJson = {
    from_ac: _fromAccount,
    to_ac: _toAccount,
    amount: 1,
  };

  _txnJson.hash = CryptoJS.SHA256(JSON.stringify(_txnJson)).toString();

  this.transactions.push(_txnJson);
};

// User can send 1 SBB to another user using command: send <user initials> e.g. send wa
const sendSBB = function (receiverWalletAddress) {
  if (receiverWalletAddress === state.publicKey) {
    console.log("Oops! you can't send token to yourself");
    return;
  }

  if (state.checkBalance(state.publicKey) < 1) {
    console.log("Oops! you don't have sufficient balance");
    return;
  }

  this.addTransaction(state.publicKey, receiverWalletAddress);
};

export default {
  // isMining,
  //  isSynchronized,
  transactions,
  init,
  run,
  addTransaction,
  sendSBB,
};
