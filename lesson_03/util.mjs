const getRandomInt = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};

const getRandomIntInclusive = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
};

const convert = (baseFrom, baseTo) => (number) =>
  parseInt(number, baseFrom).toString(baseTo);

const bin2dec = convert(2, 10);
const dec2bin = convert(10, 2);

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
/*
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
*/

function BigEndianToNumber(x, bit) {
  const buf = x;

  switch (bit) {
    case 16:
      // return buf.readUInt16BE(0);
      return buf.readUInt16BE(0).toString(10);
      break;
    case 32:
      return buf.readUInt32BE(0).toString(10);
      break;
  }

  return buf;
}

export default {
  getRandomInt,
  getRandomIntInclusive,
  bin2dec,
  dec2bin,
  NumberToBigEndian,
  // BigEndianToHex,
  BigEndianToNumber,
};
