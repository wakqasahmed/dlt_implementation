import chain from './chain';

const getReceivedTransactionsByUser = function (_userWalletAddress) {
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

  // console.log('Received Ledger Transactions: ', ledgerTransactions[0]);
  return ledgerTransactions[0];
};

const getSentTransactionsByUser = function (_userWalletAddress) {
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

  // console.log('Sent Ledger Transactions: ', ledgerTransactions[0]);
  return ledgerTransactions[0];
};

// User can check self balance using command: balance
const checkBalance = function (_userWalletAddress) {
  const tokensReceivedAndApproved =
    getReceivedTransactionsByUser(_userWalletAddress);
  const tokensSent = getSentTransactionsByUser(_userWalletAddress);

  return tokensReceivedAndApproved.length - tokensSent.length;
};

export default {
  checkBalance,
  getReceivedTransactionsByUser,
  getSentTransactionsByUser,
};
