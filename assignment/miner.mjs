let transactions = [];
let difficulty = 4; // number of zeros required at front of hash
let maximumNonce = 50000000; // limit the nonce to this so we don't mine too long
let pattern = '';
let startTime = null;
let blockTimes = [];

let consensusAlgo = null; //'PoW';
let model = null; //'Account';
let encoding = null; //'JSON';

let nodeTurn = null;

import block from './block';
import chain from './chain';
import state from './state';
import wallet from './wallet';
import CryptoJS from 'crypto-js';
import peers from './peers.mjs';
import miner from './miner.mjs';
import { performance } from 'perf_hooks';

const init = function (args) {
  // console.log('Mining has been started');
  state.currentState = state.stateEnum.MINING;
  for (let x = 0; x < difficulty; x++) {
    pattern += '0';
  }
  block.init();
  this.run();
};

const lsb64 = (hash) => {
  // console.log('Hash LSB64: ', hash);
  return hash.substr(hash.length - 16);
};

const run = async function () {
  if (state.currentState !== state.stateEnum.MINING) {
    // console.log('state is not MINING');
    return;
  }

  // console.log('miner.consensusAlgo: ', miner.consensusAlgo);

  if (miner.consensusAlgo == 'PoT') {
    // console.log('Mining for PoT');
    //check if this node is eligible to mine

    /* TODO: 4 Proof of Turn
    Min(
      LS64B(
        Hash(
          Concat(<Node’s Public Key>, <Previous Block Hash>)
        )
      )
    )
    */

    let peersLSB64 = [];
    const prevBlockHash =
      chain.blocks.length == 0 ? 0 : chain.blocks[chain.blocks.length - 1].hash;

    peersLSB64 = peers.nodePublicKeys.map((p) => {
      const hash = CryptoJS.SHA256(p + prevBlockHash).toString();
      // console.log('Hash: ', hash);
      return {
        lsb64: lsb64(hash),
        nodePublicKey: p,
      };
    });

    // console.log('PoT Node Hash: ', hash);
    // console.log('PoT LSB64: ', peersLSB64);

    let min = null;
    for (let i = peersLSB64.length - 1; i >= 0; i--) {
      const current = peersLSB64[i].lsb64;
      if (current < min || min == null) {
        min = current;
      }
    }

    nodeTurn = peersLSB64.filter((p) => p.lsb64 == min)[0].nodePublicKey;

    // console.log('Node Turn: ', nodeTurn);
    // console.log('Min: ', min);
    // console.log(
    //   'Turn of: ',
    //   peersLSB64.filter((p) => p.lsb64 == min)
    // );

    // return;

    if (nodeTurn == wallet.publicKey) {
      console.log('PoT: My Turn :)');
      await mine();
    }
  }

  if (miner.consensusAlgo == 'PoW') {
    console.log('PoW');
    await mine();
  }
};

const mine = async () => {
  if (state.currentState !== state.stateEnum.MINING) {
    // console.log('state is not MINING');
    return;
  }

  if (startTime === null) {
    // startTime = new Date().getTime();
    startTime = performance.now();
  }

  await block.calculateHash();

  if (block.hash.substr(0, difficulty) === pattern) {
    // const blockTime = (new Date().getTime() - startTime) / 1000;
    const blockTime = performance.now() - startTime;
    blockTimes.push(blockTime);

    // console.log('time taken (seconds): ', blockTime);
    // console.log(
    //   'average time taken (seconds): ',
    //   blockTimes.reduce((p, c) => p + c, 0) / blockTimes.length
    // );

    const newBalance = wallet.balance + 1;

    //update the balance in DB
    chain.dbClient.set(wallet.publicKey, newBalance);
    wallet.balance = newBalance;

    console.log(
      `block# ${blockTimes.length} found: ${[
        block.hash,
      ]} | time taken: ${blockTime}ms | average block time: ${
        blockTimes.reduce((p, c) => p + c, 0) / blockTimes.length
      }ms | total block time: ${blockTimes.reduce((p, c) => p + c, 0)}ms`
    );

    let new_block = {
      hashedContent: block.hashedContent,
      hash: block.hash,
    };

    if (
      //      chain.blocks.length == 0 ||
      new_block.hashedContent.prevHash == 0 ||
      new_block.hashedContent.prevHash ==
        chain.blocks[chain.blocks.length - 1].hash
    ) {
      chain.addBlock(new_block);
      peers.broadcastMessage(`z {"block": ${JSON.stringify(new_block)}}`);
    } else {
      // console.log('Adding block to a temporary chain');
    }

    block.init();

    setTimeout(() => {
      // console.log('Next block mining starts');

      // startTime = new Date().getTime();
      startTime = performance.now();
      run();
    }, 1223); //1223 ms //wait for avg block time before mining next block
  } else {
    if (block.hashedContent.nonce >= maximumNonce) {
      console.log('mining stopped due to maximum nonce reached');
      return;
    }

    block.increaseNonce();
    mine();
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
const sendSBB = async function (receiverWalletAddress) {
  const self = this;

  if (receiverWalletAddress === wallet.publicKey) {
    console.log("Oops! you can't send token to yourself");
    return;
  }

  if (wallet.balance < 1) {
    console.log("Oops! you don't have sufficient balance");
    return;
  }

  this.addTransaction(wallet.publicKey, receiverWalletAddress);
  const senderNewBalance = wallet.balance - 1;

  //update sender balance in DB
  chain.dbClient.set(wallet.publicKey, senderNewBalance);
  wallet.balance = senderNewBalance;

  //update receiver balance in DB
  chain.dbClient.get(receiverWalletAddress, function (err, result) {
    if (err) {
      throw err;
    }

    if (result == null) {
      chain.dbClient.set(receiverWalletAddress, 1);
    } else {
      chain.dbClient.set(receiverWalletAddress, parseInt(result) + 1);
    }
  });
};

export default {
  transactions,
  init,
  run,
  addTransaction,
  sendSBB,
  consensusAlgo,
  model,
  encoding,
  lsb64,
};
