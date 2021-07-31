// let hashedContent = '';
// import hashedContent from './hashed-content';
import state from './state';
import chain from './chain';
import transaction from './transaction';
import miner from './miner';
//import SHA256 from 'crypto-js/sha256';
import CryptoJS from 'crypto-js';

let hash = '';
let hashedContent = {
  // prevHash: null,
  // nonce: null,
  // timestamp: null,
  // transactions: null,
};

// const resetHashedContent = function () {

// };

const init = function () {
  this.hashedContent = {
    prevHash: null,
    nonce: null,
    timestamp: null,
    transactions: null,
  };

  // const hashedContent = new HashedContent(
  //   chain.blocks.length == 0 ? 0 : chain.blocks[chain.blocks.length - 1].hash,
  //   0,
  //   Math.floor(new Date().getTime()),
  //   []
  // );

  this.hashedContent.prevHash =
    chain.blocks.length == 0 ? 0 : chain.blocks[chain.blocks.length - 1].hash;
  this.hashedContent.nonce = 0;
  this.hashedContent.timestamp = Math.floor(new Date().getTime());

  miner.addTransaction(0, state.publicKey);

  console.log('Miner Transactions: ', miner.transactions);

  this.hashedContent.transactions = JSON.parse(
    JSON.stringify(miner.transactions)
  ); //Object.assign([], miner.transactions);
  // hashedContent.transactions(miner.transactions);

  console.log(
    'Hashed Content Transactions before emptying: ',
    this.hashedContent.transactions
  );

  miner.transactions = []; //clear the array for next block

  console.log(
    'Hashed Content Transactions after emptying: ',
    this.hashedContent.transactions
  );
  // let txn = new transaction.Transaction(0, state.publicKey);
  // transaction.txn.from_ac = 0;
  // transaction.txn.to_ac = state.publicKey;
  // transaction.txn.amount = 1;
  // transaction.txn.hash = CryptoJS.SHA256(
  //   JSON.stringify(transaction.txn)
  // ).toString();
  // console.log('TXN: ', transaction.txn);
  // this.hashedContent.transactions = [transaction.txn];
};

const calculateHash = async function () {
  // console.log('Hashed Content Nonce: ', this.hashedContent.nonce);
  // this.hash = CryptoJS.SHA256(this.hashedContent).toString();

  this.hash = await CryptoJS.SHA256(
    JSON.stringify({
      prevHash: this.hashedContent.prevHash,
      nonce: this.hashedContent.nonce,
      timestamp: this.hashedContent.timestamp,
      transactions: [transaction.txn],
    })
  ).toString();
  //  console.log('Block Hashhhhh Content: ', this.hash);
  //  console.log('Block Hashhhhh: ', this.hash);

  //  return this.hash;
  // console.log('Hashed Content: ', this.hashedContent);
  // console.log('Block Hash: ', this.hash);
};

const increaseNonce = function () {
  this.hashedContent.nonce++;
};

export default { hashedContent, hash, init, increaseNonce, calculateHash };
