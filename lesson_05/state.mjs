import chain from './chain';
import peers from './peers';
import miner from './miner';
import state from './state';

// let localBlockCount;
let networkBlockCount = 0;
let currentState = null;

const stateEnum = Object.freeze({
  MINING: 'MINING',
  GET_BLOCK: 'GET_BLOCK',
  GET_BLOCK_HASHES: 'GET_BLOCK_HASHES',
});

const synchronize = function () {
  // console.log('lets synchronize');
  // console.log('sending highest number transaction command to peers');

  // get highest transaction number from peers,
  // if no response within 10000ms, this is the first node
  peers.broadcastMessage('a');
  console.log('syncing in progress...');
  // console.log('# of Nodes: ', peers.nodes.length);

  // let activeNodes = 0;
  // for(let i=0; i<peers.nodes.length;i++){
  //   peers.broadcastMessage('p');
  // }

  setTimeout(async () => {
    if (
      chain.blocks.length == 0 &&
      state.networkBlockCount == 0 &&
      // !miner.isMining &&
      peers.activeNodes == 0 //&& miner.isSynchronized
    ) {
      //coinbase miner
      console.log('History is getting written... The SBB genesis block');
      miner.init();
      state.currentState = stateEnum.MINING;
      // console.log('Current State: ', state.currentState);
    }
  }, 6000);

  /*
  setTimeout(async () => {
    // console.log(
    //   `local transaction count before awarding coins is: ${this.localTrnCount}`
    // );
    // console.log(
    //   `network transaction count before awarding coins is: ${this.networkTrnCount}`
    // );

    // console.log(
    //   `checking if bonus has already been awarded to "${this.userInitials}"`
    // );

    //has user already been awarded 10 WBE bonus tokens?
    //const alreadyAwarded = await hasBonusAwarded(this.userInitials);

    // console.log('already awarded: ', alreadyAwarded);

    if (alreadyAwarded) {
      console.log(
        `skipping awarding.. already awarded bonus coins to "${this.userInitials}"`
      );
    } else {
      console.log(`awarding "${this.userInitials}" bonus 10 WBE coins`);

      const coinsToIssue = this.networkTrnCount + 10;
      for (let i = this.networkTrnCount; i < coinsToIssue; i++) {
        const timestamp = new Date().getTime();

        const txnTimeBE = util.NumberToBigEndian(
          Math.floor(timestamp / 1000),
          32
        );

        protocol.processMessage({
          message: `n ${i} 00 ${this.userInitials} ${timestamp} 1 ${i}`,
          ip: peers.currentNode.ip,
          port: peers.currentNode.port,
        });

        this.networkTrnCount += 1;
      }
      // console.log(`current local transaction count is: ${this.localTrnCount}`);
      // console.log(
      //   `current network transaction count is: ${this.networkTrnCount}`
      // );
    }
  }, 6000);
  */
};

const getReceivedTransactionsByUser = function (_userWalletAddress) {
  let tokensReceived = 0;
  let txnsReceived = [];
  for (let i = 0; i < chain.blocks.length; i++) {
    const block_txns = chain.blocks[i].hashedContent.transactions;

    console.log('Block Txns: ', block_txns);

    for (let t = 0; t < block_txns.length; t++) {
      if (block_txns[t].to_ac == _userWalletAddress) {
        tokensReceived++;
        txnsReceived.push(block_txns[t]);
      }
    }
  }

  console.log('Txns Received: ', txnsReceived);
  return txnsReceived;

  /*
  const ledgerTransactions =
    chain.blocks &&
    chain.blocks.map((b) => {
      // console.log(b.hashedContent);
      return (
        b.hashedContent &&
        b.hashedContent.transactions &&
        b.hashedContent.transactions.filter((t) => {
          // console.log('T:', t);
          // console.log('User wallet address:', _userWalletAddress);
          return t.to_ac == _userWalletAddress;
        })
      );
    });

  console.log('Received Ledger Transactions: ', ledgerTransactions);
  return ledgerTransactions;
*/
};

const getSentTransactionsByUser = function (_userWalletAddress) {
  let tokensSent = 0;
  let txnsSent = [];
  for (let i = 0; i < chain.blocks.length; i++) {
    const block_txns = chain.blocks[i].hashedContent.transactions;

    console.log('Block Txns: ', block_txns);

    for (let t = 0; t < block_txns.length; t++) {
      if (block_txns[t].from_ac == _userWalletAddress) {
        tokensSent++;
        txnsSent.push(block_txns[t]);
      }
    }
  }

  console.log('Txns Sent: ', txnsSent);
  return txnsSent;

  /*
  const ledgerTransactions =
    chain.blocks &&
    chain.blocks.map((b) => {
      // console.log(b.hashedContent);
      return (
        b.hashedContent &&
        b.hashedContent.transactions &&
        b.hashedContent.transactions.filter((t) => {
          // console.log('T:', t);
          // console.log('User wallet address:', _userWalletAddress);
          return t.from_ac == _userWalletAddress;
        })
      );
    });

  console.log('Sent Ledger Transactions: ', ledgerTransactions[0]);
  return ledgerTransactions[0];
  */
};

// User can check self balance using command: balance
const checkBalance = function (_userWalletAddress) {
  const tokensReceived = getReceivedTransactionsByUser(_userWalletAddress);
  const tokensSent = getSentTransactionsByUser(_userWalletAddress);

  return tokensReceived.length - tokensSent.length;
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
