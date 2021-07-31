import chain from './chain';
import peers from './peers';
import miner from './miner';
import state from './state';
import wallet from './wallet';

let networkBlockCount = 0;
let currentState = null;

const stateEnum = Object.freeze({
  MINING: 'MINING',
  GET_BLOCK: 'GET_BLOCK',
  GET_BLOCK_HASHES: 'GET_BLOCK_HASHES',
});

const synchronize = function () {
  // get highest transaction number from peers,
  // if no response within 10000ms, this is the first node
  peers.broadcastMessage('p');
  peers.broadcastMessage('a');
  console.log('syncing in progress...');

  setTimeout(async () => {
    if (
      chain.blocks.length == 0 &&
      state.networkBlockCount == 0 &&
      peers.activeNodes == 0
    ) {
      //coinbase miner
      console.log(
        'You are the first SBB miner, history is being written... The SBB genesis block'
      );
      miner.init();
      state.currentState = stateEnum.MINING;
    }
  }, 6000);
};

const getReceivedTransactionsByUser = function (_userWalletAddress) {
  let tokensReceived = 0;
  let txnsReceived = [];
  for (let i = 0; i < chain.blocks.length; i++) {
    const block_txns = chain.blocks[i].hashedContent.transactions;

    for (let t = 0; t < block_txns.length; t++) {
      if (block_txns[t].to_ac == _userWalletAddress) {
        tokensReceived++;
        txnsReceived.push(block_txns[t]);
      }
    }
  }

  return txnsReceived;
};

const getSentTransactionsByUser = function (_userWalletAddress) {
  let tokensSent = 0;
  let txnsSent = [];
  for (let i = 0; i < chain.blocks.length; i++) {
    const block_txns = chain.blocks[i].hashedContent.transactions;

    for (let t = 0; t < block_txns.length; t++) {
      if (block_txns[t].from_ac == _userWalletAddress) {
        tokensSent++;
        txnsSent.push(block_txns[t]);
      }
    }
  }

  return txnsSent;
};

// User can check self balance using command: balance
const checkBalance = async function () {
  const self = this;

  chain.dbClient.get(wallet.publicKey, function (err, result) {
    if (err) {
      throw err;
    }

    if (result == null) {
      console.log('Balance not found in DB, calculating...');
      setBalance();
      self.checkBalance(wallet.publicKey);
    }
  });
};

const setBalance = () => {
  const _userWalletAddress = wallet.publicKey;
  const tokensReceived = getReceivedTransactionsByUser(_userWalletAddress);
  const tokensSent = getSentTransactionsByUser(_userWalletAddress);

  const _balance = tokensReceived.length - tokensSent.length;

  chain.dbClient.set(_userWalletAddress, _balance);
  wallet.balance = _balance;
};

export default {
  checkBalance,
  getReceivedTransactionsByUser,
  getSentTransactionsByUser,
  synchronize,
  networkBlockCount,
  currentState,
  stateEnum,
};
