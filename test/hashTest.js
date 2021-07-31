import CryptoJS from 'crypto-js';

const test = async () => {
  const timestamp = Math.floor(new Date().getTime());

  const json1 = JSON.stringify({
    prevHash: 0,
    nonce: 0,
    timestamp: timestamp,
    //  transactions: [transaction.txn],
  });

  const hash1 = await CryptoJS.SHA256(json1);
  console.log('Hash1: ', hash1.toString());

  const json2 = JSON.stringify({
    prevHash: 0,
    nonce: 999,
    timestamp: timestamp,
    //  transactions: [transaction.txn],
  });

  const hash2 = await CryptoJS.SHA256(json2);
  console.log('Hash2: ', hash2.toString());
};

test();
