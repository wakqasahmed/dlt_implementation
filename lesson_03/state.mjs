let transactions = [];
let userInitials = '';
let localTrnCount = 0;
let networkTrnCount = 0;

import protocol from './protocol';
import peers from './peers';
import util from './util';

const synchronize = function () {
  // console.log('lets synchronize');
  // console.log('sending highest number transaction command to peers');

  // get highest transaction number from peers,
  // if no response within 10000ms, this is the first node
  peers.broadcastMessage('h');
  console.log('syncing in progress...');

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
    const alreadyAwarded = await hasBonusAwarded(this.userInitials);

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
};

const getTransaction = function (transactionNumber) {
  /* 
  • <GET_TRANS>: <GCMD> <TRN>
    • Where
    • <GCMD>: ASCII Character ‘g’
    • <TRN>: 16-bit transaction number encoded in big-endian ordering

  • Replies back with a message containing a <NEW_TRANS> command for the requested
  transaction
  • <OK_MSG>: <OCMD>
    • Where
    • <OCMD>: ASCII Character ‘o’
  • <NOK_MSG>: <FCMD>
    • Where
    • <FCMD>: ASCII Character ‘f’
*/
};

const addTransaction = function (
  transactionNumber,
  fromUsername,
  toUsername,
  transactionTme
) {
  /*  
  • <NEW_TRANS>: <NCMD> <TRN> <FROM_USR> <TO_USR> <TR_TIME>
    • Where:
    • <NCMD>: ASCII Character ‘n’
    • <TRN>: 16-bit transaction number encoded in big-endian ordering
    • <FROM_USR>: The username, 2 characters, who is sending the 1 WBE
    • <TO_USER>: The username, 2 characters, who is receiving the 1 WBE
    • <TR_TIME>: The transaction time as an epoch/UNIX timestamp (32-bit, big-endian)

  • Replies back <OK_MSG> if fine otherwise <NOK_MSG>
*/
};

const replaceTransaction = function (
  transactionNumber,
  fromUsername,
  toUsername,
  transactionTme
) {
  // same as newTransaction
};

const setTransactions = function (key, value) {
  this.transactions[key] = value;
};

const getTransactionByNumber = function (transactionNumber) {
  const ledgerTransaction =
    transactions &&
    transactions.filter((t) => t.split(' ')[0] === transactionNumber);

  // console.log('ledgerTransaction: ', ledgerTransaction);
  return ledgerTransaction[0];
};

const getReceivedTransactionsByUser = function (userInitials) {
  const ledgerTransactions =
    transactions &&
    transactions.filter((t) => t.split(' ')[2] === userInitials);

  // console.log('ledgerTransaction: ', ledgerTransaction);
  return ledgerTransactions;
};

const getPendingTransactionsByUser = function (_userInitials) {
  const ledgerTransactions =
    transactions &&
    transactions.filter((t) => {
      const splittedTxn = t.split(' ');
      return (
        splittedTxn[2] === _userInitials &&
        parseInt(splittedTxn[4]) === 0 &&
        transactions.filter((txn) => {
          console.log(
            parseInt(txn.split(' ')[4]) === 1 &&
              txn.split(' ')[5] === splittedTxn[0]
          );

          return (
            parseInt(txn.split(' ')[4]) === 1 &&
            txn.split(' ')[5] === splittedTxn[0]
          );
        }).length === 0
      );
    });

  // console.log('ledgerTransaction: ', ledgerTransaction);
  return ledgerTransactions;
};

const getApprovedTransactionByNumber = function (_txnNumber) {
  const ledgerTransactions =
    transactions &&
    transactions.filter((t) => {
      const splittedTxn = t.split(' ');
      return (
        splittedTxn[2] === userInitials &&
        splittedTxn[4] === 1 &&
        splittedTxn[5] === _txnNumber
      );
    });

  // console.log('ledgerTransaction: ', ledgerTransaction);
  return ledgerTransactions;
};

const getApprovedTransactionsByUser = function (_userInitials) {
  const ledgerTransactions =
    transactions &&
    transactions.filter((t) => {
      const splittedTxn = t.split(' ');
      return splittedTxn[2] === _userInitials && parseInt(splittedTxn[4]) === 1;
    });

  // console.log('ledgerTransaction: ', ledgerTransaction);
  return ledgerTransactions;
};

const getSentTransactionsByUser = function (_userInitials) {
  const ledgerTransactions =
    transactions &&
    transactions.filter((t) => t.split(' ')[1] === _userInitials);

  // console.log('ledgerTransaction: ', ledgerTransaction);
  return ledgerTransactions;
};

const hasBonusAwarded = async function (_userInitials) {
  const userTransactions = await getReceivedTransactionsByUser(_userInitials);

  const awardedTransactions =
    userTransactions &&
    userTransactions.filter((t) => t.split(' ')[1] === '00');

  return awardedTransactions && awardedTransactions.length ? true : false;
};

// User can check self balance using command: balance
const checkBalance = function (_userInitials) {
  const tokensReceivedAndApproved = getApprovedTransactionsByUser(
    _userInitials
  );
  const tokensSent = getSentTransactionsByUser(_userInitials);

  return tokensReceivedAndApproved.length - tokensSent.length;
};

// User can check pending transactions using command: pending
const pendingTransactions = function (_userInitials) {
  const transactionsReceived = getPendingTransactionsByUser(_userInitials);

  return transactionsReceived;
};

/*
• Transfer:
• <TRN>, <FROM_USR>, <TO_USER>, <TR_TIME>
• <APPROVED>: True (byte with value of 1)
• <APPROVE_TRN>: 16-bit value of 0
• Transfer Requiring Approval:
• <TRN>, <FROM_USR>, <TO_USER>, <TR_TIME>,
• <APPROVED>: False (byte with value of 0)
• <APPROVE_TRN>: 16-bit value of 0
• Approval of Transfer:
• <TRN>
• <FROM_USR>: “00”
• <TO_USER>: <the user initials logged in>
• <TR_TIME>
• <APPROVED>: True (byte with value of 0)
• <APPROVE_TRN>: 16-bit <trn> value of transaction requiring approval being approved
*/
//User can approve his/her pending transactions
const approveTransaction = function (_txnNumber) {
  const txn = getTransactionByNumber(_txnNumber, this.transactions);

  if (!txn) {
    console.log('Oops! transaction not found');
    return;
  }

  const splittedTxn = txn.split(' ');

  if (splittedTxn[2] !== this.userInitials) {
    console.log(
      "Oops! you can't approve a transaction that does not belong to you"
    );
    return;
  }

  const approvedTxn = getApprovedTransactionByNumber(_txnNumber);
  console.log('approvedTxn: ', approvedTxn);

  if (approvedTxn.length) {
    console.log('Oops! the transaction is approved already');
    return;
  }

  // console.log(`send 1 WBE to ${receiverInitials}`);
  const timestamp = new Date().getTime();
  const transactionNumber = this.localTrnCount;

  const txnTimeBE = util.NumberToBigEndian(Math.floor(timestamp / 1000), 32);

  const transactionCmd = `n ${transactionNumber} 00 ${this.userInitials} ${timestamp} 1 ${_txnNumber}`;
  const response = protocol.NEW_TRANS(transactionCmd.split(' '));

  if (response === 'o') {
    peers.broadcastMessage(transactionCmd);
  }
};

// User can send 1 WBE to another user using command: send <user initials> e.g. send wa
const sendWBE = function (receiverInitials) {
  if (receiverInitials === this.userInitials) {
    console.log("Oops! you can't send token to yourself");
    return;
  }

  if (checkBalance(this.userInitials) < 1) {
    console.log("Oops! you don't have sufficient balance");
    return;
  }

  // console.log(`send 1 WBE to ${receiverInitials}`);
  const timestamp = new Date().getTime();
  const transactionNumber = this.localTrnCount;

  const txnTimeBE = util.NumberToBigEndian(Math.floor(timestamp / 1000), 32);

  const transactionCmd = `n ${transactionNumber} ${this.userInitials} ${receiverInitials} ${timestamp} 0 0`;
  const response = protocol.NEW_TRANS(transactionCmd.split(' '));

  if (response === 'o') {
    peers.broadcastMessage(transactionCmd);
  }
};

export default {
  localTrnCount,
  networkTrnCount,
  transactions,
  userInitials,
  setTransactions,
  synchronize,
  getTransaction,
  addTransaction,
  replaceTransaction,
  checkBalance,
  sendWBE,
  getTransactionByNumber,
  getReceivedTransactionsByUser,
  getSentTransactionsByUser,
  pendingTransactions,
  approveTransaction,
};
