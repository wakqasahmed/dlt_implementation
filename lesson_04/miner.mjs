let transactions = [];
let difficulty = 4; // number of zeros required at front of hash
let maximumNonce = 500000; // limit the nonce to this so we don't mine too long
let pattern = '';

import block from './block';
import chain from './chain';
import state from './state';
import CryptoJS from 'crypto-js';

const init = function (args) {
  for (let x = 0; x < difficulty; x++) {
    pattern += '0';
  }
  block.init();
  this.run();
};

const run = async function () {
  await block.calculateHash();

  if (block.hash.substr(0, difficulty) === pattern) {
    console.log('block found', [block.hash]);

    chain.addBlock({
      hashedContent: block.hashedContent,
      unhashedContent: { hash: block.hash },
    });

    console.log('block:', chain.blocks[chain.blocks.length - 1]);

    block.init();
    // console.log('Waiting to mine next block');
    setTimeout(() => {
      // console.log('Next block mining starts');
      this.run();
    }, 10000); //10 sec
  } else {
    block.increaseNonce();
    this.run();
    if (block.hashedContent.nonce >= maximumNonce) {
      console.log('mining stopped due to maximum nonce reached');
      return;
    }
  }
};

const addTransaction = function (_fromAccount, _toAccount) {
  let _txnJson = {
    from_ac: _fromAccount,
    to_ac: _toAccount,
    amount: 1,
  };

  _txnJson.hash = CryptoJS.SHA256(JSON.stringify(_txnJson)).toString();

  transactions.push(_txnJson);
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

export default { transactions, init, run, addTransaction, sendSBB };
