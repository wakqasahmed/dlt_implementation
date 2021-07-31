// 'use strict';
// class Transaction {
//   constructor(_fromAccount, _toAccount) {
//     this.fromAccount = _fromAccount;
//     this.toAccount = _toAccount;
//     this.amount = 1;
//     this.hash = null;
//   }

//   calculateHash = function () {
//     let txn = {
//       from_ac: this.fromAccount,
//       to_ac: this.toAccount,
//       amount: this.amount,
//     };

//     this.hash = CryptoJS.SHA256(txn).toString();
//     txn.hash = this.hash;
//     console.log('Txn: ', txn);
//     return txn;
//   };
// }

// export default { Transaction };

let txn = {
  from_ac: null,
  to_ac: null,
  amount: 0,
  hash: null,
};

export default { txn };
