/*
<COMMAND>

1) <NEW_TRANS> starts with ASCII character 'n'
  • <NEW_TRANS>: <NCMD> <TRN> <FROM_USR> <TO_USR> <TR_TIME>
2) <HIGHEST_TRN> starts with ASCII character 'h'
  • <HIGHEST_TRN>: <HCMD>
3) <GET_TRANS> starts with ASCII character 'g'
  • <GET_TRANS>: <GCMD> <TRN>
4) <HIGHEST_TRN_RES> starts with ASCII character 'm'
  • <HIGHEST_TRN_RES>: <MCMD> <TRN>
5) <OK_MSG> starts with ASCII character 'o'
  • <OK_MSG>: <OCMD>
6) <NOK_MSG> starts with ASCII character 'f'
  • <NOK_MSG>: <FCMD>
*/
import peers from './peers';
import state from './state';
import util from './util';

const processMessage = function (data) {
  // console.log('Before getting charAt: ', data.message.toString());
  const commandPrefix = data.message.toString().charAt(0);

  switch (commandPrefix) {
    case 'n':
      {
        const transactionData = data.message.toString().split(' ');

        // const ledgerTransaction =
        //   state.transactions &&
        //   state.transactions.filter(
        //     (t) => t.split(' ')[0] === transactionData[1]
        //   );

        const ledgerTransaction = state.getTransactionByNumber(
          transactionData[1]
        );
        // console.log('ledgerTransaction: ', ledgerTransaction);

        //add the given transaction if not found OR replace if the given transaction has older timestamp
        if (
          !ledgerTransaction ||
          !ledgerTransaction.length ||
          transactionData[3] < ledgerTransaction.split(' ')[0]
        ) {
          const response = NEW_TRANS(transactionData);

          // if (response === 'o') {
          //   console.log('time to broadcast newly added transaction?');
          // }
        }
      }
      break;
    case 'h':
      {
        peers.broadcastMessage(HIGHEST_TRN());
        // return HIGHEST_TRN();
      }
      break;
    case 'm':
      {
        const splittedCmd = data.message.toString().split(' ');
        const transactionNumber = splittedCmd[1];

        if (transactionNumber !== null && transactionNumber !== undefined) {
          const cmd = HIGHEST_TRN_RES(transactionNumber);
          if (cmd) {
            peers.broadcastMessage(HIGHEST_TRN_RES(transactionNumber));
          }

          // return HIGHEST_TRN_RES(transactionNumber);
        }
      }
      break;
    case 'g':
      {
        // console.log('transaction number: ', data.message.toString().split(' ')[1]);
        const transactionData = data.message.toString().split(' ');
        const transaction = GET_TRANS(transactionData);

        if (transaction) {
          peers.broadcastMessage(`n ${transaction}`);
        }
      }
      break;
    case 'o':
      {
        console.log('ok received');
      }
      break;
    case 'f':
      {
        console.log('not ok received');
      }
      break;
  }
};

//functionality to process each message
const processNewTransCmd = function (data) {};

//functionality to create new messages
const sendNewTransaction = function (transaction) {};

/*
• The following protocol of messages should be implemented:
• Each message has the structure:
• <STX><LEN><COMMAND><ETX>
• Where:
• <STX>: ASCII CHARACTER 2
• <LEN>: 1 byte which indicates the number of bytes in <COMMAND>
• <COMMAND>: the specific command being implemented described below
• <ETX>: ASCII CHARACTER 3

• A command can be:
• <COMMAND>: <NEW_TRANS> OR <HIGHEST_TRN> OR <GET_TRANS>
OR <HIGHEST_TRN_RES> OR <OK_MSG> OR <NOK_MSG>
*/
const createMessage = function (message) {
  const encodedMessage = `${util.dec2bin(2)} ${
    message.length
  } ${message} ${util.dec2bin(3)}`;
  // console.log('encodedMessage after createMessage: ', encodedMessage);
  return encodedMessage;
};

/*
• <HIGHEST_TRN>: <HCMD>
• Where
• <HCMD>: ASCII Character ‘h’

• Replies back with a message containing a <HIGHEST_TRN_RES> command
*/
const HIGHEST_TRN = function () {
  return 'm ' + state.localTrnCount;
};

/*
• <HIGHEST_TRN_RES>: <MCMD> <TRN>
• Where
• <MCMD>: ASCII Character ‘m’
• <TRN>: 16-bit transaction number encoded in big-endian ordering
*/
const HIGHEST_TRN_RES = function (transactionNumber) {
  // console.log('HIGHEST_TRN_RES m received');
  // console.log('local count: ', state.localTrnCount);
  // console.log('network count: ', state.networkTrnCount);
  // console.log('external network count: ', transactionNumber[1]);

  if (state.networkTrnCount < parseInt(transactionNumber)) {
    state.networkTrnCount = parseInt(transactionNumber);
  }

  if (state.localTrnCount < state.networkTrnCount) {
    console.log('resyncing in progress...');

    for (let i = 0; i < state.networkTrnCount; i++) {
      const transactionIndex = state.transactions[i] || null;
      // const transactionNumber = state.transactions[i].split(' ')[0] || null;

      //Transaction is missing in the ledger
      if (transactionIndex === null) {
        return `g ${i}`;
      }
    }
    return null;
  }
};

/*
• <NEW_TRANS>: <NCMD> <TRN> <FROM_USR> <TO_USR> <TR_TIME> <APPROVED> <APPROVE_TRN>
• Where:
• <NCMD>: ASCII Character ‘n’
• <TRN>: 16-bit transaction number encoded in big-endian ordering
• <TR_TIME>: The transaction time as an epoch/UNIX timestamp (32-bit, big-endian)
• <FROM_USR>: The username, 2 characters, who is sending the 1 SBB
• <TO_USER>: The username, 2 characters, who is receiving the 1 SBB
• <APPROVED>: 1 byte, 0 if not approved, 1 if appoved
• <APPROVE_TRN>: 16-bit transaction number (big-endian) of a transfer requiring approval being
approved
• Replies back <OK_MSG> if fine otherwise <NOK_MSG>
*/
const NEW_TRANS = function (transactionData) {
  try {
    state.setTransactions(
      transactionData[1],
      `${transactionData[1]} ${transactionData[2]} ${transactionData[3]} ${transactionData[4]} ${transactionData[5]} ${transactionData[6]}`
    );
    state.localTrnCount += 1;

    return OK_MSG;
  } catch (ex) {
    return NOK_MSG;
  }
};

const GET_TRANS = function (transactionData) {
  const ledgerTransaction = state.getTransactionByNumber(transactionData[1]);

  if (ledgerTransaction && ledgerTransaction.length) {
    return `${ledgerTransaction}`;
  }

  return null;
};

/*
• <OK_MSG>: <OCMD>
• Where
• <OCMD>: ASCII Character ‘o’
*/
const OK_MSG = function () {
  return 'o';
};

/*
• <NOK_MSG>: <FCMD>
• Where
• <FCMD>: ASCII Character ‘f’
*/
const NOK_MSG = function () {
  return 'f';
};

export default {
  processMessage,
  createMessage,
  NEW_TRANS,
};
