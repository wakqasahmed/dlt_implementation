// var n = 0x20005c98;
// var s = n.toString(16).match(/.{1,2}/g);
// s.push('0x');
// s.reverse().join('').toString(16); // ==> "0x985c0020" (= 2556166176)
// console.log(s + '\n');

// example taken from https://www.digital-detective.net/understanding-big-and-little-endian-byte-order/
function NumberToBigEndian(x, bit) {
  const buf = Buffer.allocUnsafe(4);

  switch (bit) {
    case 16:
      buf.writeUInt16BE(x, 0);
      break;
    case 32:
      buf.writeUInt32BE(x, 0);
      break;
  }
  return buf;
}

function BigEndianToHex(x, bit) {
  // const buf = Buffer.from([0x12, 0x34, 0x56, 0x78]);
  const buf = x;

  switch (bit) {
    case 16:
      // return buf.readUInt16BE(0);
      return buf.readUInt16BE(0).toString(16);
      break;
    case 32:
      return buf.readUInt32BE(0).toString(16);
      break;
  }

  return buf;
}

/*
// ArrayBuffer to String
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

// String to ArrayBuffer
function str2ab(str) {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}*/

const txnNumberBE = NumberToBigEndian(291, 16);
const txnNumber = BigEndianToHex(txnNumberBE, 16);

const txnTimeBE = NumberToBigEndian(
  Math.floor(new Date().getTime() / 1000),
  32
);
const txnTime = BigEndianToHex(txnTimeBE, 32);

console.log('txnNumber: ', parseInt(txnNumber, 16));
console.log('txnNumber in Hex: ', txnNumber);
console.log('txnNumberBE: ', txnNumberBE);

console.log('txnTime: ', parseInt(txnTime, 16));
console.log('txnTime in Hex: ', txnTime);
console.log('txnTimeBE: ', txnTimeBE);

const stx = parseInt('2', 16);
console.log('stx: ', stx);

const etx = parseInt('3', 16);
console.log('etx: ', etx);

// console.log('ab2str: ', Buffer.from([0x02, 0x03]).toString());

// var buf = Buffer.from('2');

// console.log(buf.toString());

// //Display the Buffer without converting it into a String:

// console.log(buf);

const arrA = Uint8Array.from([0x63, 0x64, 0x65, 0x66]); // 4 elements
const arrB = new Uint8Array(arrA.buffer, 1, 2); // 2 elements
console.log(arrA.buffer === arrB.buffer); // true

console.log('arrA: ', arrA);
const buf = Buffer.from(arrB.buffer);
console.log('buf: ', buf);
// Prints: <Buffer 63 64 65 66>
