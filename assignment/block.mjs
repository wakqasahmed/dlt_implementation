import wallet from './wallet';
import chain from './chain';
import transaction from './transaction';
import miner from './miner';
import CryptoJS from 'crypto-js';

let hash = '';
let hashedContent = {};

const init = function () {
  this.hashedContent = {
    prevHash: null,
    nonce: null,
    timestamp: null,
    transactions: null,
  };

  this.hashedContent.prevHash =
    chain.blocks.length == 0 ? 0 : chain.blocks[chain.blocks.length - 1].hash;
  this.hashedContent.nonce = 0;
  this.hashedContent.timestamp = Math.floor(new Date().getTime());

  miner.addTransaction(0, wallet.publicKey);

  this.hashedContent.transactions = JSON.parse(
    JSON.stringify(miner.transactions)
  );

  miner.transactions = []; //clear the array for next block
};

const calculateHash = async function () {
  this.hash = await CryptoJS.SHA256(
    JSON.stringify({
      prevHash: this.hashedContent.prevHash,
      nonce: this.hashedContent.nonce,
      timestamp: this.hashedContent.timestamp,
      transactions: [transaction.txn],
    })
  ).toString();
};

const increaseNonce = function () {
  this.hashedContent.nonce++;
};

export default { hashedContent, hash, init, increaseNonce, calculateHash };
